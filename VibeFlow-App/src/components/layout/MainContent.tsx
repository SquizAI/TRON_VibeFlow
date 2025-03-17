import React from 'react';
import { Box, styled } from '@mui/material';
import { LeftNavigation } from '../navigation';
import { NoteEditor } from '../notes';
import { MainCanvas } from '../canvas';
import AutomationNodePage from '../../pages/AutomationNodePage';
import useNoteStore from '../../store/noteStore';

const Container = styled(Box)({
  display: 'flex',
  height: 'calc(100vh - 64px)', // Subtract header height
  width: '100%',
  overflow: 'hidden',
});

const ContentArea = styled(Box)({
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
});

const MainContent: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    selectedNoteId, 
    getNoteById,
    updateNote,
    selectedItem
  } = useNoteStore();

  const selectedNote = selectedNoteId ? getNoteById(selectedNoteId) : undefined;

  const handleSaveNote = (updatedNote: any) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, {
        title: updatedNote.title,
        content: updatedNote.content
      });
    }
  };

  const handleBackFromNote = () => {
    setViewMode('canvas');
  };

  return (
    <Container>
      <LeftNavigation />
      
      <ContentArea>
        {viewMode === 'notes' && selectedNote ? (
          <NoteEditor 
            note={selectedNote} 
            onSave={handleSaveNote}
            onBack={handleBackFromNote}
          />
        ) : selectedItem === 'automation-nodes' ? (
          <AutomationNodePage />
        ) : (
          <MainCanvas />
        )}
      </ContentArea>
    </Container>
  );
};

export default MainContent;
