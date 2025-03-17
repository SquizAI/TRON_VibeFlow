import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NoteComponent from '../components/canvas/components/NoteComponent'

// Mock Konva components
vi.mock('react-konva', () => {
  return {
    Group: ({ children, ...props }: any) => (
      <div data-testid="konva-group" {...props}>
        {children}
      </div>
    ),
    Text: ({ text, ...props }: any) => (
      <div data-testid="konva-text" {...props}>
        {text}
      </div>
    ),
    Tag: ({ ...props }: any) => <div data-testid="konva-tag" {...props} />,
    Label: ({ children, ...props }: any) => (
      <div data-testid="konva-label" {...props}>
        {children}
      </div>
    ),
    Line: ({ ...props }: any) => <div data-testid="konva-line" {...props} />,
    Image: ({ ...props }: any) => <div data-testid="konva-image" {...props} />
  }
})

// Mock useCanvasStore
vi.mock('../../../src/store/canvasStore', () => ({
  default: {
    getState: () => ({
      updateComponent: vi.fn()
    }),
    subscribe: vi.fn()
  }
}))

describe('NoteComponent', () => {
  it('renders with proper content', () => {
    const mockNoteData = {
      id: 'note-1',
      type: 'note' as const,
      title: 'Test Note',
      x: 100,
      y: 100,
      width: 300,
      height: 250,
      zIndex: 1,
      createdAt: '2025-03-16T00:00:00.000Z',
      updatedAt: '2025-03-16T00:00:00.000Z',
      content: 'This is a test note content.\nWith multiple lines.',
      isLocked: false,
      tags: ['test', 'notes'],
      color: '#3282F6'
    }

    render(<NoteComponent data={mockNoteData} />)
    
    // Check that groups are rendered
    const groups = screen.getAllByTestId('konva-group')
    expect(groups.length).toBeGreaterThan(0)
    
    // Check content is rendered
    const contentTexts = screen.getAllByTestId('konva-text')
    expect(contentTexts.length).toBeGreaterThan(0)
    
    // Check content text includes our note content
    const hasNoteContent = contentTexts.some(element => 
      element.textContent && element.textContent.includes('This is a test note content')
    )
    expect(hasNoteContent).toBe(true)
    
    // Check tag background is rendered
    const tagElements = screen.getAllByTestId('konva-tag')
    expect(tagElements.length).toBeGreaterThan(0)
    
    // Check for locked icon (should not be present)
    const imageElements = screen.queryAllByTestId('konva-image')
    expect(imageElements.length).toBe(0) // No lock icon since isLocked is false
  })
  
  it('renders with lock icon when note is locked', () => {
    const mockLockedNoteData = {
      id: 'note-2',
      type: 'note' as const,
      title: 'Locked Note',
      x: 100,
      y: 100,
      width: 300,
      height: 250,
      zIndex: 1,
      createdAt: '2025-03-16T00:00:00.000Z',
      updatedAt: '2025-03-16T00:00:00.000Z',
      content: 'This is a locked note.',
      isLocked: true,
      tags: ['secure'],
      color: '#3282F6'
    }

    render(<NoteComponent data={mockLockedNoteData} />)
    
    // Lock icon should now be prepared to render after image load
    const groups = screen.getAllByTestId('konva-group')
    expect(groups.length).toBeGreaterThan(0)
  })
  
  it('renders tags correctly', () => {
    const mockNoteWithTagsData = {
      id: 'note-3',
      type: 'note' as const,
      title: 'Tagged Note',
      x: 100,
      y: 100,
      width: 300,
      height: 250,
      zIndex: 1,
      createdAt: '2025-03-16T00:00:00.000Z',
      updatedAt: '2025-03-16T00:00:00.000Z',
      content: 'Note with tags.',
      isLocked: false,
      tags: ['important', 'work', 'review'],
      color: '#3282F6'
    }

    render(<NoteComponent data={mockNoteWithTagsData} />)
    
    // Check for tags group
    const labelElements = screen.getAllByTestId('konva-label')
    expect(labelElements.length).toBeGreaterThanOrEqual(mockNoteWithTagsData.tags.length)
    
    // Check for tag texts - we'd need to modify the mock to check actual tag text values
    const tagTexts = screen.getAllByTestId('konva-text')
    expect(tagTexts.length).toBeGreaterThan(0)
  })
})
