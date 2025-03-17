import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tabs, 
  Tab, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  TextField,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { FlowNode, NODE_TYPES, DEFAULT_NODE_CONFIG } from '../../types/automation';

interface NodeDetailPanelProps {
  node: FlowNode;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const StyledChip = styled(Chip)(() => ({
  backgroundColor: '#4169E1',
  color: '#FFFFFF',
  fontWeight: 'medium',
  marginRight: 8,
  marginBottom: 8,
  '& .MuiChip-label': {
    padding: '0 10px',
  }
}));

const GlowingPaper = styled(Paper)(() => ({
  backgroundColor: '#1F1F1F',
  padding: 16,
  margin: '16px 0',
  borderRadius: 8,
  boxShadow: '0 0 10px rgba(65, 105, 225, 0.2)',
  border: '1px solid #2A2A2A',
}));

const JsonDisplay = styled(Box)(() => ({
  backgroundColor: '#121212',
  padding: 16,
  borderRadius: 6,
  fontFamily: 'monospace',
  fontSize: 12,
  overflowX: 'auto',
  color: '#E0E0E0',
  border: '1px solid #2A2A2A',
  '& .json-key': {
    color: '#ff66c4',
  },
  '& .json-value': {
    color: '#4169E1',
  },
  '& .json-string': {
    color: '#7ed321',
  },
  '& .json-number': {
    color: '#FAB005',
  },
  '& .json-boolean': {
    color: '#FF7846',
  },
  '& .json-null': {
    color: '#9E9E9E',
  }
}));

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`node-tabpanel-${index}`}
      aria-labelledby={`node-tab-${index}`}
      {...other}
      style={{ overflow: 'auto', height: 'calc(100vh - 150px)' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `node-tab-${index}`,
    'aria-controls': `node-tabpanel-${index}`,
  };
}

// Helper to format JSON for display
const formatJson = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

