import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Paper, 
  Typography, 
  InputBase, 
  IconButton,
  Collapse,
  Box,
  Badge,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useNoteStore from '../../store/noteStore';
import { 
  Search as SearchIcon, 
  NoteAlt as NoteIcon, 
  AccessTime as RecentIcon,
  Folder as FolderIcon, 
  FolderSpecial as FolderSpecialIcon, 
  Label as LabelIcon, 
  Archive as ArchiveIcon, 
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  AutoAwesome as AutomationIcon
} from '@mui/icons-material';

// Styled components
const NavContainer = styled(Paper)(({ theme }) => ({
  width: 280,
  height: '100%',
  overflowY: 'auto',
  backgroundColor: '#000000',
  color: theme.palette.common.white,
  borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 0 10px ${alpha('#4169E1', 0.3)}`,
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  marginLeft: 16,
  marginRight: 16,
  marginTop: 16,
  marginBottom: 8,
  width: 'auto',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: '2px 8px',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
  '&.selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.3),
    },
  }
}));

const CategoryHeading = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  justifyContent: 'space-between',
}));

const AddButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: 4,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  }
}));

// Main component
const LeftNavigation: React.FC = () => {
  const { selectedItem, setSelectedItem } = useNoteStore();
  const [smartFoldersOpen, setSmartFoldersOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [automationOpen, setAutomationOpen] = useState(true);

  const handleItemClick = (id: string) => {
    setSelectedItem(id);
  };

  return (
    <NavContainer square elevation={0}>
      <SearchBar>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search notes…"
          inputProps={{ 'aria-label': 'search notes' }}
        />
      </SearchBar>

      <List component="nav" dense disablePadding>
        {/* Primary navigation items */}
        <StyledListItem 
          button 
          className={selectedItem === 'all-notes' ? 'selected' : ''} 
          onClick={() => handleItemClick('all-notes')}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <NoteIcon />
          </ListItemIcon>
          <ListItemText primary="All Notes" />
          <Badge badgeContent={124} color="primary" sx={{ mr: 1 }} />
        </StyledListItem>
        
        <StyledListItem 
          button 
          className={selectedItem === 'recent' ? 'selected' : ''} 
          onClick={() => handleItemClick('recent')}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <RecentIcon />
          </ListItemIcon>
          <ListItemText primary="Recent" />
        </StyledListItem>

        <Divider sx={{ my: 1, backgroundColor: alpha('#fff', 0.1) }} />

        {/* Smart Folders */}
        <CategoryHeading>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha('#fff', 0.7), 
              fontSize: '0.75rem', 
              letterSpacing: 0.5,
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Smart Folders
          </Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={() => setSmartFoldersOpen(!smartFoldersOpen)}
              sx={{ color: alpha('#fff', 0.7), p: 0.5 }}
            >
              {smartFoldersOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            <AddButton size="small">
              <AddIcon fontSize="small" />
            </AddButton>
          </Box>
        </CategoryHeading>

        <Collapse in={smartFoldersOpen}>
          <StyledListItem 
            button 
            className={selectedItem === 'important' ? 'selected' : ''}
            onClick={() => handleItemClick('important')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <FolderSpecialIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Important" />
            <Badge badgeContent={5} color="primary" sx={{ mr: 1 }} />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'tasks' ? 'selected' : ''} 
            onClick={() => handleItemClick('tasks')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <FolderSpecialIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Tasks" />
            <Badge badgeContent={12} color="error" sx={{ mr: 1 }} />
          </StyledListItem>
        </Collapse>

        <Divider sx={{ my: 1, backgroundColor: alpha('#fff', 0.1) }} />

        {/* Folders */}
        <CategoryHeading>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha('#fff', 0.7), 
              fontSize: '0.75rem', 
              letterSpacing: 0.5,
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Folders
          </Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={() => setFoldersOpen(!foldersOpen)}
              sx={{ color: alpha('#fff', 0.7), p: 0.5 }}
            >
              {foldersOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            <AddButton size="small">
              <AddIcon fontSize="small" />
            </AddButton>
          </Box>
        </CategoryHeading>

        <Collapse in={foldersOpen}>
          <StyledListItem 
            button 
            className={selectedItem === 'projects' ? 'selected' : ''} 
            onClick={() => handleItemClick('projects')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Projects" />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'personal' ? 'selected' : ''} 
            onClick={() => handleItemClick('personal')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Personal" />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'work' ? 'selected' : ''} 
            onClick={() => handleItemClick('work')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Work" />
          </StyledListItem>
        </Collapse>

        <Divider sx={{ my: 1, backgroundColor: alpha('#fff', 0.1) }} />

        {/* Tags */}
        <CategoryHeading>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha('#fff', 0.7), 
              fontSize: '0.75rem', 
              letterSpacing: 0.5,
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Tags
          </Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={() => setTagsOpen(!tagsOpen)}
              sx={{ color: alpha('#fff', 0.7), p: 0.5 }}
            >
              {tagsOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            <AddButton size="small">
              <AddIcon fontSize="small" />
            </AddButton>
          </Box>
        </CategoryHeading>

        <Collapse in={tagsOpen}>
          <StyledListItem 
            button 
            className={selectedItem === 'tag-idea' ? 'selected' : ''} 
            onClick={() => handleItemClick('tag-idea')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <LabelIcon fontSize="small" sx={{ color: '#4169E1' }} />
            </ListItemIcon>
            <ListItemText primary="Ideas" />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'tag-todo' ? 'selected' : ''} 
            onClick={() => handleItemClick('tag-todo')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <LabelIcon fontSize="small" sx={{ color: '#E14169' }} />
            </ListItemIcon>
            <ListItemText primary="To-Do" />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'tag-important' ? 'selected' : ''} 
            onClick={() => handleItemClick('tag-important')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <LabelIcon fontSize="small" sx={{ color: '#41E169' }} />
            </ListItemIcon>
            <ListItemText primary="Important" />
          </StyledListItem>
        </Collapse>

        <Divider sx={{ my: 1, backgroundColor: alpha('#fff', 0.1) }} />

        {/* Automation */}
        <CategoryHeading>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: alpha('#fff', 0.7), 
              fontSize: '0.75rem', 
              letterSpacing: 0.5,
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Automation
          </Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={() => setAutomationOpen(!automationOpen)}
              sx={{ color: alpha('#fff', 0.7), p: 0.5 }}
            >
              {automationOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            <AddButton size="small">
              <AddIcon fontSize="small" />
            </AddButton>
          </Box>
        </CategoryHeading>

        <Collapse in={automationOpen}>
          <StyledListItem 
            button 
            className={selectedItem === 'automation-nodes' ? 'selected' : ''} 
            onClick={() => handleItemClick('automation-nodes')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <AutomationIcon fontSize="small" sx={{ color: '#4169E1' }} />
            </ListItemIcon>
            <ListItemText primary="Automation Nodes" />
            <Badge badgeContent={"New"} color="primary" sx={{ mr: 1 }} />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'automation-email' ? 'selected' : ''} 
            onClick={() => handleItemClick('automation-email')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <AutomationIcon fontSize="small" sx={{ color: '#6941E1' }} />
            </ListItemIcon>
            <ListItemText primary="Email Workflows" />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'automation-chat' ? 'selected' : ''} 
            onClick={() => handleItemClick('automation-chat')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <AutomationIcon fontSize="small" sx={{ color: '#41E1C0' }} />
            </ListItemIcon>
            <ListItemText primary="Chat Integrations" />
          </StyledListItem>
          
          <StyledListItem 
            button 
            className={selectedItem === 'automation-mcp' ? 'selected' : ''} 
            onClick={() => handleItemClick('automation-mcp')}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <AutomationIcon fontSize="small" sx={{ color: '#E1C041' }} />
            </ListItemIcon>
            <ListItemText primary="MCP Server" />
          </StyledListItem>
        </Collapse>

        <Divider sx={{ my: 1, backgroundColor: alpha('#fff', 0.1) }} />

        {/* Additional items */}
        <StyledListItem 
          button 
          className={selectedItem === 'archive' ? 'selected' : ''} 
          onClick={() => handleItemClick('archive')}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <ArchiveIcon />
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </StyledListItem>
        
        <StyledListItem 
          button 
          className={selectedItem === 'trash' ? 'selected' : ''} 
          onClick={() => handleItemClick('trash')}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Trash" />
        </StyledListItem>
      </List>
    </NavContainer>
  );
};

export default LeftNavigation;
