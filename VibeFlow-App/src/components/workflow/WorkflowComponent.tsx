import { Group, Text, Rect, Line, Circle } from 'react-konva'
import { WorkflowComponent as WorkflowComponentType, WorkflowNode, WorkflowEdge } from '../../types/canvas'
import useCanvasStore from '../../store/canvasStore'

interface WorkflowComponentProps {
  data: WorkflowComponentType
}

// Node type color mapping
const NODE_COLORS = {
  'trigger': '#3282F6',
  'action': '#31C48D',
  'condition': '#F59E0B',
  'transform': '#9C27B0',
  'output': '#EF4444'
}

// Default node color for unknown types
const DEFAULT_NODE_COLOR = '#6E7C8C'

const WorkflowComponent = ({ data }: WorkflowComponentProps) => {
  const { updateComponent } = useCanvasStore()
  const padding = 15
  const nodeWidth = 150
  const nodeHeight = 40
  
  // Helper to get node color based on type
  const getNodeColor = (type: string) => {
    return NODE_COLORS[type as keyof typeof NODE_COLORS] || DEFAULT_NODE_COLOR
  }
  
  // Draw edges between nodes (connections)
  const renderEdges = () => {
    return (
      <Group>
        {data.edges.map((edge) => {
          const source = data.nodes.find(node => node.id === edge.source)
          const target = data.nodes.find(node => node.id === edge.target)
          
          if (!source || !target) return null
          
          // Calculate edge points
          const sourceX = source.position.x + nodeWidth / 2
          const sourceY = source.position.y + nodeHeight
          const targetX = target.position.x + nodeWidth / 2
          const targetY = target.position.y
          
          // Define path points with a curve
          const midY = (sourceY + targetY) / 2
          
          return (
            <Group key={edge.id}>
              {/* Main edge line */}
              <Line
                points={[
                  sourceX, sourceY,
                  sourceX, midY,
                  targetX, midY,
                  targetX, targetY
                ]}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={1.5}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
              />
              
              {/* Arrow head */}
              <Line
                points={[
                  targetX - 5, targetY - 5,
                  targetX, targetY,
                  targetX + 5, targetY - 5
                ]}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={1.5}
                lineCap="round"
                lineJoin="round"
              />
              
              {/* Animated data flow particle */}
              <Circle
                x={sourceX}
                y={sourceY + 10}
                radius={2}
                fill="white"
                // In a real implementation, these would animate along the path
              />
            </Group>
          )
        })}
      </Group>
    )
  }
  
  // Draw workflow nodes
  const renderNodes = () => {
    return (
      <Group>
        {data.nodes.map((node) => {
          const nodeColor = getNodeColor(node.type)
          
          return (
            <Group key={node.id} x={node.position.x} y={node.position.y}>
              {/* Node background */}
              <Rect
                width={nodeWidth}
                height={nodeHeight}
                fill={nodeColor + '20'}
                stroke={nodeColor}
                strokeWidth={1.5}
                cornerRadius={5}
                shadowColor="rgba(0, 0, 0, 0.3)"
                shadowBlur={5}
                shadowOpacity={0.5}
              />
              
              {/* Node type indicator */}
              <Rect
                width={5}
                height={nodeHeight}
                fill={nodeColor}
                cornerRadius={[5, 0, 0, 5]}
              />
              
              {/* Node label */}
              <Text
                x={15}
                y={12}
                text={node.data.label}
                fontSize={13}
                fontFamily="Inter, sans-serif"
                fill="white"
                width={nodeWidth - 20}
              />
              
              {/* Input port */}
              {node.type !== 'trigger' && (
                <Circle
                  x={nodeWidth / 2}
                  y={0}
                  radius={5}
                  fill="#1A2636"
                  stroke={nodeColor}
                  strokeWidth={1}
                />
              )}
              
              {/* Output port */}
              {node.type !== 'output' && (
                <Circle
                  x={nodeWidth / 2}
                  y={nodeHeight}
                  radius={5}
                  fill="#1A2636"
                  stroke={nodeColor}
                  strokeWidth={1}
                />
              )}
            </Group>
          )
        })}
      </Group>
    )
  }
  
  // Render workflow status badge
  const renderStatusBadge = () => {
    const statusColors = {
      'draft': '#6E7C8C',
      'active': '#31C48D',
      'paused': '#F59E0B'
    }
    
    return (
      <Group x={data.width - 100 - padding} y={15}>
        <Rect
          width={85}
          height={22}
          fill={statusColors[data.status] + '30'}
          cornerRadius={11}
        />
        <Text
          x={10}
          y={3}
          text={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          fontSize={12}
          fontStyle="bold"
          fontFamily="Inter, sans-serif"
          fill={statusColors[data.status]}
          width={65}
          align="center"
        />
      </Group>
    )
  }
  
  // Render workflow description
  const renderDescription = () => {
    return (
      <Group y={50}>
        <Text
          x={padding}
          y={0}
          text={data.description}
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="rgba(255, 255, 255, 0.8)"
          width={data.width - padding * 2}
        />
      </Group>
    )
  }
  
  // Render workflow diagram
  const renderWorkflowDiagram = () => {
    return (
      <Group y={80}>
        <Rect
          x={padding}
          y={0}
          width={data.width - padding * 2}
          height={data.height - 100}
          fill="rgba(16, 28, 43, 0.5)"
          cornerRadius={5}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />
        
        {/* Scale the workflow diagram to fit the container */}
        <Group
          x={padding + 10}
          y={10}
          scaleX={0.7}
          scaleY={0.7}
        >
          {renderEdges()}
          {renderNodes()}
        </Group>
      </Group>
    )
  }
  
  return (
    <Group>
      {renderStatusBadge()}
      {renderDescription()}
      {renderWorkflowDiagram()}
    </Group>
  )
}

export default WorkflowComponent
