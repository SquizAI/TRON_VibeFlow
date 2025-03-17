import React, { useState, useEffect } from 'react'
import { Box, Typography, IconButton, Paper, Chip, Dialog, DialogTitle, DialogContent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import FilterListIcon from '@mui/icons-material/FilterList'
import KnowledgeGraph from './KnowledgeGraph'
import useCanvasStore from '../../store/canvasStore'

interface KnowledgeGraphViewProps {
  open: boolean
  onClose: () => void
}

// Mock data generator for demonstration purposes
// In a real app, this would use actual data from the canvas store
const generateMockGraphData = (components: any[]) => {
  const nodes = components.map((component, index) => {
    // Use actual positions from components, but scale them down for graph view
    const x = component.x / 5
    const y = component.y / 5
    
    return {
      id: component.id,
      title: component.title || `Note ${index + 1}`,
      type: component.type as 'note' | 'task' | 'concept' | 'tag',
      x,
      y,
      radius: 30,
      color: component.color || '#4169E1',
      connections: []
    }
  })
  
  // Generate some mock connections based on content similarity or proximity
  const edges = []
  
  for (let i = 0; i < nodes.length; i++) {
    // Connect to 1-3 random nodes
    const connections = Math.floor(Math.random() * 3) + 1
    
    for (let j = 0; j < connections; j++) {
      // Pick a random target that's not self
      let targetIdx
      do {
        targetIdx = Math.floor(Math.random() * nodes.length)
      } while (targetIdx === i)
      
      // Add connection
      const connectionTypes = ['related', 'parent', 'reference', 'tag'] as const
      edges.push({
        source: nodes[i].id,
        target: nodes[targetIdx].id,
        type: connectionTypes[Math.floor(Math.random() * connectionTypes.length)],
        strength: Math.random() * 0.5 + 0.5 // Between 0.5 and 1.0
      })
      
      // Update node connections
      nodes[i].connections.push(nodes[targetIdx].id)
    }
  }
  
  return { nodes, edges }
}

const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ open, onClose }) => {
  const { components, selectComponent } = useCanvasStore()
  const [filter, setFilter] = useState<string | null>(null)
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] })
  
  // Generate graph data when components change
  useEffect(() => {
    if (components.length > 0) {
      const data = generateMockGraphData(components)
      setGraphData(data)
    }
  }, [components])
  
  // Handle node click to select the corresponding component
  const handleNodeClick = (nodeId: string) => {
    selectComponent(nodeId)
  }
  
  // Filter types
  const filterTypes = ['All', 'Notes', 'Tasks', 'Concepts', 'Tags']
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#111122',
          height: '80vh',
          border: '1px solid rgba(65, 105, 225, 0.3)'
        }
      }}
    >
      <DialogTitle sx={{ color: 'white', backgroundColor: '#111133', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="#4169E1">
          Knowledge Graph
        </Typography>
        <Box>
          <IconButton color="primary" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ padding: 0, position: 'relative' }}>
        {/* Graph controls */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            backgroundColor: 'rgba(20, 20, 40, 0.7)',
            padding: 1,
            borderRadius: 2,
            border: '1px solid rgba(65, 105, 225, 0.5)'
          }}
        >
          <Box display="flex" flexDirection="column" gap={1}>
            <IconButton color="primary" size="small">
              <ZoomInIcon />
            </IconButton>
            <IconButton color="primary" size="small">
              <ZoomOutIcon />
            </IconButton>
            <IconButton color="primary" size="small">
              <FilterListIcon />
            </IconButton>
          </Box>
        </Paper>
        
        {/* Filter chips */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: 'rgba(20, 20, 40, 0.7)',
            padding: 1,
            borderRadius: 2,
            border: '1px solid rgba(65, 105, 225, 0.5)'
          }}
        >
          <Box display="flex" gap={1}>
            {filterTypes.map(type => (
              <Chip
                key={type}
                label={type}
                clickable
                color={filter === type || (type === 'All' && !filter) ? 'primary' : 'default'}
                onClick={() => setFilter(type === 'All' ? null : type)}
                size="small"
                sx={{ 
                  backgroundColor: filter === type ? 'rgba(65, 105, 225, 0.8)' : 'rgba(65, 105, 225, 0.2)',
                  color: 'white'
                }}
              />
            ))}
          </Box>
        </Paper>
        
        {/* Knowledge graph visualization */}
        <KnowledgeGraph
          initialNodes={graphData.nodes}
          initialEdges={graphData.edges}
          onNodeClick={handleNodeClick}
        />
        
        {/* Legend */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 10,
            backgroundColor: 'rgba(20, 20, 40, 0.7)',
            padding: 1,
            borderRadius: 2,
            border: '1px solid rgba(65, 105, 225, 0.5)'
          }}
        >
          <Typography variant="subtitle2" color="white" gutterBottom>
            Connection Types:
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={20} height={2} bgcolor="rgba(65, 105, 225, 0.6)" />
              <Typography variant="caption" color="white">Related</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={20} height={2} bgcolor="rgba(0, 180, 0, 0.6)" />
              <Typography variant="caption" color="white">Parent/Child</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={20} height={2} bgcolor="rgba(200, 130, 0, 0.6)" sx={{ borderStyle: 'dashed' }} />
              <Typography variant="caption" color="white">Reference</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={20} height={2} bgcolor="rgba(150, 150, 150, 0.6)" />
              <Typography variant="caption" color="white">Tag</Typography>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  )
}

export default KnowledgeGraphView
