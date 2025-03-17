import React, { useState, useEffect, useRef } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { FlowNode, NODE_TYPES, DEFAULT_NODE_CONFIG, ConnectionHandle } from '../../types/automation';
import Konva from 'konva';

interface AutomationNodeProps {
  node: FlowNode;
  onDragStart: (e: KonvaEventObject<DragEvent>) => void;
  onDragMove: (e: KonvaEventObject<DragEvent>) => void;
  onClick: () => void;
  onHandleMouseDown?: (handleId: string, handleType: 'input' | 'output', position: {x: number, y: number}, nodeId: string) => void;
  onHandleMouseUp?: (handleId: string, handleType: 'input' | 'output', position: {x: number, y: number}, nodeId: string) => void;
  onHandleMouseOver?: (handleId: string, handleType: 'input' | 'output') => void;
  onHandleMouseOut?: (handleId: string, handleType: 'input' | 'output') => void;
  isSelected?: boolean;
  selectedConnectionHandle?: ConnectionHandle | null;
  showAITooltip?: boolean;
}

const AutomationNode: React.FC<AutomationNodeProps> = ({ 
  node, 
  onDragStart, 
  onDragMove, 
  onClick,
  onHandleMouseDown,
  onHandleMouseUp,
  onHandleMouseOver,
  onHandleMouseOut,
  isSelected = false,
  selectedConnectionHandle = null,
  showAITooltip = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<Konva.Group>(null);
  const aiTooltipOpacity = useRef<number>(0);
  const dragVelocity = useRef({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number, y: number } | null>(null);
  
  // Handle hover animations
  useEffect(() => {
    if (isHovered || isSelected) {
      const tween = new Konva.Tween({
        node: groupRef.current!,
        scaleX: 1.03,
        scaleY: 1.03,
        easing: Konva.Easings.EaseInOut,
        duration: 0.2,
      });
      tween.play();
      
      return () => tween.destroy();
    } else {
      const tween = new Konva.Tween({
        node: groupRef.current!,
        scaleX: 1,
        scaleY: 1,
        easing: Konva.Easings.EaseInOut,
        duration: 0.2,
      });
      tween.play();
      
      return () => tween.destroy();
    }
  }, [isHovered, isSelected]);
  // Get node configuration (color, icon, etc.) based on type
  const getNodeConfig = () => {
    // Extract the module type without the namespace
    const moduleType = node.type.includes(':') 
      ? node.type.split(':')[1] 
      : node.type;
    
    return NODE_TYPES[moduleType] || DEFAULT_NODE_CONFIG;
  };

  const nodeConfig = getNodeConfig();
  
  // Node dimensions and styling - modern proportions with better whitespace
  const width = 260;
  const height = 140;
  const cornerRadius = 12;
  const padding = 16;
  
  // Handle info (connection points) - larger and more prominent
  const handleRadius = 8;
  const inputHandleX = 0;
  const inputHandleY = height / 2;
  const outputHandleX = width;
  const outputHandleY = height / 2;

  // Enhanced node glow effect - more vibrant and defined
  const shadowBlur = 16;
  const shadowOpacity = 0.8;
  const innerGlowSize = 2.5;
  const glowColor = nodeConfig.color; // Use node type color for glow
  
  // Status indicator
  const statusColor = '#4CAF50'; // Default to success/ready
  
  // Handle physics-based movement
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    // Add inertia when dragging ends
    if (Math.abs(dragVelocity.current.x) > 5 || Math.abs(dragVelocity.current.y) > 5) {
      const inertiaAnimation = new Konva.Animation((frame) => {
        if (!frame) return;
        
        // Apply damping to gradually slow down
        dragVelocity.current.x *= 0.95;
        dragVelocity.current.y *= 0.95;
        
        // Stop the animation when velocity is small enough
        if (Math.abs(dragVelocity.current.x) < 0.5 && Math.abs(dragVelocity.current.y) < 0.5) {
          inertiaAnimation.stop();
          return;
        }
        
        // Move the node based on velocity
        if (groupRef.current) {
          groupRef.current.x(groupRef.current.x() + dragVelocity.current.x);
          groupRef.current.y(groupRef.current.y() + dragVelocity.current.y);
          
          // Trigger onDragMove to update node position in state
          onDragMove({
            ...e,
            target: groupRef.current
          } as KonvaEventObject<DragEvent>);
        }
      }, groupRef.current!.getLayer());
      
      inertiaAnimation.start();
      
      // Stop after max duration
      setTimeout(() => inertiaAnimation.stop(), 500);
    }
  };
  
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target.isDragging()) {
      // Track velocity during drag
      const stage = e.target.getStage();
      if (stage) {
        const pointerPosition = stage.getPointerPosition();
        if (pointerPosition) {
          const mouseX = pointerPosition.x;
          const mouseY = pointerPosition.y;
          
          // Calculate velocity based on mouse movement
          if (lastPointerPos.current) {
            dragVelocity.current.x = (mouseX - lastPointerPos.current.x) * 0.1;
            dragVelocity.current.y = (mouseY - lastPointerPos.current.y) * 0.1;
          }
          
          // Store current position for next frame
          lastPointerPos.current = { x: mouseX, y: mouseY };
        }
      }
    }
  };
  
  return (
    <Group
      ref={groupRef}
      x={node.position.x}
      y={node.position.y}
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      onMouseDown={() => setIsHovered(true)}
      onMouseUp={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Clean backdrop with subtle gradient for depth without 3D effect */}
      <Rect
        width={width + 8}
        height={height + 8}
        x={-4}
        y={-4}
        fill="rgba(10, 12, 16, 0.5)"
        cornerRadius={cornerRadius + 4}
        shadowColor="#000000"
        shadowBlur={20}
        shadowOpacity={0.4}
        shadowOffsetY={5}
        perfectDrawEnabled={false}
      />
      
      {/* Main node body with subtle gradient */}
      <Rect
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width, y: height }}
        fillLinearGradientColorStops={[0, '#1A1C24', 1, '#141820']}
        cornerRadius={cornerRadius}
        strokeWidth={0}
        perfectDrawEnabled={false}
      />
      
      {/* Glowing border - flat style with enhanced glow */}
      <Rect
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        stroke={glowColor}
        strokeWidth={innerGlowSize}
        shadowColor={glowColor}
        shadowBlur={shadowBlur}
        shadowOpacity={isHovered || isSelected ? shadowOpacity : shadowOpacity * 0.7}
        perfectDrawEnabled={false}
      />
      
      {/* Modern header bar */}
      <Rect
        x={6}
        y={6}
        width={width - 12}
        height={40}
        fill={glowColor}
        cornerRadius={cornerRadius - 2}
        opacity={0.95}
        shadowColor={glowColor}
        shadowBlur={6}
        shadowOpacity={0.3}
        perfectDrawEnabled={false}
      />
      
      {/* Node title - improved typography */}
      <Text
        x={padding}
        y={14}
        text={node.name}
        fontSize={16}
        fontStyle="bold"
        fontFamily="'SF Pro Display', 'Inter', sans-serif"
        fill="#FFFFFF"
        width={width - padding * 2 - 40} // Make room for icon
        ellipsis={true}
        letterSpacing={0.3}
      />
      
      {/* Type icon - visual indicator */}
      <Group x={width - padding - 25} y={padding + 6}>
        <Circle
          radius={12}
          fill="rgba(255, 255, 255, 0.15)"
          perfectDrawEnabled={false}
        />
        <Text
          x={-8}
          y={-8}
          text={nodeConfig.icon === 'webhook' ? '⚓' : 
                nodeConfig.icon === 'person' ? '👤' :
                nodeConfig.icon === 'call_split' ? '🔀' :
                nodeConfig.icon === 'smart_toy' ? '🤖' :
                nodeConfig.icon === 'psychology' ? '🧠' :
                nodeConfig.icon === 'edit' ? '✏️' :
                nodeConfig.icon === 'send' ? '📤' :
                nodeConfig.icon === 'timelapse' ? '⏱️' :
                nodeConfig.icon === 'block' ? '⛔' :
                nodeConfig.icon === 'storage' ? '💾' :
                nodeConfig.icon === 'notifications' ? '🔔' : '🔌'}
          fontSize={16}
          fontFamily="'SF Pro Display', 'Inter', sans-serif"
        />
      </Group>
      
      {/* Category badge - better visual hierarchy */}
      <Group x={padding} y={55}>
        <Rect
          width={90}
          height={22}
          fill="rgba(255, 255, 255, 0.07)"
          cornerRadius={11}
          perfectDrawEnabled={false}
        />
        <Text
          x={8}
          y={4}
          text={nodeConfig.category}
          fontSize={12}
          fontFamily="'SF Pro Display', 'Inter', sans-serif"
          fill="#FFFFFF"
          opacity={0.9}
        />
      </Group>
      
      {/* Node ID - subtle but readable */}
      <Text
        x={padding + 100}
        y={59}
        text={`ID: ${node.id.substring(0, 8)}`}
        fontSize={11}
        fontFamily="'SF Pro Display', 'Inter', monospace"
        fill="#8B93A8"
      />
      
      {/* Data preview in clean container */}
      {node.data && Object.keys(node.data).length > 0 && (
        <Group x={padding} y={85}>
          <Rect
            width={width - padding * 2}
            height={30}
            fill="rgba(20, 25, 40, 0.4)"
            cornerRadius={6}
            perfectDrawEnabled={false}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={1}
          />
          <Text
            x={8}
            y={8}
            text={`${Object.keys(node.data)[0]}: ${JSON.stringify(Object.values(node.data)[0]).substring(0, 30)}${JSON.stringify(Object.values(node.data)[0]).length > 30 ? '...' : ''}`}
            fontSize={11}
            fontFamily="'SF Mono', monospace"
            fill="#D0D6E2"
            width={width - padding * 2 - 16}
            ellipsis={true}
          />
        </Group>
      )}
      
      {/* Modern status indicator */}
      <Group x={width - padding - 15} y={height - padding - 15}>
        <Circle
          radius={6}
          fill={statusColor}
          shadowColor={statusColor}
          shadowBlur={15}
          shadowOpacity={0.9}
          perfectDrawEnabled={false}
        />
        <Circle
          radius={10}
          stroke={statusColor}
          strokeWidth={1.5}
          opacity={0.4}
          perfectDrawEnabled={false}
          shadowColor={statusColor}
          shadowBlur={8}
          shadowOpacity={0.5}
        />
      </Group>
      
      {/* Node module version */}
      <Text
        x={padding}
        y={height - padding - 15}
        text={`v${node.data.version || '1'}`}
        fontSize={11}
        fontFamily="Inter, sans-serif"
        fill="#999999"
      />
      
      {/* Input handle (connection point) with interactive behavior */}
      <Circle
        x={inputHandleX}
        y={inputHandleY}
        radius={handleRadius}
        fill="#121212"
        stroke={nodeConfig.color}
        strokeWidth={2.5}
        shadowColor={nodeConfig.color}
        shadowBlur={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.type === 'input' ? 18 : 10}
        shadowOpacity={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.type === 'input' ? 1 : 0.8}
        onMouseDown={() => onHandleMouseDown?.('input', 'input', {x: node.position.x, y: node.position.y + inputHandleY}, node.id)}
        onMouseUp={() => onHandleMouseUp?.('input', 'input', {x: node.position.x, y: node.position.y + inputHandleY}, node.id)}
        onMouseEnter={() => onHandleMouseOver?.('input', 'input')}
        onMouseLeave={() => onHandleMouseOut?.('input', 'input')}
      />
      
      {/* Output handle (connection point) with interactive behavior */}
      <Circle
        x={outputHandleX}
        y={outputHandleY}
        radius={handleRadius}
        fill="#121212"
        stroke={nodeConfig.color}
        strokeWidth={2.5}
        shadowColor={nodeConfig.color}
        shadowBlur={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.type === 'output' ? 18 : 10}
        shadowOpacity={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.type === 'output' ? 1 : 0.8}
        onMouseDown={() => onHandleMouseDown?.('output', 'output', {x: node.position.x + outputHandleX, y: node.position.y + outputHandleY}, node.id)}
        onMouseUp={() => onHandleMouseUp?.('output', 'output', {x: node.position.x + outputHandleX, y: node.position.y + outputHandleY}, node.id)}
        onMouseEnter={() => onHandleMouseOver?.('output', 'output')}
        onMouseLeave={() => onHandleMouseOut?.('output', 'output')}
      />
      
      {/* If this is a router node, add multiple outputs with enhanced styling */}
      {node.type.includes('Router') && (
        <>
          {/* Router output - top with interactive behavior */}
          <Circle
            x={outputHandleX}
            y={outputHandleY - 25}
            radius={handleRadius}
            fill="#121212"
            stroke="#FF9800"
            strokeWidth={2.5}
            shadowColor="#FF9800"
            shadowBlur={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.handleId === 'output-success' ? 18 : 10}
            shadowOpacity={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.handleId === 'output-success' ? 1 : 0.8}
            onMouseDown={() => onHandleMouseDown?.('output-success', 'output', {x: node.position.x + outputHandleX, y: node.position.y + outputHandleY - 25}, node.id)}
            onMouseUp={() => onHandleMouseUp?.('output-success', 'output', {x: node.position.x + outputHandleX, y: node.position.y + outputHandleY - 25}, node.id)}
            onMouseEnter={() => onHandleMouseOver?.('output-success', 'output')}
            onMouseLeave={() => onHandleMouseOut?.('output-success', 'output')}
          />
          {/* Label for top output */}
          <Text
            x={outputHandleX - 60}
            y={outputHandleY - 32}
            text="Success"
            fontSize={10}
            fontFamily="Inter, sans-serif"
            fill="#FF9800"
            align="right"
          />
          
          {/* Router output - bottom with interactive behavior */}
          <Circle
            x={outputHandleX}
            y={outputHandleY + 25}
            radius={handleRadius}
            fill="#121212"
            stroke="#FF9800"
            strokeWidth={2.5}
            shadowColor="#FF9800"
            shadowBlur={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.handleId === 'output-failure' ? 18 : 10}
            shadowOpacity={selectedConnectionHandle?.nodeId === node.id && selectedConnectionHandle?.handleId === 'output-failure' ? 1 : 0.8}
            onMouseDown={() => onHandleMouseDown?.('output-failure', 'output', {x: node.position.x + outputHandleX, y: node.position.y + outputHandleY + 25}, node.id)}
            onMouseUp={() => onHandleMouseUp?.('output-failure', 'output', {x: node.position.x + outputHandleX, y: node.position.y + outputHandleY + 25}, node.id)}
            onMouseEnter={() => onHandleMouseOver?.('output-failure', 'output')}
            onMouseLeave={() => onHandleMouseOut?.('output-failure', 'output')}
          />
          {/* Label for bottom output */}
          <Text
            x={outputHandleX - 60}
            y={outputHandleY + 18}
            text="Failure"
            fontSize={10}
            fontFamily="Inter, sans-serif"
            fill="#FF9800"
            align="right"
          />
        </>
      )}
      
      {/* Blue accent glow on the side for special emphasis */}
      <Rect
        x={width - 4}
        y={15}
        width={4}
        height={height - 30}
        fill="#00B0FF"
        cornerRadius={[0, 2, 2, 0]}
        shadowColor="#00B0FF"
        shadowBlur={15}
        shadowOpacity={0.8}
      />
      
      {/* AI Tooltip */}
      {showAITooltip && (
        <Group
          x={width / 2}
          y={-65}
          opacity={aiTooltipOpacity.current}
          onMouseEnter={() => {
            const tooltipTween = new Konva.Tween({
              node: groupRef.current!,
              opacity: 1,
              duration: 0.3,
            });
            tooltipTween.play();
          }}
          onMouseLeave={() => {
            const tooltipTween = new Konva.Tween({
              node: groupRef.current!,
              opacity: 0,
              duration: 0.3,
            });
            tooltipTween.play();
          }}
        >
          <Rect
            x={-120}
            y={0}
            width={240}
            height={60}
            fill="rgba(0, 0, 0, 0.85)"
            cornerRadius={6}
            shadowColor="#000"
            shadowBlur={10}
            shadowOpacity={0.5}
          />
          <Text
            x={-110}
            y={10}
            width={220}
            text={`AI Tip: ${nodeConfig.aiTip || 'Try connecting this node to process your data.'}`}
            fontSize={12}
            fontFamily="Inter, sans-serif"
            fill="#FFFFFF"
            wrap="word"
          />
          {/* Tooltip pointer */}
          <Rect
            x={-10}
            y={60}
            width={20}
            height={10}
            rotation={45}
            fill="rgba(0, 0, 0, 0.85)"
          />
        </Group>
      )}
    </Group>
  );
};

export default AutomationNode;
