import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Image, Circle, Line } from 'react-konva';
import useImage from 'use-image';
import useCanvasStore from '../../../store/canvasStore';
import { NodePort } from '../../../types/canvas';

interface WorkflowNodeProps {
  data: {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    module: string;
    nodeType: 'trigger' | 'action' | 'condition' | 'output' | 'transformation';
    description?: string;
    connected?: boolean;
    outputConnections?: any[];
    inputConnections?: any[];
    config?: Record<string, any>;
    status?: 'pending' | 'running' | 'completed' | 'error';
    lastExecutionResult?: any;
    validationErrors?: string[];
  };
}

const WorkflowNodeComponent: React.FC<WorkflowNodeProps> = ({ data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ports, setPorts] = useState<{ inputs: NodePort[], outputs: NodePort[] }>({ inputs: [], outputs: [] });
  const { selectedComponentId } = useCanvasStore();
  const [statusAnimation, setStatusAnimation] = useState(0);
  
  // Load appropriate icon based on node type
  const iconPath = `/icons/${data.nodeType}.svg`;
  const [icon] = useImage(iconPath);
  
  // Set colors based on node type - now using royal blue theme
  const getNodeColor = () => {
    switch (data.nodeType) {
      case 'trigger':
        return '#4169E1'; // Royal blue for triggers
      case 'action':
        return '#3151E1'; // Slightly darker blue for actions
      case 'condition':
        return '#4183E1'; // Lighter blue for conditions
      case 'output':
        return '#418AE1'; // Light blue for outputs
      case 'transformation':
        return '#6C41E1'; // Purple-blue for transformations
      default:
        return '#4169E1'; // Default royal blue
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return '#41E1E1'; // Cyan
      case 'completed':
        return '#41E183'; // Green
      case 'error':
        return '#E14169'; // Red
      case 'pending':
      default:
        return '#E1C341'; // Yellow
    }
  };
  
  // Animation for running status
  useEffect(() => {
    let animationFrame: number;
    
    if (data.status === 'running') {
      const animate = () => {
        setStatusAnimation((prev) => (prev + 1) % 100);
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [data.status]);
  
  // Generate ports based on inputs and outputs
  useEffect(() => {
    // Example ports - in a real app, these would come from the node definition
    const generatedPorts = {
      inputs: data.inputConnections?.map((_, i) => ({
        id: `in-${i}`,
        name: `Input ${i + 1}`,
        type: 'input' as const,
        dataType: 'any',
      })) || [],
      outputs: data.outputConnections?.map((_, i) => ({
        id: `out-${i}`,
        name: `Output ${i + 1}`,
        type: 'output' as const,
        dataType: 'any',
      })) || []
    };
    
    setPorts(generatedPorts);
  }, [data.inputConnections, data.outputConnections]);
  
  const backgroundColor = getNodeColor();
  const statusColor = getStatusColor();
  const isSelected = selectedComponentId === data.id;
  
  // Function to render ports
  const renderPorts = () => {
    const portsGroup = [];
    const portSize = 8;
    const portSpacing = 20;
    
    // Input ports on the left side
    if (ports.inputs.length > 0) {
      for (let i = 0; i < ports.inputs.length; i++) {
        const y = 60 + i * portSpacing;
        
        portsGroup.push(
          <Group key={`input-${i}`} y={y}>
            <Circle
              x={0}
              radius={portSize}
              fill="#FFFFFF"
              stroke={backgroundColor}
              strokeWidth={2}
            />
            <Text
              x={portSize + 5}
              y={-8}
              text={ports.inputs[i].name}
              fontSize={10}
              fill="#FFFFFF"
              width={60}
              ellipsis={true}
            />
          </Group>
        );
      }
    }
    
    // Output ports on the right side
    if (ports.outputs.length > 0) {
      for (let i = 0; i < ports.outputs.length; i++) {
        const y = 60 + i * portSpacing;
        
        portsGroup.push(
          <Group key={`output-${i}`} y={y} x={data.width}>
            <Circle
              x={0}
              radius={portSize}
              fill="#FFFFFF"
              stroke={backgroundColor}
              strokeWidth={2}
            />
            <Text
              x={-65}
              y={-8}
              text={ports.outputs[i].name}
              fontSize={10}
              fill="#FFFFFF"
              width={60}
              align="right"
              ellipsis={true}
            />
          </Group>
        );
      }
    }
    
    return portsGroup;
  };
  
  return (
    <Group
      x={data.x}
      y={data.y}
      width={data.width}
      height={data.height}
      name={`node-${data.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Background with rounded corners and royal blue theme glow */}
      <Rect
        width={data.width}
        height={data.height}
        fill={backgroundColor}
        shadowColor={backgroundColor}
        shadowBlur={isSelected ? 10 : 5}
        shadowOpacity={isSelected ? 0.5 : 0.3}
        shadowOffset={{ x: 0, y: 2 }}
        cornerRadius={8}
        opacity={isHovered ? 0.95 : 0.85}
        stroke={isSelected ? '#FFFFFF' : 'transparent'}
        strokeWidth={isSelected ? 2 : 0}
      />
      
      {/* Status indicator */}
      {data.status && (
        <Group x={data.width - 25} y={15}>
          <Circle
            radius={6}
            fill={statusColor}
          />
          
          {/* Pulsating animation for running status */}
          {data.status === 'running' && (
            <Circle
              radius={10 + (statusAnimation % 20) / 10}
              fill="transparent"
              stroke={statusColor}
              strokeWidth={1}
              opacity={(100 - statusAnimation) / 100}
            />
          )}
        </Group>
      )}
      
      {/* Node icon */}
      {icon && (
        <Image
          image={icon}
          x={15}
          y={15}
          width={20}
          height={20}
        />
      )}
      
      {/* Node title */}
      <Text
        x={icon ? 45 : 15}
        y={15}
        text={data.title}
        fill="#FFFFFF"
        fontSize={14}
        fontStyle="bold"
        width={data.width - (icon ? 75 : 45)}
        ellipsis={true}
      />
      
      {/* Module type */}
      <Text
        x={15}
        y={35}
        text={data.module}
        fill="#FFFFFF"
        fontSize={11}
        width={data.width - 30}
        opacity={0.8}
        ellipsis={true}
      />
      
      {/* Connection ports */}
      {renderPorts()}
      
      {/* Divider line */}
      <Line
        points={[10, 55, data.width - 10, 55]}
        stroke="#FFFFFF"
        strokeWidth={1}
        opacity={0.3}
      />
      
      {/* Optional description */}
      {data.description && (
        <Text
          x={10}
          y={50}
          text={data.description}
          fill="#FFFFFF"
          fontSize={11}
          width={data.width - 20}
          height={data.height - 60}
          ellipsis={true}
          opacity={0.7}
        />
      )}
      
      {/* Icon in top right corner if available */}
      {icon && (
        <Image
          x={data.width - 30}
          y={10}
          image={icon}
          width={20}
          height={20}
          opacity={0.9}
        />
      )}
      
      {/* Connection points */}
      {/* Input connection point (top center) */}
      <Rect
        x={(data.width / 2) - 5}
        y={-5}
        width={10}
        height={10}
        cornerRadius={5}
        fill="#FFFFFF"
        opacity={0.9}
        stroke={isHovered ? "#3B82F6" : "rgba(0,0,0,0.3)"}
        strokeWidth={1}
      />
      
      {/* Output connection point (bottom center) */}
      <Rect
        x={(data.width / 2) - 5}
        y={data.height - 5}
        width={10}
        height={10}
        cornerRadius={5}
        fill="#FFFFFF"
        opacity={0.9}
        stroke={isHovered ? "#3B82F6" : "rgba(0,0,0,0.3)"}
        strokeWidth={1}
      />
    </Group>
  );
};

export default WorkflowNodeComponent;
