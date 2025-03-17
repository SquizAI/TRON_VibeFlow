import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  IconButton,
  Tooltip,
  Paper
} from '@mui/material'
import { styled } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import NoteIcon from '@mui/icons-material/Note'
import TaskIcon from '@mui/icons-material/AssignmentTurnedIn'
import WorkflowIcon from '@mui/icons-material/AccountTree'
import ConceptIcon from '@mui/icons-material/Psychology'
import TagIcon from '@mui/icons-material/LocalOffer'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import useCanvasStore from '../../store/canvasStore'
import { ComponentBase } from '../../types/canvas'

// Styled components
const NavigatorRoot = styled(Paper)(() => ({
  backgroundColor: 'rgba(17, 17, 51, 0.95)',
  color: '#FFFFFF',
  borderRadius: 8,
  border: '1px solid rgba(65, 105, 225, 0.3)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  width: 300,
  maxHeight: '90vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(65, 105, 225, 0.5)',
    borderRadius: '4px',
  }
}))

const NavigatorItem = styled(ListItem)(() => ({
  borderRadius: 4,
  margin: '2px 0',
  '&:hover': {
    backgroundColor: 'rgba(65, 105, 225, 0.2)',
  },
  transition: 'all 0.2s ease'
}))

const NavigatorItemSelected = styled(NavigatorItem)(() => ({
  backgroundColor: 'rgba(65, 105, 225, 0.3)',
  '&:hover': {
    backgroundColor: 'rgba(65, 105, 225, 0.4)',
  },
}))

interface HierarchicalNavigatorProps {
  onItemSelect?: (id: string) => void
  onCreateItem?: (type: string, parentId?: string) => void
}

// Helper function to get the right icon for each component type
const getItemIcon = (type: string) => {
  switch (type) {
    case 'note':
      return <NoteIcon sx={{ color: '#4169E1' }} />
    case 'task':
      return <TaskIcon sx={{ color: '#41A9E1' }} />
    case 'workflow':
    case 'workflowNode':
      return <WorkflowIcon sx={{ color: '#6C41E1' }} />
    case 'concept':
      return <ConceptIcon sx={{ color: '#9C41E1' }} />
    case 'tag':
      return <TagIcon sx={{ color: '#7941E1' }} />
    default:
      return <NoteIcon sx={{ color: '#4169E1' }} />
  }
}

// Interface for tree items
interface TreeItem extends Omit<ComponentBase, 'children'> {
  children: TreeItem[]
  isOpen?: boolean
  level: number
}

