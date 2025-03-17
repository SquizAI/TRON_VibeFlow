import { create } from 'zustand'
import { Position, CanvasComponent } from '../types/canvas'
import { generateMockComponents } from '../utils/mockData'

interface CanvasState {
  // Canvas view state
  scale: number
  position: Position
  setScale: (scale: number) => void
  setPosition: (position: Position) => void
  
  // Component management
  components: CanvasComponent[]
  selectedComponentId: string | null
  
  // Component actions
  addComponent: (component: CanvasComponent) => void
  addComponents: (components: CanvasComponent[]) => void
  clearComponents: () => void
  updateComponent: (componentId: string, updates: Partial<CanvasComponent>) => void
  removeComponent: (componentId: string) => void
  updateComponentPosition: (componentId: string, x: number, y: number) => void
  selectComponent: (componentId: string | null) => void
  getComponentById: (componentId: string) => CanvasComponent | undefined
}

// Initialize with some mock data for development
const initialComponents = generateMockComponents()

const useCanvasStore = create<CanvasState>((set, get) => ({
  // Canvas view initial state
  scale: 1,
  position: { x: 0, y: 0 },
  
  // Set initial components
  components: initialComponents,
  selectedComponentId: null,
  
  // Update canvas view state
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  
  // Component management actions
  addComponent: (component) => {
    set((state) => ({
      components: [...state.components, component],
    }))
  },
  
  addComponents: (components) => {
    set((state) => ({
      components: [...state.components, ...components],
    }))
  },
  
  clearComponents: () => {
    set({
      components: [],
      selectedComponentId: null
    })
  },
  
  updateComponent: (componentId, updates) => {
    set((state) => ({
      components: state.components.map((component) => 
        component.id === componentId
          ? { ...component, ...updates, updatedAt: new Date().toISOString() }
          : component
      ),
    }))
  },
  
  removeComponent: (componentId) => {
    set((state) => ({
      components: state.components.filter((component) => component.id !== componentId),
    }))
  },
  
  updateComponentPosition: (componentId, x, y) => {
    set((state) => ({
      components: state.components.map((component) => 
        component.id === componentId
          ? { ...component, x, y, updatedAt: new Date().toISOString() }
          : component
      ),
    }))
  },
  
  selectComponent: (componentId) => {
    set({ selectedComponentId: componentId })
  },
  
  getComponentById: (componentId) => {
    return get().components.find((component) => component.id === componentId)
  },
}))

export default useCanvasStore
