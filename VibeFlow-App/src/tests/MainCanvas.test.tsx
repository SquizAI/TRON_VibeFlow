import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MainCanvas from '../components/canvas/MainCanvas'
// No need to import useCanvasStore since we are mocking it completely

// Mock Konva stage and useCanvasStore
vi.mock('react-konva', () => {
  return {
    Stage: ({ children, ...props }: any) => (
      <div data-testid="konva-stage" {...props}>
        {children}
      </div>
    ),
    Layer: ({ children, ...props }: any) => (
      <div data-testid="konva-layer" {...props}>
        {children}
      </div>
    ),
    Rect: ({ ...props }: any) => <div data-testid="konva-rect" {...props} />,
    Group: ({ children, ...props }: any) => (
      <div data-testid="konva-group" {...props}>
        {children}
      </div>
    ),
    Text: ({ ...props }: any) => <div data-testid="konva-text" {...props} />
  }
})

vi.mock('../store/canvasStore', () => ({
  __esModule: true,
  default: () => ({
    scale: 1,
    position: { x: 0, y: 0 },
    components: [
      {
        id: 'test-note-1',
        type: 'note',
        title: 'Test Note',
        x: 100,
        y: 100,
        width: 300,
        height: 200,
        zIndex: 1,
        createdAt: '2025-03-16T00:00:00.000Z',
        updatedAt: '2025-03-16T00:00:00.000Z',
        content: 'Test content',
        isLocked: false,
        tags: ['test'],
        color: '#3282F6'
      }
    ],
    selectedComponentId: null,
    setScale: vi.fn(),
    setPosition: vi.fn(),
    selectComponent: vi.fn(),
    updateComponentPosition: vi.fn(),
    updateComponent: vi.fn(),
    getComponentById: vi.fn((_id) => ({
      id: 'test-note-1',
      type: 'note',
      title: 'Test Note',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      zIndex: 1,
      createdAt: '2025-03-16T00:00:00.000Z',
      updatedAt: '2025-03-16T00:00:00.000Z',
      content: 'Test content',
      isLocked: false,
      tags: ['test'],
      color: '#3282F6'
    }))
  }
}))

// Mock BentoComponentWrapper and ComponentFactory
vi.mock('../components/canvas/BentoComponentWrapper', () => ({
  default: ({ children, componentId }: any) => (
    <div data-testid={`component-wrapper-${componentId}`}>
      {children}
    </div>
  )
}))

vi.mock('../components/canvas/ComponentFactory', () => ({
  default: ({ component }: any) => (
    <div data-testid={`component-${component.id}`} data-type={component.type}>
      {component.title}
    </div>
  )
}))

vi.mock('../components/common/ToolbarPanel', () => ({
  default: ({ scale, position }: any) => (
    <div data-testid="toolbar-panel">
      Toolbar Panel (Scale: {scale}, Position: {JSON.stringify(position)})
    </div>
  )
}))

describe('MainCanvas Component', () => {
  it('renders correctly with canvas elements', () => {
    // Override window dimensions for the test
    Object.defineProperty(window, 'innerWidth', { value: 1024 })
    Object.defineProperty(window, 'innerHeight', { value: 768 })
    
    render(<MainCanvas />)
    
    // Expect stage, layer and toolbar to be rendered
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    expect(screen.getByTestId('konva-layer')).toBeInTheDocument()
    expect(screen.getByTestId('toolbar-panel')).toBeInTheDocument()
    
    // Expect background elements to be rendered
    const rects = screen.getAllByTestId('konva-rect')
    expect(rects.length).toBeGreaterThan(0)
    
    // Expect component wrapper and component to be rendered
    expect(screen.getByTestId('component-wrapper-test-note-1')).toBeInTheDocument()
    expect(screen.getByTestId('component-test-note-1')).toBeInTheDocument()
  })
})