const HierarchicalNavigator: React.FC<HierarchicalNavigatorProps> = ({ 
  onItemSelect, 
  onCreateItem 
}) => {
  const { components, selectComponent, selectedComponentId } = useCanvasStore()
  const [hierarchyItems, setHierarchyItems] = useState<TreeItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<string | null>(null)
  
  // Convert flat array of components to hierarchical structure
  useEffect(() => {
    if (components.length === 0) return

    // Create a map for O(1) lookups
    const itemMap = new Map<string, TreeItem>()
    
    // First pass: create TreeItems from components
    components.forEach(component => {
      itemMap.set(component.id, {
        ...component,
        children: [],
        isOpen: false,
        level: 0
      })
    })
    
    // Second pass: establish parent-child relationships
    const rootItems: TreeItem[] = []
    
    components.forEach(component => {
      const item = itemMap.get(component.id)
      
      if (item) {
        if (component.parentId && itemMap.has(component.parentId)) {
          // Add to parent's children
          const parent = itemMap.get(component.parentId)
          if (parent) {
            item.level = parent.level + 1
            parent.children.push(item)
          } else {
            rootItems.push(item)
          }
        } else {
          // No parent, so it's a root item
          rootItems.push(item)
        }
      }
    })
    
    // Sort items alphabetically by title
    const sortItems = (items: TreeItem[]): TreeItem[] => {
      return items.sort((a, b) => a.title.localeCompare(b.title)).map(item => {
        return {
          ...item,
          children: sortItems(item.children)
        }
      })
    }
    
    setHierarchyItems(sortItems(rootItems))
  }, [components])
  
  // Toggle item expansion
  const toggleItemOpen = (id: string) => {
    setHierarchyItems(prevItems => {
      const updateItems = (items: TreeItem[]): TreeItem[] => {
        return items.map(item => {
          if (item.id === id) {
            return { ...item, isOpen: !item.isOpen }
          } else if (item.children.length > 0) {
            return { ...item, children: updateItems(item.children) }
          }
          return item
        })
      }
      
      return updateItems(prevItems)
    })
  }
  
  // Handle item selection
  const handleItemSelect = (id: string) => {
    selectComponent(id)
    if (onItemSelect) {
      onItemSelect(id)
    }
  }
  
  // Handle create new item
  const handleCreateItem = (type: string, parentId?: string) => {
    if (onCreateItem) {
      onCreateItem(type, parentId)
    }
  }
  
  // Render a single tree item and its children recursively
  const renderTreeItem = (item: TreeItem) => {
    const hasChildren = item.children.length > 0
    const isSelected = selectedComponentId === item.id
    const ItemComponent = isSelected ? NavigatorItemSelected : NavigatorItem
    
    // Apply filtering if needed
    if (filter && item.type !== filter) {
      return null
    }
    
    // Apply search filtering
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      // Still render if any children match
      const hasMatchingChildren = item.children.some(child => 
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      if (!hasMatchingChildren) {
        return null
      }
    }
    
    return (
      <React.Fragment key={item.id}>
        <ItemComponent
          onClick={() => handleItemSelect(item.id)}
          sx={{ pl: item.level * 2 + 1 }}
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                toggleItemOpen(item.id)
              }}
              sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {item.isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          )}
          
          {!hasChildren && <Box sx={{ width: 28, mr: 1 }} />}
          
          <ListItemIcon sx={{ minWidth: 36 }}>
            {getItemIcon(item.type)}
          </ListItemIcon>
          
          <ListItemText 
            primary={item.title} 
            primaryTypographyProps={{ 
              noWrap: true,
              fontSize: 14,
              fontWeight: isSelected ? 'bold' : 'normal'
            }}
          />
          
          <Tooltip title={`Create item inside ${item.title}`}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleCreateItem(item.type, item.id)
              }}
              sx={{ 
                opacity: 0.6, 
                '&:hover': { opacity: 1 },
                color: '#4169E1'
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ItemComponent>
        
        {hasChildren && (
          <Collapse in={item.isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderTreeItem(child))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }
  
  return (
    <NavigatorRoot>
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" color="#4169E1" fontWeight="bold">
            Navigator
          </Typography>
          
          <Box>
            <Tooltip title="Filter by type">
              <IconButton
                size="small"
                sx={{ color: filter ? '#4169E1' : 'rgba(255, 255, 255, 0.7)' }}
                onClick={() => setFilter(filter ? null : 'note')}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Search">
              <IconButton
                size="small"
                sx={{ color: searchQuery ? '#4169E1' : 'rgba(255, 255, 255, 0.7)' }}
                onClick={() => setSearchQuery(searchQuery ? '' : 'test')}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Filter tabs */}
        {filter && (
          <Box 
            display="flex" 
            gap={1} 
            sx={{ 
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: '4px',
              },
            }}
          >
            {['note', 'task', 'workflow', 'concept', 'tag'].map((type) => (
              <Box 
                key={type}
                sx={{
                  bgcolor: filter === type ? 'rgba(65, 105, 225, 0.3)' : 'rgba(65, 105, 225, 0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  minWidth: 'fit-content',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setFilter(type)}
              >
                {getItemIcon(type)}
                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                  {type}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      
      <List component="nav" aria-label="component hierarchy">
        {hierarchyItems.map(item => renderTreeItem(item))}
      </List>
      
      {/* Quick add buttons */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(65, 105, 225, 0.2)'
        }}
      >
        {['note', 'task', 'concept'].map((type) => (
          <Tooltip key={type} title={`Create new ${type}`}>
            <IconButton
              size="small"
              onClick={() => handleCreateItem(type)}
              sx={{ 
                bgcolor: 'rgba(65, 105, 225, 0.1)',
                '&:hover': { bgcolor: 'rgba(65, 105, 225, 0.2)' },
              }}
            >
              {getItemIcon(type)}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </NavigatorRoot>
  )
}

export default HierarchicalNavigator
