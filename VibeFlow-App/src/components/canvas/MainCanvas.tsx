import { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Rect, Group, Text, Line } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import useCanvasStore from '../../store/canvasStore'
import BentoComponentWrapper from './BentoComponentWrapper'
import ComponentFactory from './ComponentFactory'
import ToolbarPanel from '../common/ToolbarPanel'

/**
 * MainCanvas component renders the main canvas area with all components
 */
const MainCanvas = () => {
  const stageRef = useRef<any>(null)
  const [stageSize, setStageSize] = useState({ 
    width: window.innerWidth - 40, // Subtract some padding 
    height: window.innerHeight - 100 // Subtract header/toolbar height
  })
  
  const {
    scale,
    position,
    setScale,
    setPosition,
    components,
  } = useCanvasStore()

  // Initialize canvas size and set up resize handler
  useEffect(() => {
    // Define a handler function to set stage dimensions
    const handleResize = () => {
      // Ensure we never set zero dimensions
      const containerWidth = Math.max(window.innerWidth - 40, 1); // Minimum 1px width
      const containerHeight = Math.max(window.innerHeight - 100, 1); // Minimum 1px height

      setStageSize({
        width: containerWidth,
        height: containerHeight
      })
    }

    // Set initial size immediately
    handleResize()
    
    // Add resize listener for window size changes
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Handle wheel for zooming - either canvas or individual components
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    // Skip if the event has been marked as handled by a component
    if (e.cancelBubble) {
      return
    }
    
    const scaleBy = 1.1
    const stage = stageRef.current
    if (!stage) return
    
    const oldScale = scale
    
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }
    
    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    
    // Limit scale
    const limitedScale = Math.max(0.1, Math.min(5, newScale))
    
    // Calculate new position
    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    }
    
    setScale(limitedScale)
    setPosition(newPos)
  }, [scale, position, setScale, setPosition])

  // Get selectComponent from the store at component level
  const { selectComponent } = useCanvasStore()
  
  // Handle selection of components
  const handleSelectComponent = (id: string | null) => {
    selectComponent(id)
  }
  
  // Handle stage click to deselect when clicking background
  const handleStageClick = (e: any) => {
    // Only deselect if the click target is the stage or background
    if (e.target === e.currentTarget || e.target.name() === 'background') {
      handleSelectComponent(null)
    }
  }
  
  // Handle component-specific zooming
  const handleCardWheel = (e: KonvaEventObject<WheelEvent>, _componentId: string) => {
    // This function is passed to each BentoComponentWrapper
    // The components handle their own zooming internally
    e.cancelBubble = true
  }
  
  // Prevent canvas from moving when components are being moved
  const handleDragBound = (pos: any) => {
    return pos // Simply return the position to maintain stage position
  }

  // Get components sorted by z-index for proper layering and depth perception
  const sortedComponents = [...components].sort((a, b) => {
    // First sort by z-index
    if (a.zIndex !== b.zIndex) {
      return a.zIndex - b.zIndex
    }
    
    // Additional sorting (default is no additional change)
    return 0
  })
  
  // Force valid dimensions even before DOM is fully loaded
  // This prevents the InvalidStateError in react-konva
  const hasValidDimensions = stageSize.width > 0 && stageSize.height > 0

  // Log dimensions to help with debugging
  useEffect(() => {
    console.log('Canvas dimensions:', stageSize)
  }, [stageSize])

  return (
    <div className="canvas-container" style={{ 
      width: '100%', 
      height: 'calc(100vh - 64px)', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Add toolbar panel for adding components */}
      <ToolbarPanel scale={scale} position={position} />
      
      {hasValidDimensions && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable
          onWheel={handleWheel}
          onClick={handleStageClick}
          onDragEnd={(e) => {
            // Make sure we're only moving the stage if it's a direct drag on the stage
            // This prevents the issue where moving components also moves the canvas
            if (e.target === stageRef.current) {
              setPosition({ x: e.target.x(), y: e.target.y() })
            }
          }}
          dragBoundFunc={handleDragBound}
        >
        <Layer>
          {/* Background with gradient */}
          <Rect
            width={10000}
            height={10000}
            x={-5000}
            y={-5000}
            fill="#000000"
            name="background"
          />
          
          {/* Performance-optimized grid */}
          <Group cacheAs="canvas">
            {/* Grid dots - royal blue with increased density */}
            {Array.from({ length: 61 }).map((_, i) => {
              return Array.from({ length: 61 }).map((_, j) => {
                // Balanced spacing for better performance but more dots
                const gridSize = 100
                const x = -3000 + j * gridSize
                const y = -3000 + i * gridSize
                
                // Only render dots within a reasonable view distance
                const distanceFromCenter = Math.sqrt(Math.pow(x / 3000, 2) + Math.pow(y / 3000, 2))
                if (distanceFromCenter > 1.2) return null
                
                const dotOpacity = Math.max(0.15, 0.6 - distanceFromCenter * 0.3)
                
                return (
                  <Rect
                    key={`dot-${i}-${j}`}
                    x={x - 0.5}
                    y={y - 0.5}
                    width={1}
                    height={1}
                    fill="#4169E1" // Royal blue
                    opacity={dotOpacity}
                    listening={false} // Disable event listening for better performance
                  />
                )
              })
            })}
            
            {/* Reduced number of crosses for better performance */}
            {Array.from({ length: 11 }).map((_, i) => {
              return Array.from({ length: 11 }).map((_, j) => {
                // More frequent crosses for a richer grid
                const gridSize = 400
                const x = -3000 + j * gridSize
                const y = -3000 + i * gridSize
                
                // Skip distant crosses
                const distanceFromCenter = Math.sqrt(Math.pow(x / 3000, 2) + Math.pow(y / 3000, 2))
                if (distanceFromCenter > 1.2) return null
                
                // Skip the center cross
                if (x === 0 && y === 0) return null
                
                const opacity = Math.max(0.3, 0.9 - distanceFromCenter * 0.5)
                const crossSize = 3
                
                return (
                  <Group 
                    key={`cross-${i}-${j}`} 
                    opacity={opacity} 
                    listening={false} // Disable event listening
                  >
                    {/* Simple royal blue crosses */}
                    <Line
                      points={[x - crossSize, y, x + crossSize, y]}
                      stroke="#4169E1" // Royal blue
                      strokeWidth={1}
                      lineCap="round"
                      perfectDrawEnabled={false}
                    />
                    <Line
                      points={[x, y - crossSize, x, y + crossSize]}
                      stroke="#4169E1" // Royal blue
                      strokeWidth={1}
                      lineCap="round"
                      perfectDrawEnabled={false}
                    />
                  </Group>
                )
              })
            })}
          </Group>
          
          {/* Origin marker (center of canvas) */}
          <Group>
            <Rect
              width={20}
              height={20}
              x={-10}
              y={-10}
              fill="rgba(255, 255, 255, 0.1)"
              cornerRadius={4}
            />
            <Text
              text="0,0"
              fontSize={10}
              fill="rgba(255, 255, 255, 0.5)"
              x={-8}
              y={-7}
            />
          </Group>
          
          {/* Render all bento box components with proper depth scaling */}
          {sortedComponents.map((component) => {
            // Each component stands on its own now - the depth scaling happens within the component
            // This ensures no clipping or overlapping of elements
            return (
              <BentoComponentWrapper 
                key={component.id} 
                componentId={component.id}
                onCardWheel={handleCardWheel}
              >
                <ComponentFactory component={component} />
              </BentoComponentWrapper>
            )
          })}
        </Layer>
      </Stage>
      )}
    </div>
  )
}

export default MainCanvas
