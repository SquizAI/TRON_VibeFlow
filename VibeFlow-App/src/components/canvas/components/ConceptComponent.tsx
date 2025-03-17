import { Group, Rect, Text, Circle, Line } from 'react-konva'
import { ConceptComponent as ConceptComponentType } from '../../../types/canvas'
import { useState } from 'react'

interface ConceptComponentProps {
  data: ConceptComponentType
}

const ConceptComponent = ({ data }: ConceptComponentProps) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const padding = 15
  const width = data.width
  const height = data.height
  
  // Royal blue color scheme
  const baseColor = '#4169E1' // Royal blue
  const backgroundColor = '#111133'
  const connectorColor = 'rgba(65, 105, 225, 0.7)'
  
  return (
    <Group
      x={data.x}
      y={data.y}
      width={width}
      height={height}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card background with subtle glow */}
      <Rect
        width={width}
        height={height}
        fill={backgroundColor}
        cornerRadius={8}
        strokeWidth={1.5}
        stroke={baseColor}
        shadowColor={baseColor}
        shadowBlur={isHovered ? 10 : 5}
        shadowOpacity={0.3}
        shadowOffset={{ x: 0, y: 2 }}
      />
      
      {/* Concept icon */}
      <Circle
        x={padding + 15}
        y={padding + 15}
        radius={15}
        fill={baseColor}
      />
      
      {/* Concept icon inner details - abstract graph node representation */}
      <Circle
        x={padding + 15}
        y={padding + 15}
        radius={7}
        fill="#FFFFFF"
      />
      
      <Line
        points={[
          padding + 8, padding + 8,
          padding + 22, padding + 22
        ]}
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />
      
      <Line
        points={[
          padding + 8, padding + 22,
          padding + 22, padding + 8
        ]}
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />
      
      {/* Title */}
      <Text
        x={padding + 40}
        y={padding}
        text={data.title}
        fontSize={18}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill="#FFFFFF"
        width={width - padding * 2 - 50}
      />
      
      {/* Divider line */}
      <Line
        points={[padding, padding + 40, width - padding, padding + 40]}
        stroke={baseColor}
        strokeWidth={1}
        opacity={0.5}
      />
      
      {/* Definition label */}
      <Text
        x={padding}
        y={padding + 50}
        text="Definition"
        fontSize={14}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill={baseColor}
      />
      
      {/* Definition content */}
      <Text
        x={padding}
        y={padding + 70}
        text={data.definition}
        fontSize={14}
        fontFamily="Inter, sans-serif"
        fill="#FFFFFF"
        width={width - padding * 2}
        height={80}
        ellipsis={true}
      />
      
      {/* Related concepts section */}
      <Text
        x={padding}
        y={padding + 160}
        text="Related Concepts"
        fontSize={14}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill={baseColor}
      />
      
      {/* Related concept dots with connecting lines */}
      <Group y={padding + 180}>
        {data.relatedTo && data.relatedTo.slice(0, 5).map((_, index) => {
          const dotX = padding + index * 30
          return (
            <Group key={`related-${index}`}>
              <Circle
                x={dotX}
                y={10}
                radius={5}
                fill={baseColor}
              />
              
              {index < (data.relatedTo.length - 1) && index < 4 && (
                <Line
                  points={[dotX + 5, 10, dotX + 25, 10]}
                  stroke={connectorColor}
                  strokeWidth={1.5}
                  dash={[2, 2]}
                />
              )}
            </Group>
          )
        })}
      </Group>
      
      {/* Keywords */}
      <Group y={padding + 210}>
        {data.keywords && data.keywords.slice(0, 3).map((keyword, index) => {
          const chipWidth = Math.min(keyword.length * 8 + 20, 100)
          const xPos = padding + (index > 0 ? (index * chipWidth + 10 * index) : 0)
          
          return (
            <Group key={`keyword-${index}`} x={xPos}>
              <Rect
                width={chipWidth}
                height={24}
                fill="rgba(65, 105, 225, 0.2)"
                cornerRadius={12}
                stroke={baseColor}
                strokeWidth={1}
              />
              <Text
                text={keyword}
                x={10}
                y={5}
                fontSize={12}
                fontFamily="Inter, sans-serif"
                fill="#FFFFFF"
                width={chipWidth - 20}
                align="center"
              />
            </Group>
          )
        })}
      </Group>
      
      {/* References count indicator */}
      {data.references && data.references.length > 0 && (
        <Group x={width - padding - 30} y={padding + 210}>
          <Rect
            width={30}
            height={24}
            fill="rgba(65, 105, 225, 0.2)"
            cornerRadius={12}
          />
          <Text
            text={`${data.references.length}`}
            x={0}
            y={5}
            fontSize={12}
            fontFamily="Inter, sans-serif"
            fill="#FFFFFF"
            width={30}
            align="center"
          />
        </Group>
      )}
    </Group>
  )
}

export default ConceptComponent
