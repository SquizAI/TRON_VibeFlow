import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Group, Line } from 'react-konva';
import useCanvasStore from '../../store/canvasStore';
import BentoComponentWrapper from './BentoComponentWrapper';
import WorkflowNodeComponent from './components/WorkflowNodeComponent';
import WorkflowConnector from './components/WorkflowConnector';

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

interface WorkflowCanvasProps {
  workflowId?: string;
  isEditable?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  workflowId,
  isEditable = true
}) => {
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ 
    width: window.innerWidth - 40, 
    height: window.innerHeight - 100 
  });
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<Connection> | null>(null);
  
  // Get state from the canvas store
  const {
    scale,
    position,
    setScale,
    setPosition,
    components,
    selectedComponentId,
    selectComponent
  } = useCanvasStore();

  // Initialize canvas size and set up resize handler
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = Math.max(window.innerWidth - 40, 1);
      const containerHeight = Math.max(window.innerHeight - 100, 1);

      setStageSize({
        width: containerWidth,
        height: containerHeight
      });
    };

    // Set initial size immediately
    handleResize();
    
    // Add resize listener for window size changes
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle wheel zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = scale;
    
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit scale
    const limitedScale = Math.max(0.1, Math.min(5, newScale));
    
    // Calculate new position
    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    };
    
    setScale(limitedScale);
    setPosition(newPos);
  };

  // Handle stage click to deselect when clicking background
  const handleStageClick = (e: any) => {
    if (e.target === e.currentTarget || e.target.name() === 'background') {
      selectComponent(null);
    }
  };
  
  // Calculate connections between nodes based on component data
  useEffect(() => {
    // Filter components to only include workflow nodes
    const workflowNodes = components.filter((comp) => 
      comp.type === 'workflowNode' || comp.type === 'workflow'
    );
    
    // Generate connections based on component relationships
    const newConnections: Connection[] = [];
    
    workflowNodes.forEach((source) => {
      // Check if this node has output connections defined
      if (source.outputConnections && source.outputConnections.length > 0) {
        source.outputConnections.forEach((targetId: string) => {
          // Find the target component
          const target = workflowNodes.find((c) => c.id === targetId);
          
          if (target) {
            // Calculate connection points
            const sourcePos = {
              x: source.x + (source.width / 2),
              y: source.y + source.height
            };
            
            const targetPos = {
              x: target.x + (target.width / 2),
              y: target.y
            };
            
            // Add connection
            newConnections.push({
              id: `${source.id}-to-${target.id}`,
              sourceId: source.id,
              targetId: target.id,
              sourcePosition: sourcePos,
              targetPosition: targetPos,
              style: 'solid',
              color: '#6B7280'
            });
          }
        });
      }
    });
    
    setConnections(newConnections);
  }, [components]);
  
  // Get components sorted by z-index for proper layering
  const sortedComponents = [...components].sort((a, b) => a.zIndex - b.zIndex);
  
  // Filter to only workflow-related components if workflowId is provided
  const filteredComponents = workflowId 
    ? sortedComponents.filter(comp => comp.workflowId === workflowId)
    : sortedComponents;
  
  // Only render when we have valid dimensions
  const hasValidDimensions = stageSize.width > 0 && stageSize.height > 0;

  return (
    <div className="workflow-canvas-container" style={{ 
      width: '100%', 
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {hasValidDimensions && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          draggable={!isDragging}
          onDragStart={() => {
            // Only allow stage dragging if we're not dragging a component
            if (isDragging) {
              return false;
            }
          }}
          onDragEnd={(e) => {
            setPosition({
              x: e.target.x(),
              y: e.target.y()
            });
          }}
        >
          {/* Background grid layer */}
          <Layer name="grid-layer">
            <Group>
              {/* Grid lines can be added here */}
            </Group>
          </Layer>
          
          {/* Connections layer */}
          <Layer name="connections-layer">
            {connections.map((connection) => (
              <WorkflowConnector
                key={connection.id}
                id={connection.id}
                sourceId={connection.sourceId}
                targetId={connection.targetId}
                sourcePosition={connection.sourcePosition}
                targetPosition={connection.targetPosition}
                color={connection.color}
                style={connection.style as any}
                isSelected={selectedComponentId === connection.id}
              />
            ))}
            
            {/* New connection being created */}
            {newConnection && newConnection.sourcePosition && newConnection.targetPosition && (
              <Line
                points={[
                  newConnection.sourcePosition.x,
                  newConnection.sourcePosition.y,
                  newConnection.targetPosition.x,
                  newConnection.targetPosition.y
                ]}
                stroke="#3B82F6"
                strokeWidth={2}
                dash={[5, 5]}
              />
            )}
          </Layer>
          
          {/* Components layer */}
          <Layer name="components-layer">
            {filteredComponents.map((component) => (
              <BentoComponentWrapper key={component.id} componentId={component.id}>
                {component.type === 'workflowNode' ? (
                  <WorkflowNodeComponent data={component as any} />
                ) : (
                  <div>Other component types</div>
                )}
              </BentoComponentWrapper>
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default WorkflowCanvas;
