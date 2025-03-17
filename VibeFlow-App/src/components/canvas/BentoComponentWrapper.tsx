import { ReactNode, useRef, useState, useEffect } from 'react'
import { Group, Rect, Text, Transformer } from 'react-konva'
import useCanvasStore from '../../store/canvasStore'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'

interface BentoComponentWrapperProps {
  componentId: string
  children: ReactNode
  onCardWheel?: (e: KonvaEventObject<WheelEvent>, id: string) => void
}

const MIN_WIDTH = 150
const MIN_HEIGHT = 100

const BentoComponentWrapper = ({ componentId, children, onCardWheel }: BentoComponentWrapperProps) => {
  const { 
    getComponentById, 
    updateComponentPosition,
    updateComponent, 
    selectComponent, 
    selectedComponentId 
  } = useCanvasStore()
  
  const component = getComponentById(componentId)
  const groupRef = useRef<Konva.Group>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [resizing, setResizing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [localScale, setLocalScale] = useState(1)
  const isSelected = selectedComponentId === componentId

  if (!component) return null

  const { x, y, width, height, title } = component

  // Connect transformer to the node when selected
  useEffect(() => {
    if (isSelected && groupRef.current && transformerRef.current) {
      // Attach transformer
      transformerRef.current.nodes([groupRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])
  
  // Calculate content height to auto-adjust card height if needed - for all component types
  useEffect(() => {
    if (groupRef.current) {
      // We can estimate the content height based on the content type
      // This is a simplified version - in a real app, you would measure the actual content
      let estimatedContentHeight = 0
      
      // Type-specific adjustments
      if (component.type === 'note') {
        // For notes, use their description or a default height
        const noteContent = (component as any).description || ''
        const lineHeight = 20 // approximate line height in pixels
        const charsPerLine = Math.floor(width / 8) // rough estimate of characters per line  
        const lines = Math.ceil(noteContent.length / charsPerLine) || 1
        estimatedContentHeight = lines * lineHeight
      } else if (component.type === 'task') {
        // For tasks, estimate based on title length
        estimatedContentHeight = 60 // Base height for a task
        
        // Add extra space if there's a long title
        if (component.title.length > 30) {
          estimatedContentHeight += 30
        }
      } else if (component.type === 'workflow') {
        // Workflows are typically taller with more content
        estimatedContentHeight = 150
      } else if (component.type === 'template') {
        // Templates have moderate height
        estimatedContentHeight = 100
      }
      
      // Add padding and ensure minimum height
      const newHeight = Math.max(estimatedContentHeight + 80, MIN_HEIGHT) // 40px for header + padding
      
      // Only update if significantly different to avoid constant resizing
      if (Math.abs(newHeight - height) > 20) {
        updateComponent(componentId, { height: newHeight })
      }
    }
  }, [component.type, component.title, width, height, componentId, updateComponent])

  // Handle resize end
  const handleTransformEnd = () => {
    if (!groupRef.current) return
    
    setResizing(false)
    
    // Get the new dimensions and position
    const node = groupRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    
    // Reset scale and apply to width/height instead
    node.scaleX(1)
    node.scaleY(1)
    
    const newWidth = Math.max(node.width() * scaleX, MIN_WIDTH)
    const newHeight = Math.max(node.height() * scaleY, MIN_HEIGHT)
    
    // Update the node size
    node.width(newWidth)
    node.height(newHeight)
    
    // Update the component in the store
    updateComponent(componentId, {
      width: newWidth,
      height: newHeight,
      x: node.x(),
      y: node.y()
    })
  }

  // Handle card-specific wheel events for zooming
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.cancelBubble = true // Stop event propagation to prevent canvas zooming
    
    if (onCardWheel) {
      // Pass to parent handler
      onCardWheel(e, componentId)
    } else {
      // Default card-specific zoom behavior
      const scaleBy = 1.05
      const oldScale = localScale
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
      
      // Limit scale
      const limitedScale = Math.max(0.5, Math.min(2, newScale))
      setLocalScale(limitedScale)
      
      if (groupRef.current) {
        groupRef.current.getLayer()?.batchDraw()
      }
    }
  }

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        scaleX={localScale}
        scaleY={localScale}
        draggable
        onClick={(e) => {
          e.cancelBubble = true
          selectComponent(componentId)
        }}
        onDragStart={() => {}}
        onDragEnd={(e) => {
          updateComponentPosition(componentId, e.target.x(), e.target.y())
        }}
        onTransformStart={() => setResizing(true)}
        onTransform={() => {
          // This helps to update the visual during transform
          if (groupRef.current) {
            groupRef.current.getLayer()?.batchDraw()
          }
        }}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onWheel={handleWheel}
      >
        {/* Background for the bento component - with subtle gradient and royal blue accent */}
        <Rect
          width={width}
          height={height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: width, y: height }}
          fillLinearGradientColorStops={[0, '#111111', 1, '#1a1a1a']}
          stroke={isSelected ? "#4169E1" : hovered ? "#365DC9" : "#2A4494"}
          strokeWidth={isSelected ? 1.5 : hovered ? 1 : 0.5}
          cornerRadius={10}
          shadowColor={isSelected ? "#4169E1" : hovered ? "#365DC9" : "#2A4494"}
          shadowBlur={isSelected || resizing ? 4 : hovered ? 3 : 2}
          shadowOpacity={isSelected || resizing ? 0.3 : hovered ? 0.25 : 0.2}
          shadowOffsetY={2}
          perfectDrawEnabled={false}
        />
        
        {/* Component title - clean dark header with minimal gradient and royal blue accent */}
        <Rect
          width={width}
          height={40}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: width, y: 40 }}
          fillLinearGradientColorStops={[0, '#0a0a0a', 1, '#151515']}
          cornerRadius={[10, 10, 0, 0]}
          stroke={isSelected ? "#4169E1" : hovered ? "#365DC9" : "#2A4494"}
          strokeWidth={isSelected ? 1 : 0.5}
          perfectDrawEnabled={false}
        />
        
        <Text
          x={15}
          y={12}
          text={title}
          fontSize={16}
          fontFamily="Inter, sans-serif"
          fill="white"
          fontStyle="bold"
          perfectDrawEnabled={false}
        />
        
        {/* Component content */}
        <Group x={0} y={40} clipFunc={(ctx) => {
          ctx.beginPath()
          ctx.rect(0, 0, width, height - 40)
          ctx.closePath()
        }}>
          {children}
        </Group>
        
        {/* Optional dimension indicator when resizing */}
        {resizing && (
          <Group>
            <Rect
              x={width / 2 - 40}
              y={height + 10}
              width={80}
              height={24}
              fill="rgba(0, 0, 0, 0.7)"
              cornerRadius={4}
            />
            <Text
              x={width / 2 - 35}
              y={height + 15}
              text={`${Math.round(width)} × ${Math.round(height)}`}
              fontSize={12}
              fill="white"
              align="center"
            />
          </Group>
        )}
      </Group>
      
      {/* Transformer (visible only when selected) */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to minimum dimensions
            if (newBox.width < MIN_WIDTH || newBox.height < MIN_HEIGHT) {
              return oldBox
            }
            return newBox
          }}
          enabledAnchors={[
            'top-left', 'top-right', 'bottom-left', 'bottom-right',
            'middle-left', 'middle-right', 'top-center', 'bottom-center'
          ]}
          rotateEnabled={false}
          borderStroke="#3282F6"
          borderStrokeWidth={1}
          anchorFill="#FFFFFF"
          anchorStroke="#3282F6"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </>
  )
}

export default BentoComponentWrapper
