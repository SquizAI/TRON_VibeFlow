import React from 'react';
import { Group, Line, Circle, Arrow, Text } from 'react-konva';
import { ConnectionType, FlowNode, NODE_TYPES, DEFAULT_NODE_CONFIG } from '../../types/automation';

interface NodeConnectionProps {
  connection: ConnectionType;
  nodes: FlowNode[];
}

const NodeConnection: React.FC<NodeConnectionProps> = ({ connection, nodes }) => {
  // Find source and target nodes
  const sourceNode = nodes.find(node => node.id === connection.from);
  const targetNode = nodes.find(node => node.id === connection.to);
  
  if (!sourceNode || !targetNode) return null;
  
  // Calculate source and target positions
  const sourceNodeConfig = NODE_TYPES[sourceNode.type.split(':')[1]] || DEFAULT_NODE_CONFIG;
  
  // Node dimensions (must match AutomationNode component)
  const nodeWidth = 220;
  const nodeHeight = 120;
  
  // Calculate connection points
  const sourceX = sourceNode.position.x + nodeWidth;
  const sourceY = sourceNode.position.y + nodeHeight / 2;
  
  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y + nodeHeight / 2;
  
  // Adjust source Y if this is a router node with multiple outputs
  let adjustedSourceY = sourceY;
  if (sourceNode.type.includes('Router') && connection.data?.routeIndex !== undefined) {
    const offset = connection.data.routeIndex === 0 ? -20 : 20;
    adjustedSourceY = sourceY + offset;
  }
  
  // Calculate control points for the bezier curve
  const sourceControlX = sourceX + 50;
  const targetControlX = targetX - 50;
  
  // Determine connection color and style
  const getConnectionColor = () => {
    // Use source node color for connection
    const color = sourceNodeConfig.color;
    
    // Special case for router nodes
    if (sourceNode.type.includes('Router') && connection.data?.routeIndex !== undefined) {
      return connection.data.routeIndex === 0 ? '#4169E1' : '#ff66c4';
    }
    
    return color;
  };
  
  const connectionColor = getConnectionColor();
  const connectionWidth = 2;
  const dotRadius = 3;
  const dotSpacing = 30;
  
  // Calculate a path with the bezier curve
  const bezierPath = [
    sourceX, adjustedSourceY,
    sourceControlX, adjustedSourceY,
    targetControlX, targetY,
    targetX, targetY
  ];
  
  return (
    <Group>
      {/* Main bezier connection line */}
      <Line
        points={bezierPath}
        stroke={connectionColor}
        strokeWidth={connectionWidth}
        tension={0.5}
        bezier={true}
        shadowColor={connectionColor}
        shadowBlur={5}
        shadowOpacity={0.3}
        lineCap="round"
        lineJoin="round"
      />
      
      {/* Connection start point glow */}
      <Circle
        x={sourceX}
        y={adjustedSourceY}
        radius={dotRadius + 1}
        fill={connectionColor}
        shadowColor={connectionColor}
        shadowBlur={5}
        shadowOpacity={0.5}
      />
      
      {/* Connection dots along the path */}
      {calculateDotsAlongPath(bezierPath, dotSpacing).map((point, index) => (
        <Circle
          key={`dot-${connection.id}-${index}`}
          x={point.x}
          y={point.y}
          radius={dotRadius}
          fill={connectionColor}
          opacity={0.7}
        />
      ))}
      
      {/* Arrow tip at the target end */}
      <Arrow
        points={[
          targetX - 15, targetY,
          targetX, targetY
        ]}
        pointerLength={8}
        pointerWidth={8}
        fill={connectionColor}
        stroke={connectionColor}
        strokeWidth={connectionWidth}
        shadowColor={connectionColor}
        shadowBlur={5}
        shadowOpacity={0.3}
      />
      
      {/* Connection data label - if present */}
      {connection.data?.label && (
        <Text
          x={(sourceX + targetX) / 2 - 30}
          y={(adjustedSourceY + targetY) / 2 - 10}
          text={connection.data.label}
          fontSize={11}
          fontFamily="Inter, sans-serif"
          fill="#CCCCCC"
          padding={3}
          background="#1A1A1A"
        />
      )}
    </Group>
  );
};

// Helper function to calculate points along a bezier curve
const calculateDotsAlongPath = (bezierPoints: number[], spacing: number) => {
  const dots: {x: number, y: number}[] = [];
  
  // Calculate total path length roughly (this is an approximation)
  const [x1, y1, cx1, cy1, cx2, cy2, x2, y2] = bezierPoints;
  const pathLength = 
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) +
    Math.sqrt(Math.pow(cx1 - x1, 2) + Math.pow(cy1 - y1, 2)) +
    Math.sqrt(Math.pow(cx2 - cx1, 2) + Math.pow(cy2 - cy1, 2)) +
    Math.sqrt(Math.pow(x2 - cx2, 2) + Math.pow(y2 - cy2, 2));
  
  // Number of dots (at least 2 dots)
  const dotsCount = Math.max(2, Math.floor(pathLength / spacing));
  
  // Place dots along the path
  for (let i = 1; i < dotsCount; i++) {
    const t = i / dotsCount;
    
    // Cubic bezier formula
    const x = 
      Math.pow(1 - t, 3) * x1 +
      3 * Math.pow(1 - t, 2) * t * cx1 +
      3 * (1 - t) * Math.pow(t, 2) * cx2 +
      Math.pow(t, 3) * x2;
      
    const y = 
      Math.pow(1 - t, 3) * y1 +
      3 * Math.pow(1 - t, 2) * t * cy1 +
      3 * (1 - t) * Math.pow(t, 2) * cy2 +
      Math.pow(t, 3) * y2;
    
    dots.push({ x, y });
  }
  
  return dots;
};

export default NodeConnection;
