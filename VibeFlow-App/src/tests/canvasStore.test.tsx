import { describe, it, expect, beforeEach } from 'vitest'
import useCanvasStore from '../../src/store/canvasStore'
import { v4 as uuidv4 } from 'uuid'

describe('Canvas Store', () => {
  beforeEach(() => {
    // Reset the store by creating a new one
    // Clear all components for testing
    const store = useCanvasStore.getState()
    store.components.forEach(component => {
      store.removeComponent(component.id)
    })
  })

  it('should add a new component', () => {
    const { addComponent, components } = useCanvasStore.getState()
    
    const noteComponent = {
      id: uuidv4(),
      type: 'note' as const,
      title: 'Test Note',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: 'Test content',
      isLocked: false,
      tags: ['test'],
      color: '#3282F6'
    }
    
    addComponent(noteComponent)
    
    const updatedComponents = useCanvasStore.getState().components
    expect(updatedComponents).toHaveLength(components.length + 1)
    expect(updatedComponents[updatedComponents.length - 1]).toEqual(noteComponent)
  })

  it('should update an existing component', () => {
    const { addComponent, updateComponent } = useCanvasStore.getState()
    
    const noteId = uuidv4()
    const noteComponent = {
      id: noteId,
      type: 'note' as const,
      title: 'Test Note',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: 'Test content',
      isLocked: false,
      tags: ['test'],
      color: '#3282F6'
    }
    
    addComponent(noteComponent)
    
    updateComponent(noteId, { title: 'Updated Title', content: 'Updated content' })
    
    const updatedComponents = useCanvasStore.getState().components
    const updatedNote = updatedComponents.find(comp => comp.id === noteId)
    
    expect(updatedNote).toBeDefined()
    expect(updatedNote?.title).toBe('Updated Title')
    expect((updatedNote as any).content).toBe('Updated content')
  })

  it('should remove a component', () => {
    const { addComponent, removeComponent } = useCanvasStore.getState()
    
    const noteId = uuidv4()
    const noteComponent = {
      id: noteId,
      type: 'note' as const,
      title: 'Test Note',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: 'Test content',
      isLocked: false,
      tags: ['test'],
      color: '#3282F6'
    }
    
    addComponent(noteComponent)
    const afterAddCount = useCanvasStore.getState().components.length
    
    removeComponent(noteId)
    const afterRemoveCount = useCanvasStore.getState().components.length
    
    expect(afterRemoveCount).toBe(afterAddCount - 1)
    expect(useCanvasStore.getState().components.find(comp => comp.id === noteId)).toBeUndefined()
  })

  it('should select a component', () => {
    const { addComponent, selectComponent } = useCanvasStore.getState()
    
    const noteId = uuidv4()
    const noteComponent = {
      id: noteId,
      type: 'note' as const,
      title: 'Test Note',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      zIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: 'Test content',
      isLocked: false,
      tags: ['test'],
      color: '#3282F6'
    }
    
    addComponent(noteComponent)
    selectComponent(noteId)
    
    expect(useCanvasStore.getState().selectedComponentId).toBe(noteId)
  })

  it('should update canvas scale and position', () => {
    const { setScale, setPosition } = useCanvasStore.getState()
    
    setScale(1.5)
    setPosition({ x: 100, y: 200 })
    
    expect(useCanvasStore.getState().scale).toBe(1.5)
    expect(useCanvasStore.getState().position).toEqual({ x: 100, y: 200 })
  })
})
