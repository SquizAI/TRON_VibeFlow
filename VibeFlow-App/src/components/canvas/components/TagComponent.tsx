import { Group, Rect, Text, Circle, Line } from 'react-konva'
import { TagComponent as TagComponentType } from '../../../types/canvas'
import { useState } from 'react'

interface TagComponentProps {
  data: TagComponentType
}

const TagComponent = ({ data }: TagComponentProps) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const padding = 12
  const width = data.width
  const height = data.height
  
  // Use royal blue (#4169E1) as base color as per user preference
  const baseColor = data.color || '#4169E1'
  const backgroundColor = 'rgba(17, 17, 51, 0.8)'
  
  return (
    <Group
      x={data.x}
      y={data.y}
      width={width}
      height={height}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tag background with subtle glow */}
      <Rect
        width={width}
        height={height}
        fill={backgroundColor}
        cornerRadius={8}
        strokeWidth={1.5}
        stroke={baseColor}
        shadowColor={baseColor}
        shadowBlur={isHovered ? 8 : 4}
        shadowOpacity={0.3}
        shadowOffset={{ x: 0, y: 2 }}
      />
      
      {/* Tag icon - subtle hash symbol */}
      <Text
        x={padding}
        y={padding - 2}
        text="#"
        fontSize={20}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill={baseColor}
      />
      
      {/* Tag title */}
      <Text
        x={padding + 18}
        y={padding}
        text={data.title}
        fontSize={16}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill="#FFFFFF"
        width={width - padding * 2 - 20}
      />
      
      {/* Tag count indicator - circle with number */}
      {data.count && data.count > 0 && (
        <Group x={width - padding - 24} y={padding + 2}>
          <Circle
            radius={12}
            fill={baseColor}
          />
          <Text
            text={data.count.toString()}
            fontSize={11}
            fontFamily="Inter, sans-serif"
            fontStyle="bold"
            fill="#FFFFFF"
            x={-8}
            y={-6}
            width={16}
            align="center"
          />
        </Group>
      )}
      
      {/* Divider line */}
      <Line
        points={[padding, padding + 30, width - padding, padding + 30]}
        stroke={baseColor}
        strokeWidth={1}
        opacity={0.5}
      />
      
      {/* Description if available */}
      {data.description && (
        <Text
          x={padding}
          y={padding + 40}
          text={data.description}
          fontSize={13}
          fontFamily="Inter, sans-serif"
          fill="#FFFFFF"
          opacity={0.8}
          width={width - padding * 2}
          height={height - padding * 2 - 50}
          ellipsis={true}
        />
      )}
      
      {/* Parent tag indicator if available */}
      {data.parent && (
        <Group y={height - padding - 24}>
          <Rect
            x={padding}
            width={width - padding * 2}
            height={24}
            fill="rgba(65, 105, 225, 0.2)"
            cornerRadius={12}
          />
          <Text
            text={`Parent: ${data.parent}`}
            x={padding + 10}
            y={5}
            fontSize={12}
            fontFamily="Inter, sans-serif"
            fill="#FFFFFF"
            width={width - padding * 2 - 20}
            ellipsis={true}
          />
        </Group>
      )}
      
      {/* Highlight effect for hover state */}
      {isHovered && (
        <Rect
          width={width}
          height={height}
          cornerRadius={8}
          stroke={baseColor}
          strokeWidth={2}
          fillEnabled={false}
        />
      )}
    </Group>
  )
}

export default TagComponent
