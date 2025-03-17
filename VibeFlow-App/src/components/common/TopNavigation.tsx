import React from 'react'
import Button from '@mui/material/Button'
import HomeIcon from '@mui/icons-material/Home'
import AssignmentIcon from '@mui/icons-material/Assignment'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'
import MicIcon from '@mui/icons-material/Mic'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import { styled } from '@mui/material/styles'

const NavButton = styled(Button)(({ theme }) => ({
  margin: '0 4px',
  padding: '6px 16px',
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#4B5563',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
  },
  '& .MuiButton-startIcon': {
    marginRight: 6,
  },
}))

const CommandButton = styled(Button)(({ theme }) => ({
  margin: '0 4px',
  padding: '8px 16px',
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
  color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#4B5563',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  textTransform: 'none',
  fontWeight: 400,
  fontSize: '0.8rem',
  letterSpacing: 0.5,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(0, 0, 0, 0.08)',
  },
}))

const TopNavigation: React.FC = () => {
  return (
    <div className="top-navigation">
      <NavButton startIcon={<HomeIcon />}>
        Canvas
      </NavButton>
      <NavButton startIcon={<AssignmentIcon />}>
        Tasks
      </NavButton>
      <NavButton startIcon={<InsertDriveFileIcon />}>
        Templates
      </NavButton>
      <Tooltip title="Add Note">
        <NavButton 
          startIcon={<AddIcon />} 
          color="primary"
          onClick={() => {
            // Here we would integrate with the canvas store to add a new note
            console.log('Add new note clicked')
          }}
        >
          Add Note
        </NavButton>
      </Tooltip>
      
      {/* Agent button with microphone */}
      <NavButton 
        startIcon={<MicIcon />} 
        color="secondary"
        sx={{ marginLeft: 2 }}
        onClick={() => {
          // Here we would trigger the dictation system
          console.log('Agent button clicked')
        }}
      >
        Agent
      </NavButton>
      
      {/* Commands shortcut */}
      <CommandButton startIcon={<KeyboardIcon />}>
        Commands ⌘K
      </CommandButton>
    </div>
  )
}

export default TopNavigation
