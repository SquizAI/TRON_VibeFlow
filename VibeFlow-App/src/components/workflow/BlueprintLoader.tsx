import React, { useState, useRef } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  Alert,
  Paper 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import useCanvasStore from '../../store/canvasStore';
import { parseBlueprint } from '../../utils/workflowParser';

const DropZone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.mode === 'dark' ? '#444' : '#ccc'}`,
  borderRadius: '8px',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
  },
  minHeight: '200px'
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const BlueprintLoader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [, setBlueprint] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { addComponents, clearComponents } = useCanvasStore();
  
  const handleOpen = () => {
    setOpen(true);
    setError(null);
  };
  
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setBlueprint(null);
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const processFile = async (file: File) => {
    if (file.type !== 'application/json') {
      setError('Please upload a JSON file.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setBlueprint(json);
          
          // Parse blueprint to components
          const components = parseBlueprint(json);
          
          // Close dialog and apply to canvas
          setOpen(false);
          setLoading(false);
          
          // Clear existing components and add new ones
          clearComponents();
          addComponents(components);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          setError('Invalid JSON format. Please check the file and try again.');
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setLoading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the file. Please try again.');
      setLoading(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  return (
    <>
      <Button 
        variant="outlined" 
        color="primary"
        startIcon={<DescriptionIcon />}
        onClick={handleOpen}
      >
        Import Blueprint
      </Button>
      
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Marketing Automation Blueprint</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{ mb: 2 }}
          >
            <DropZone 
              elevation={0}
              onClick={handleButtonClick}
              sx={{
                borderColor: dragActive ? 'primary.main' : undefined,
                backgroundColor: dragActive 
                  ? (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.06)'
                  : undefined
              }}
            >
              {loading ? (
                <CircularProgress size={40} />
              ) : (
                <>
                  <FileUploadIcon color="primary" sx={{ fontSize: 48 }} />
                  <Typography variant="body1" align="center">
                    Drag and drop your JSON blueprint here, or click to select
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center">
                    Supports marketing automation blueprint JSON files
                  </Typography>
                  <VisuallyHiddenInput
                    ref={inputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </DropZone>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BlueprintLoader;
