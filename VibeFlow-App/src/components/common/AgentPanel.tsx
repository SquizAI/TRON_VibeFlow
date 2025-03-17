import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'

// Agent capability types
interface AgentCapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'search' | 'creation' | 'analysis' | 'visualization';
  available: boolean;
}

// Styled components
const PanelHeader = styled(Box)(({ theme }) => ({
  padding: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
}))

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    },
  },
}))

const CategoryTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 'auto',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}))

const CapabilityItem = styled(ListItem)(({ theme }) => ({
  marginBottom: 8,
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  },
}))

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  color: theme.palette.primary.main,
}))

const AvailabilityChip = styled(Box)(({ theme }) => ({
  fontSize: '0.75rem',
  padding: '2px 8px',
  borderRadius: 12,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(49, 196, 141, 0.2)' : 'rgba(49, 196, 141, 0.1)',
  color: '#31C48D',
  marginTop: 4,
}))

// Mock capabilities data
const mockCapabilities: AgentCapability[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for real-time information on any topic',
    icon: <SearchIcon />,
    category: 'search',
    available: true
  },
  {
    id: 'content-generator',
    name: 'Content Generator',
    description: 'Generate text content based on your requirements',
    icon: <AddCircleOutlineIcon />,
    category: 'creation',
    available: true
  },
  {
    id: 'task-analyzer',
    name: 'Task Analyzer',
    description: 'Analyze and organize tasks, suggest priorities',
    icon: <AllInclusiveIcon />,
    category: 'analysis',
    available: true
  },
  {
    id: 'data-visualizer',
    name: 'Data Visualizer',
    description: 'Create visual representations of your data',
    icon: <AllInclusiveIcon />,
    category: 'visualization',
    available: true
  },
  {
    id: 'image-generator',
    name: 'Image Generator',
    description: 'Generate images based on text descriptions',
    icon: <AddCircleOutlineIcon />,
    category: 'creation',
    available: true
  },
  {
    id: 'conversation-assistant',
    name: 'Conversation Assistant',
    description: 'Have a conversation to brainstorm or solve problems',
    icon: <AllInclusiveIcon />,
    category: 'analysis',
    available: true
  }
]

// Component implementation
const AgentPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'search' | 'creation'>('all')
  
  // Toggle the panel open/closed
  const togglePanel = () => {
    setIsOpen(!isOpen)
  }
  
  // Filter capabilities based on search and active tab
  const filteredCapabilities = mockCapabilities.filter(capability => {
    // Filter by search query
    const matchesSearch = 
      capability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capability.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by tab
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'search' && capability.category === 'search') ||
      (activeTab === 'creation' && capability.category === 'creation')
    
    return matchesSearch && matchesTab
  })
  
  return (
    <Box 
      className={`agent-panel ${isOpen ? 'open' : ''}`}
      sx={{
        width: 320,
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        zIndex: 100,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.1)'
      }}
    >
      <PanelHeader>
        <Typography variant="h6" component="div" color="primary">
          • Agent Capabilities
        </Typography>
        <IconButton onClick={togglePanel} edge="end">
          <CloseIcon />
        </IconButton>
      </PanelHeader>
      
      <Box sx={{ p: 2 }}>
        <SearchField
          fullWidth
          placeholder="Search capabilities..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />
      </Box>
      
      <Box sx={{ px: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <CategoryTab value="all" label="All Tools" />
          <CategoryTab value="search" label="Search" />
          <CategoryTab value="creation" label="Creation" />
        </Tabs>
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List disablePadding>
          {filteredCapabilities.map((capability) => (
            <CapabilityItem key={capability.id} button>
              <ListItemIcon sx={{ minWidth: 56 }}>
                <IconContainer>
                  {capability.icon}
                </IconContainer>
              </ListItemIcon>
              <ListItemText 
                primary={capability.name}
                secondary={
                  <>
                    {capability.description}
                    <AvailabilityChip component="span">
                      available
                    </AvailabilityChip>
                  </>
                }
                primaryTypographyProps={{
                  fontWeight: 500,
                  variant: 'body1'
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  component: 'div'
                }}
              />
            </CapabilityItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export default AgentPanel
