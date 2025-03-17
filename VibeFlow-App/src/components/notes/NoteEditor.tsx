import React, { useState } from 'react';
import { 
  Paper, 
  TextField, 
  IconButton, 
  Toolbar, 
  Tooltip, 
  Divider, 
  Box,
  Typography,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Link,
  Image,
  AutoAwesome,
  Save,
  ArrowBack
} from '@mui/icons-material';

interface NoteEditorProps {
  note?: {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    lastEdited?: string;
  };
  onBack?: () => void;
  onSave?: (note: any) => void;
}

const EditorContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#000000',
  color: theme.palette.common.white,
  borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 0 10px ${alpha('#4169E1', 0.3)}`,
}));

const EditorToolbar = styled(Toolbar)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  padding: theme.spacing(1, 2),
}));

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  margin: theme.spacing(0, 0.5),
  padding: 6,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  }
}));

const EditorContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2, 3),
  overflowY: 'auto',
}));

const TitleField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiInputBase-input': {
    color: theme.palette.common.white,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    padding: theme.spacing(1, 0),
  },
  '& .MuiInput-underline:before': {
    borderBottomColor: alpha(theme.palette.common.white, 0.2),
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: alpha(theme.palette.common.white, 0.4),
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: theme.palette.primary.main,
  },
}));

const ContentField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    color: theme.palette.common.white,
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  '& .MuiInput-underline:before': {
    borderBottomColor: 'transparent',
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: 'transparent',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'transparent',
  },
}));

const MetaInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 3),
  borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  color: alpha(theme.palette.common.white, 0.6),
  fontSize: '0.8rem',
}));

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note = { id: 'new', title: 'Untitled Note', content: '' },
  onBack,
  onSave
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({ ...note, title, content });
    }
  };

  return (
    <EditorContainer elevation={0} square>
      <EditorToolbar variant="dense">
        <ToolbarButton onClick={onBack}>
          <ArrowBack />
        </ToolbarButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: alpha('#fff', 0.2) }} />
        <ToolbarButton>
          <FormatBold />
        </ToolbarButton>
        <ToolbarButton>
          <FormatItalic />
        </ToolbarButton>
        <ToolbarButton>
          <FormatListBulleted />
        </ToolbarButton>
        <ToolbarButton>
          <FormatListNumbered />
        </ToolbarButton>
        <ToolbarButton>
          <Code />
        </ToolbarButton>
        <ToolbarButton>
          <Link />
        </ToolbarButton>
        <ToolbarButton>
          <Image />
        </ToolbarButton>
        <Box flexGrow={1} />
        <ToolbarButton onClick={handleSave}>
          <Save />
        </ToolbarButton>
        <Tooltip title="Convert to Workflow">
          <ToolbarButton>
            <AutoAwesome />
          </ToolbarButton>
        </Tooltip>
      </EditorToolbar>

      <EditorContent>
        <TitleField
          fullWidth
          variant="standard"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsEditingTitle(true)}
          onBlur={() => setIsEditingTitle(false)}
          InputProps={{ disableUnderline: !isEditingTitle }}
        />
        
        <ContentField
          fullWidth
          multiline
          variant="standard"
          placeholder="Start typing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          InputProps={{ disableUnderline: true }}
          minRows={20}
        />
      </EditorContent>

      <MetaInfo>
        <Typography variant="caption">
          {note.lastEdited ? `Last edited: ${note.lastEdited}` : 'New note'}
        </Typography>
        <Typography variant="caption">
          {note.tags && note.tags.length > 0 ? `Tags: ${note.tags.join(', ')}` : 'No tags'}
        </Typography>
      </MetaInfo>
    </EditorContainer>
  );
};

export default NoteEditor;
