import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import AddIcon from '@mui/icons-material/Add'
import useCanvasStore from '../../store/canvasStore'
import { v4 as uuidv4 } from 'uuid'

// Styled components
const ToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 16,
  top: 80,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(26, 35, 48, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  borderRadius: 8,
  padding: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  zIndex: 100,
}))

const ToolButton = styled(IconButton)(({ theme }) => ({
  margin: '4px 0',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  },
  width: 40,
  height: 40,
}))

// Interface for toolbar panel
interface ToolbarPanelProps {
  scale: number
  position: { x: number; y: number }
}

const ToolbarPanel: React.FC<ToolbarPanelProps> = ({ scale, position }) => {
  const { addComponent } = useCanvasStore()
  
  // Add a Note
  const handleAddNote = () => {
    addComponent({
      id: uuidv4(),
      type: 'note',
      title: 'New Note',
      x: -position.x / scale + 300, // Convert canvas coords to world coords
      y: -position.y / scale + 200,
      width: 300,
      height: 300,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: 'Add your notes here...',
      isLocked: false,
      tags: ['new'],
      color: '#3282F6'
    })
  }
  
  // Add a Task
  const handleAddTask = () => {
    addComponent({
      id: uuidv4(),
      type: 'task',
      title: 'New Task',
      x: -position.x / scale + 300,
      y: -position.y / scale + 200,
      width: 300,
      height: 400,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Task description',
      status: 'todo',
      priority: 'medium',
      subtasks: [
        {
          id: uuidv4(),
          text: 'First subtask',
          completed: false,
          timeEstimate: 30
        }
      ]
    })
  }
  
  // Add a Template
  const handleAddTemplate = () => {
    addComponent({
      id: uuidv4(),
      type: 'template',
      title: 'New Template',
      x: -position.x / scale + 300,
      y: -position.y / scale + 200,
      width: 300,
      height: 400,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Template description',
      tasks: [
        {
          id: uuidv4(),
          text: 'Task from template',
          hasSubtasks: false
        }
      ],
      category: 'General',
      icon: 'template-icon'
    })
  }
  
  // Add a Workflow
  const handleAddWorkflow = () => {
    const triggerNodeId = uuidv4()
    const actionNodeId = uuidv4()
    
    addComponent({
      id: uuidv4(),
      type: 'workflow',
      title: 'New Workflow',
      x: -position.x / scale + 300,
      y: -position.y / scale + 200,
      width: 500,
      height: 400,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Add workflow description',
      status: 'draft',
      nodes: [
        {
          id: triggerNodeId,
          type: 'trigger',
          position: { x: 100, y: 100 },
          data: { label: 'Trigger' }
        },
        {
          id: actionNodeId,
          type: 'action',
          position: { x: 100, y: 200 },
          data: { label: 'Action' }
        }
      ],
      edges: [
        {
          id: uuidv4(),
          source: triggerNodeId,
          target: actionNodeId
        }
      ]
    })
  }
  
  return (
    <ToolbarContainer>
      <Tooltip title="Add Note" placement="right">
        <ToolButton onClick={handleAddNote}>
          <NoteAddIcon />
        </ToolButton>
      </Tooltip>
      
      <Tooltip title="Add Task" placement="right">
        <ToolButton onClick={handleAddTask}>
          <AssignmentIcon />
        </ToolButton>
      </Tooltip>
      
      <Tooltip title="Add Template" placement="right">
        <ToolButton onClick={handleAddTemplate}>
          <FileCopyIcon />
        </ToolButton>
      </Tooltip>
      
      <Tooltip title="Add Workflow" placement="right">
        <ToolButton onClick={handleAddWorkflow}>
          <AccountTreeIcon />
        </ToolButton>
      </Tooltip>
    </ToolbarContainer>
  )
}

export default ToolbarPanel
