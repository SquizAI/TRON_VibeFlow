import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BentoComponentWrapper from '../components/canvas/BentoComponentWrapper'
import useCanvasStore from '../../src/store/canvasStore'
// We don't need to import useCanvasStore here since we're mocking it completely

// Mock Konva and useCanvasStore
vi.mock('react-konva', () => {
  return {
    Group: ({ children, ...props }: any) => (
      <div data-testid="konva-group" {...props}>
        {children}
      </div>
    ),
    Rect: ({ ...props }: any) => <div data-testid="konva-rect" {...props} />,
    Text: ({ ...props }: any) => <div data-testid="konva-text" {...props} />,
    Transformer: ({ ...props }: any) => <div data-testid="konva-transformer" {...props} />
  }
})

// Mock Konva namespace
vi.mock('konva', () => {
  return {
    default: {
      Group: class {
        constructor() {}
        scaleX(val?: any) { return val !== undefined ? val : 1 }
        scaleY(val?: any) { return val !== undefined ? val : 1 }
        width(val?: any) { return val !== undefined ? val : 300 }
        height(val?: any) { return val !== undefined ? val : 200 }
        x() { return 200 }
        y() { return 300 }
        getLayer() { return { batchDraw: vi.fn() } }
      }
    }
  }
})

// Mock store functions and state
const mockUpdateComponentPosition = vi.fn()
const mockUpdateComponent = vi.fn()
const mockSelectComponent = vi.fn()
const mockGetComponentById = vi.fn((_id) => ({
  id: 'test-component-1',
  type: 'note',
  title: 'Test Component',
  x: 100,
  y: 100,
  width: 300,
  height: 200,
  zIndex: 1,
  createdAt: '2025-03-16T00:00:00.000Z',
  updatedAt: '2025-03-16T00:00:00.000Z'
}))

vi.mock('../store/canvasStore', () => ({
  __esModule: true,
  default: () => ({
    getComponentById: mockGetComponentById,
    updateComponentPosition: mockUpdateComponentPosition,
    updateComponent: mockUpdateComponent,
    selectComponent: mockSelectComponent,
    selectedComponentId: null
  })
}))

describe('BentoComponentWrapper', () => {
  it('renders the component with correct props', () => {
    render(
      <BentoComponentWrapper componentId="test-component-1">
        <div data-testid="child-component">Child Component</div>
      </BentoComponentWrapper>
    )
    
    // Check that the wrapper renders
    const wrapper = screen.getByTestId('konva-group')
    expect(wrapper).toBeInTheDocument()
    
    // Check that child component is rendered
    const childComponent = screen.getByTestId('child-component')
    expect(childComponent).toBeInTheDocument()
    expect(childComponent).toHaveTextContent('Child Component')
  })
  
  it('handles component selection', () => {
    render(
      <BentoComponentWrapper componentId="test-component-1">
        <div data-testid="child-component">Child Component</div>
      </BentoComponentWrapper>
    )
    
    // Simulate click on wrapper
    const wrapper = screen.getByTestId('konva-group')
    fireEvent.click(wrapper)
    
    // Check that selectComponent was called
    expect(mockSelectComponent).toHaveBeenCalledWith('test-component-1')
  })
  
  it('handles component movement', () => {
    render(
      <BentoComponentWrapper componentId="test-component-1">
        <div data-testid="child-component">Child Component</div>
      </BentoComponentWrapper>
    )
    
    // Get the wrapper
    const wrapper = screen.getByTestId('konva-group')
    
    // Simulate drag end
    fireEvent.dragEnd(wrapper)
    
    // Check updateComponentPosition was called with new position
    expect(mockUpdateComponentPosition).toHaveBeenCalledWith('test-component-1', 200, 300)
  })
  
  it('renders transformer when component is selected', () => {
    // Mock selectedComponentId to be the current component
    vi.mocked(useCanvasStore).mockReturnValueOnce({
      getComponentById: mockGetComponentById,
      updateComponentPosition: mockUpdateComponentPosition,
      updateComponent: mockUpdateComponent,
      selectComponent: mockSelectComponent,
      selectedComponentId: 'test-component-1'
    })
    
    render(
      <BentoComponentWrapper componentId="test-component-1">
        <div data-testid="child-component">Child Component</div>
      </BentoComponentWrapper>
    )
    
    // Check that transformer is rendered when component is selected
    const transformer = screen.getByTestId('konva-transformer')
    expect(transformer).toBeInTheDocument()
  })
  
  it('handles resize operations', () => {
    // Mock selectedComponentId to be the current component
    vi.mocked(useCanvasStore).mockReturnValueOnce({
      getComponentById: mockGetComponentById,
      updateComponentPosition: mockUpdateComponentPosition,
      updateComponent: mockUpdateComponent,
      selectComponent: mockSelectComponent,
      selectedComponentId: 'test-component-1'
    })
    
    render(
      <BentoComponentWrapper componentId="test-component-1">
        <div data-testid="child-component">Child Component</div>
      </BentoComponentWrapper>
    )
    
    // Get the wrapper
    const wrapper = screen.getByTestId('konva-group')
    
    // Simulate transform end - we need to use a custom event since transformEnd isn't a standard event
    const transformEndEvent = new Event('transformend')
    wrapper.dispatchEvent(transformEndEvent)
    
    // Check updateComponent was called with new dimensions
    expect(mockUpdateComponent).toHaveBeenCalledWith('test-component-1', {
      width: 300,
      height: 200,
      x: 200,
      y: 300
    })
  })
})
