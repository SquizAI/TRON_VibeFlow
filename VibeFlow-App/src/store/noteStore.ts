import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId?: string;
  isArchived: boolean;
  isDeleted: boolean;
  workflowId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  isSmartFolder: boolean;
  smartFilter?: {
    tags?: string[];
    searchTerms?: string;
    dateRange?: {
      from?: string;
      to?: string;
    }
  };
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface NoteState {
  // Data
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  
  // UI state
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  selectedTagId: string | null;
  selectedItem: string;
  viewMode: 'notes' | 'canvas' | 'workflow';
  searchQuery: string;
  
  // Actions
  addNote: (note: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;
  
  addFolder: (folder: Partial<Folder>) => string;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  
  addTag: (tag: Partial<Tag>) => string;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  setSelectedNote: (id: string | null) => void;
  setSelectedFolder: (id: string | null) => void;
  setSelectedTag: (id: string | null) => void;
  setSelectedItem: (item: string) => void;
  setViewMode: (mode: 'notes' | 'canvas' | 'workflow') => void;
  setSearchQuery: (query: string) => void;
  
  // Getters
  getNoteById: (id: string) => Note | undefined;
  getNotesByFolder: (folderId: string) => Note[];
  getNotesByTag: (tagId: string) => Note[];
  getFilteredNotes: () => Note[];
}

// Mock data for initial development
const mockTags: Tag[] = [
  { id: 'tag1', name: 'Ideas', color: '#4169E1' },
  { id: 'tag2', name: 'To-Do', color: '#E14169' },
  { id: 'tag3', name: 'Important', color: '#41E169' },
];

const mockFolders: Folder[] = [
  { id: 'all-notes', name: 'All Notes', isSmartFolder: true },
  { id: 'recent', name: 'Recent', isSmartFolder: true },
  { id: 'important', name: 'Important', isSmartFolder: true, smartFilter: { tags: ['tag3'] } },
  { id: 'tasks', name: 'Tasks', isSmartFolder: true, smartFilter: { tags: ['tag2'] } },
  { id: 'projects', name: 'Projects', isSmartFolder: false },
  { id: 'personal', name: 'Personal', isSmartFolder: false },
  { id: 'work', name: 'Work', isSmartFolder: false },
];

const mockNotes: Note[] = [
  {
    id: 'note1',
    title: 'Welcome to VibeFlow',
    content: 'VibeFlow is your new workspace for notes, tasks, and automation workflows. Create, organize, and connect your ideas seamlessly.',
    tags: ['tag1'],
    folderId: 'projects',
    isArchived: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note2',
    title: 'Project Ideas',
    content: '1. Implement dark mode\n2. Add drag and drop for notes\n3. Create export functionality\n4. Build automation tools',
    tags: ['tag1', 'tag2'],
    folderId: 'projects',
    isArchived: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note3',
    title: 'Important Meeting Notes',
    content: 'Client meeting on Thursday at 2pm. Discuss timeline and deliverables for Q2.',
    tags: ['tag3'],
    folderId: 'work',
    isArchived: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note4',
    title: 'Shopping List',
    content: '- Milk\n- Eggs\n- Bread\n- Coffee',
    tags: ['tag2'],
    folderId: 'personal',
    isArchived: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Create the store
const useNoteStore = create<NoteState>((set, get) => ({
  // Initial state
  notes: mockNotes,
  folders: mockFolders,
  tags: mockTags,
  selectedNoteId: null,
  selectedFolderId: 'all-notes',
  selectedTagId: null,
  selectedItem: 'all-notes',
  viewMode: 'notes',
  searchQuery: '',
  
  // Actions
  addNote: (note) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newNote: Note = {
      id,
      title: note.title || 'Untitled Note',
      content: note.content || '',
      tags: note.tags || [],
      folderId: note.folderId || get().selectedFolderId || undefined,
      isArchived: false,
      isDeleted: false,
      workflowId: note.workflowId,
      createdAt: now,
      updatedAt: now,
    };
    
    set((state) => ({
      notes: [...state.notes, newNote],
      selectedNoteId: id,
    }));
    
    return id;
  },
  
  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) => 
        note.id === id
          ? { 
              ...note, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            }
          : note
      ),
    }));
  },
  
  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) => 
        note.id === id
          ? { ...note, isDeleted: true, updatedAt: new Date().toISOString() }
          : note
      ),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    }));
  },
  
  archiveNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) => 
        note.id === id
          ? { ...note, isArchived: true, updatedAt: new Date().toISOString() }
          : note
      ),
    }));
  },
  
  restoreNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) => 
        note.id === id
          ? { ...note, isDeleted: false, isArchived: false, updatedAt: new Date().toISOString() }
          : note
      ),
    }));
  },
  
  addFolder: (folder) => {
    const id = uuidv4();
    
    const newFolder: Folder = {
      id,
      name: folder.name || 'New Folder',
      parentId: folder.parentId,
      isSmartFolder: folder.isSmartFolder || false,
      smartFilter: folder.smartFilter,
    };
    
    set((state) => ({
      folders: [...state.folders, newFolder],
    }));
    
    return id;
  },
  
  updateFolder: (id, updates) => {
    set((state) => ({
      folders: state.folders.map((folder) => 
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    }));
  },
  
  deleteFolder: (id) => {
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      selectedFolderId: state.selectedFolderId === id ? 'all-notes' : state.selectedFolderId,
    }));
  },
  
  addTag: (tag) => {
    const id = uuidv4();
    
    const newTag: Tag = {
      id,
      name: tag.name || 'New Tag',
      color: tag.color || '#808080',
    };
    
    set((state) => ({
      tags: [...state.tags, newTag],
    }));
    
    return id;
  },
  
  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map((tag) => 
        tag.id === id ? { ...tag, ...updates } : tag
      ),
    }));
  },
  
  deleteTag: (id) => {
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
      selectedTagId: state.selectedTagId === id ? null : state.selectedTagId,
      // Remove this tag from all notes that have it
      notes: state.notes.map((note) => ({
        ...note,
        tags: note.tags.filter((tagId) => tagId !== id),
      })),
    }));
  },
  
  setSelectedNote: (id) => {
    set({ selectedNoteId: id });
  },
  
  setSelectedFolder: (id) => {
    set({ 
      selectedFolderId: id,
      selectedTagId: null,
      viewMode: 'notes'
    });
  },
  
  setSelectedTag: (id) => {
    set({ 
      selectedTagId: id,
      selectedFolderId: null,
      viewMode: 'notes'
    });
  },
  
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },
  
  setSelectedItem: (item: string) => {
    set({ selectedItem: item });
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  // Getters
  getNoteById: (id) => {
    return get().notes.find((note) => note.id === id);
  },
  
  getNotesByFolder: (folderId) => {
    const { notes, folders } = get();
    const folder = folders.find((f) => f.id === folderId);
    
    // Special handling for smart folders
    if (folder?.isSmartFolder) {
      if (folderId === 'all-notes') {
        return notes.filter((note) => !note.isDeleted && !note.isArchived);
      }
      
      if (folderId === 'recent') {
        return [...notes]
          .filter((note) => !note.isDeleted && !note.isArchived)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 20);
      }
      
      if (folder.smartFilter?.tags?.length) {
        return notes.filter((note) => 
          !note.isDeleted && 
          !note.isArchived && 
          folder.smartFilter?.tags?.some((tagId) => note.tags.includes(tagId))
        );
      }
    }
    
    // Regular folders
    return notes.filter((note) => 
      !note.isDeleted && 
      !note.isArchived && 
      note.folderId === folderId
    );
  },
  
  getNotesByTag: (tagId) => {
    return get().notes.filter((note) => 
      !note.isDeleted && 
      !note.isArchived && 
      note.tags.includes(tagId)
    );
  },
  
  getFilteredNotes: () => {
    const { 
      notes, 
      selectedFolderId, 
      selectedTagId, 
      searchQuery 
    } = get();
    
    let filteredNotes = notes.filter((note) => !note.isDeleted);
    
    // Filter by folder or tag if selected
    if (selectedFolderId) {
      filteredNotes = get().getNotesByFolder(selectedFolderId);
    } else if (selectedTagId) {
      filteredNotes = get().getNotesByTag(selectedTagId);
    }
    
    // Apply search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter((note) => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }
    
    return filteredNotes;
  },
}));

export default useNoteStore;
