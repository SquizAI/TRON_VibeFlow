import React from 'react'
import { Line, Group, Circle, Text } from 'react-konva'
import { Relationship } from '../../../types/canvas'

interface RelationshipConnectorProps {
  relationship: Relationship
  sourcePosition: { x: number, y: number }
  targetPosition: { x: number, y: number }
  isSelected?: boolean
  onClick?: () => void
}

const RelationshipConnector: React.FC<RelationshipConnectorProps> = ({
  relationship,
  sourcePosition,
  targetPosition,
  isSelected = false,
  onClick
}) => {
  // Royal blue theme (#4169E1)
  const getRelationshipColor = () => {
    switch (relationship.type) {
      case 'parent':
        return '#4169E1' // Royal blue for parent
      case 'child':
        return '#41A9E1' // Lighter blue for child
      case 'related':
        return '#7941E1' // Purple-blue for related
      case 'reference':
        return '#E19541' // Orange for reference
      case 'tag':
        return '#41E1A9' // Teal for tag
      default:
        return '#4169E1' // Default royal blue
    }
  }
  
  const getRelationshipDash = () => {
    switch (relationship.type) {
      case 'parent':
      case 'child':
        return undefined // Solid line
      case 'related':
        return [5, 2] // Dashed line
      case 'reference':
        return [10, 5] // Long dashed line
      case 'tag':
        return [2, 2] // Short dotted line
      default:
        return undefined
    }
  }
  
  // Calculate line details
  const color = getRelationshipColor()
  const dash = getRelationshipDash()
  const strokeWidth = isSelected ? 2 : 1
  
  // Calculate direction and midpoint for arrow and label
  const dx = targetPosition.x - sourcePosition.x
  const dy = targetPosition.y - sourcePosition.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Normalize the direction
  const nx = dx / distance
  const ny = dy / distance
  
  // Calculate midpoint
  const midX = sourcePosition.x + dx / 2
  const midY = sourcePosition.y + dy / 2
  
  // Calculate a point for the arrow that's slightly before the target
  const arrowMargin = 15
  const arrowX = targetPosition.x - nx * arrowMargin
  const arrowY = targetPosition.y - ny * arrowMargin
  
  // Calculate perpendicular direction for arrow head
  const perpX = -ny
  const perpY = nx
  
  // Arrow head points
  const arrowSize = 8
  const arrowPoints = [
    arrowX, arrowY,
    arrowX - nx * arrowSize + perpX * arrowSize, arrowY - ny * arrowSize + perpY * arrowSize,
    arrowX - nx * arrowSize - perpX * arrowSize, arrowY - ny * arrowSize - perpY * arrowSize,
  ]
  
  // Adjust line endpoints to stop at the edge of components (assuming component is roughly 30px from center)
  const componentMargin = 30
  const adjustedSourceX = sourcePosition.x + nx * componentMargin
  const adjustedSourceY = sourcePosition.y + ny * componentMargin
  const adjustedTargetX = targetPosition.x - nx * componentMargin
  const adjustedTargetY = targetPosition.y - ny * componentMargin
  
  // Determine if we should render the strength indicator
  const showStrengthIndicator = relationship.strength > 0
  
  return (
    <Group onClick={onClick}>
      {/* Main connection line */}
      <Line
        points={[adjustedSourceX, adjustedSourceY, adjustedTargetX, adjustedTargetY]}
        stroke={color}
        strokeWidth={strokeWidth}
        dash={dash}
        lineCap="round"
        shadowColor={color}
        shadowBlur={isSelected ? 5 : 0}
        shadowOpacity={0.5}
        opacity={relationship.strength * 0.5 + 0.5} // Vary opacity by strength
      />
      
      {/* Arrow head */}
      <Line
        points={arrowPoints}
        closed
        fill={color}
        stroke={color}
        strokeWidth={1}
        opacity={relationship.strength * 0.5 + 0.5}
      />
      
      {/* Relationship strength indicator in the middle */}
      {showStrengthIndicator && (
        <Group x={midX} y={midY}>
          <Circle
            radius={10}
            fill={isSelected ? color : 'rgba(17, 17, 51, 0.7)'}
            stroke={color}
            strokeWidth={1}
          />
          
          <Text
            text={Math.round(relationship.strength * 10).toString()}
            fontSize={8}
            fontStyle="bold"
            fill="#FFFFFF"
            align="center"
            verticalAlign="middle"
            width={20}
            height={20}
            offsetX={10}
            offsetY={10}
          />
        </Group>
      )}
      
      {/* Pulsating animation effect when selected */}
      {isSelected && (
        <React.Fragment>
          <Circle
            x={midX}
            y={midY}
            radius={15}
            fill="transparent"
            stroke={color}
            strokeWidth={1}
            opacity={0.3}
            // Add animation effect in a real app with useAnimationFrame or Konva animations
          />
        </React.Fragment>
      )}
    </Group>
  )
}

export default RelationshipConnector
