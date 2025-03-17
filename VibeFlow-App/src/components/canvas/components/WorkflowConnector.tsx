import React from 'react';
import { Line, Group } from 'react-konva';

interface Point {
  x: number;
  y: number;
}

interface WorkflowConnectorProps {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePosition: Point;
  targetPosition: Point;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  isSelected?: boolean;
}

const WorkflowConnector: React.FC<WorkflowConnectorProps> = ({
  id,
  sourcePosition,
  targetPosition,
  color = '#6B7280',
  style = 'solid',
  isSelected = false
}) => {
  // Calculate control points for a smooth curve
  const controlPoint1 = {
    x: sourcePosition.x,
    y: sourcePosition.y + Math.abs(targetPosition.y - sourcePosition.y) / 2
  };
  
  const controlPoint2 = {
    x: targetPosition.x,
    y: sourcePosition.y + Math.abs(targetPosition.y - sourcePosition.y) / 2
  };
  
  // Determine line dash pattern based on style
  const getDashArray = () => {
    switch (style) {
      case 'dashed':
        return [10, 5];
      case 'dotted':
        return [2, 4];
      default:
        return [];
    }
  };
  
  return (
    <Group name={`connector-${id}`}>
      {/* Main connection line */}
      <Line
        points={[
          sourcePosition.x, sourcePosition.y,
          controlPoint1.x, controlPoint1.y,
          controlPoint2.x, controlPoint2.y,
          targetPosition.x, targetPosition.y
        ]}
        stroke={isSelected ? '#3B82F6' : color}
        strokeWidth={isSelected ? 2 : 1.5}
        tension={0.4}
        lineCap="round"
        dash={getDashArray()}
        shadowColor={isSelected ? 'rgba(59, 130, 246, 0.5)' : 'transparent'}
        shadowBlur={isSelected ? 4 : 0}
        shadowOffset={{ x: 0, y: 0 }}
        shadowOpacity={0.5}
      />
      
      {/* Arrow at the target end */}
      <Line
        points={[
          targetPosition.x - 8, targetPosition.y - 8,
          targetPosition.x, targetPosition.y,
          targetPosition.x - 8, targetPosition.y + 8
        ]}
        stroke={isSelected ? '#3B82F6' : color}
        strokeWidth={isSelected ? 2 : 1.5}
        lineCap="round"
        lineJoin="round"
        shadowColor={isSelected ? 'rgba(59, 130, 246, 0.5)' : 'transparent'}
        shadowBlur={isSelected ? 4 : 0}
        shadowOffset={{ x: 0, y: 0 }}
        shadowOpacity={0.5}
      />
    </Group>
  );
};

export default WorkflowConnector;