// Helper to colorize JSON for display
const colorizeJson = (json: string): React.ReactNode => {
  if (!json) return null;
  
  // Simple colorization for demonstration
  const colorized = json
    .replace(/("[^"]*"):/g, '<span class="json-key">$1</span>:')
    .replace(/(: )"([^"]*)"/g, '$1<span class="json-string">"$2"</span>')
    .replace(/(: )(\d+\.?\d*)/g, '$1<span class="json-number">$2</span>')
    .replace(/(: )(true|false)/g, '$1<span class="json-boolean">$2</span>')
    .replace(/(: )(null)/g, '$1<span class="json-null">$2</span>');

  return <div dangerouslySetInnerHTML={{ __html: colorized }} />;
};

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  
  // Extract node type configuration
  const nodeType = node.type.includes(':') ? node.type.split(':')[1] : node.type;
  const nodeConfig = NODE_TYPES[nodeType] || DEFAULT_NODE_CONFIG;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #2A2A2A'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 28, 
              height: 28, 
              backgroundColor: nodeConfig.color,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 2,
              boxShadow: `0 0 10px ${nodeConfig.color}`
            }}
          >
            <SettingsIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
          </Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {node.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="close" sx={{ color: '#FFFFFF' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Node basic info */}
      <Box sx={{ p: 2, backgroundColor: '#151515' }}>
        <Typography variant="subtitle2" sx={{ color: '#999999', mb: 1 }}>
          ID: {node.id}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
          <StyledChip label={nodeConfig.category} size="small" />
          <StyledChip label={`v${node.data.version || '1'}`} size="small" />
        </Box>
        
        <Typography variant="body2" sx={{ color: '#CCCCCC', my: 1 }}>
          {nodeConfig.description}
        </Typography>
      </Box>
      
      {/* Tabs for different sections */}
      <Box sx={{ width: '100%', borderBottom: 1, borderColor: '#2A2A2A' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          textColor="inherit"
          indicatorColor="secondary"
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              color: '#999999',
              '&.Mui-selected': { 
                color: '#4169E1' 
              } 
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: '#4169E1',
              height: 3
            }
          }}
        >
          <Tab icon={<InfoIcon />} label="Config" {...a11yProps(0)} />
          <Tab icon={<CodeIcon />} label="Data" {...a11yProps(1)} />
          <Tab icon={<TimelineIcon />} label="Flow" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      {/* Tab panels */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Configuration
        </Typography>
        
        <GlowingPaper>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff66c4' }}>
            Parameters
          </Typography>
          
          <List dense>
            {Object.entries(node.data).filter(([key]) => key !== 'metadata' && key !== 'mapper' && key !== 'version').map(([key, value]) => (
              <ListItem key={key} sx={{ py: 0.5 }}>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#BBBBBB' }}>
                        {key}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4169E1' }}>
                        {typeof value === 'object' ? '[Object]' : String(value)}
                      </Typography>
                    </Box>
                  } 
                />
              </ListItem>
            ))}
          </List>
          
          {Object.keys(node.data).filter(key => key !== 'metadata' && key !== 'mapper' && key !== 'version').length === 0 && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#999999' }}>
              No parameters configured
            </Typography>
          )}
        </GlowingPaper>
        
        <GlowingPaper>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff66c4' }}>
            Position
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="X"
              size="small"
              value={node.position.x}
              disabled
              sx={{ 
                width: 100,
                input: { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#2A2A2A' },
                },
                '& .MuiInputLabel-root': { color: '#999999' }
              }}
            />
            <TextField
              label="Y" 
              size="small"
              value={node.position.y}
              disabled
              sx={{ 
                width: 100,
                input: { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#2A2A2A' },
                },
                '& .MuiInputLabel-root': { color: '#999999' }
              }}
            />
          </Box>
        </GlowingPaper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Data Mapping
        </Typography>
        
        <GlowingPaper>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff66c4' }}>
            Input Mappings
          </Typography>
          
          {node.data.mapper && Object.keys(node.data.mapper).length > 0 ? (
            <JsonDisplay>
              {colorizeJson(formatJson(node.data.mapper))}
            </JsonDisplay>
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#999999' }}>
              No input mappings configured
            </Typography>
          )}
        </GlowingPaper>
        
        <GlowingPaper>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff66c4' }}>
            Metadata
          </Typography>
          
          {node.data.metadata ? (
            <JsonDisplay sx={{ maxHeight: 300, overflow: 'auto' }}>
              {colorizeJson(formatJson(node.data.metadata))}
            </JsonDisplay>
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#999999' }}>
              No metadata available
            </Typography>
          )}
        </GlowingPaper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Flow Control
        </Typography>
        
        <GlowingPaper>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff66c4' }}>
            Routes
          </Typography>
          
          {node.data.routes ? (
            <Box>
              {Array.isArray(node.data.routes) && node.data.routes.map((route: any, index: number) => (
                <Paper 
                  key={index}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: '#121212',
                    border: '1px solid #2A2A2A',
                    borderLeft: `4px solid ${index === 0 ? '#4169E1' : '#ff66c4'}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Route {index + 1}
                  </Typography>
                  
                  {route.condition && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#999999' }}>
                        Condition:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', fontFamily: 'monospace' }}>
                        {route.condition}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" sx={{ color: '#999999' }}>
                    Flow contains {route.flow?.length || 0} nodes
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#999999' }}>
              This node does not contain routes
            </Typography>
          )}
        </GlowingPaper>
        
        <GlowingPaper>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff66c4' }}>
            Error Handling
          </Typography>
          
          {node.data.onerror ? (
            <Box>
              <Typography variant="body2" sx={{ color: '#CCCCCC' }}>
                This node has error handling configured with {node.data.onerror.length} actions.
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#999999' }}>
              No error handling configured
            </Typography>
          )}
        </GlowingPaper>
      </TabPanel>
      
      {/* Footer with action buttons */}
      <Box sx={{ 
        mt: 'auto', 
        p: 2, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        borderTop: '1px solid #2A2A2A' 
      }}>
        <Button 
          variant="outlined"
          sx={{ 
            mr: 1,
            borderColor: '#2A2A2A',
            color: '#CCCCCC',
            '&:hover': {
              borderColor: '#4169E1',
              backgroundColor: 'rgba(65, 105, 225, 0.1)'
            }
          }}
        >
          Duplicate
        </Button>
        <Button 
          variant="contained"
          sx={{ 
            backgroundColor: '#4169E1',
            '&:hover': {
              backgroundColor: '#3A5FCC'
            }
          }}
        >
          Edit Node
        </Button>
      </Box>
    </Box>
  );
};

export default NodeDetailPanel;
