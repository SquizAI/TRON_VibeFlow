import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { Stage as KonvaStage } from 'konva/lib/Stage';
import { KonvaEventObject } from 'konva/lib/Node';
import { Box, Typography, IconButton, Paper, Drawer, Chip, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { styled } from '@mui/material/styles';
import AutomationNode from '../components/automation/AutomationNode';
import NodeDetailPanel from '../components/automation/NodeDetailPanel';
import NodeConnection from '../components/automation/NodeConnection';
import GridBackground from '../components/automation/GridBackground';
import { AutomationFlow, FlowNode, ConnectionType, STAGE_CONFIG } from '../types/automation';

// Mock blueprint data until we have proper file structure
const blueprintData = {
  "name": "AI Flow Automation",
  "flow": [
    {
      "id": 1,
      "module": "ai:TextGeneration",
      "version": 1,
      "parameters": { "model": "gpt-4" },
      "metadata": {
        "designer": { "x": 300, "y": 200 }
      }
    },
    {
      "id": 2,
      "module": "builtin:BasicRouter",
      "version": 1,
      "parameters": { "condition": "success" },
      "metadata": {
        "designer": { "x": 600, "y": 200 }
      }
    },
    {
      "id": 3,
      "module": "database:StoreResult",
      "version": 1,
      "parameters": { "collection": "outputs" },
      "metadata": {
        "designer": { "x": 900, "y": 100 }
      }
    },
    {
      "id": 4,
      "module": "notification:SendAlert",
      "version": 1,
      "parameters": { "channel": "email" },
      "metadata": {
        "designer": { "x": 900, "y": 300 }
      }
    }
  ]
};

// Styled components
const ControlPanel = styled(Paper)(() => ({
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 16px',
  display: 'flex',
  gap: 8,
  backgroundColor: '#1E1E1E',
  borderRadius: 30,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  zIndex: 100,
  '& .MuiIconButton-root': {
    color: '#E0E0E0',
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
  }
}));

const HeaderBar = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#121212',
  color: '#FFFFFF',
  zIndex: 100,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
}));

const NodeCountBadge = styled(Chip)(() => ({
  backgroundColor: '#4169E1',
  color: '#FFFFFF',
  fontWeight: 'bold',
  marginLeft: 12,
}));

// Convert the blueprint data into a format usable by our visualization components
const processAutomationData = (data: any): AutomationFlow => {
  const nodes: FlowNode[] = data.flow.map((node: any) => ({
    id: node.id.toString(),
    type: node.module.split(':')[1] || node.module,
    name: node.module.split(':')[1] || node.module,
    position: {
      x: node.metadata?.designer?.x || 0,
      y: node.metadata?.designer?.y || 0
    },
    data: {
      ...node.parameters,
      version: node.version,
      metadata: node.metadata,
      mapper: node.mapper
    }
  }));

  // Extract connections between nodes based on mapper values
  const connections: ConnectionType[] = [];
  data.flow.forEach((node: any) => {
    if (node.mapper) {
      Object.values(node.mapper).forEach((value: any) => {
        const match = String(value).match(/{{(\d+)\./);
        if (match && match[1]) {
          connections.push({
            id: `${match[1]}-${node.id}`,
            from: match[1],
            to: node.id.toString(),
            data: {
              sourceHandle: 'output',
              targetHandle: 'input'
            }
          });
        }
      });
    }

    // Add connections for route flows
    if (node.routes) {
      node.routes.forEach((route: any, index: number) => {
        if (route.flow && route.flow.length > 0) {
          route.flow.forEach((routeNode: any) => {
            connections.push({
              id: `${node.id}-${routeNode.id}`,
              from: node.id.toString(),
              to: routeNode.id.toString(),
              data: {
                sourceHandle: 'output',
                targetHandle: 'input',
                routeIndex: index
              }
            });
          });
        }
      });
    }
  });

  return {
    id: data.name,
    name: data.name,
    nodes,
    connections
  };
};

const AutomationNodePage: React.FC = () => {
  const [automationData, setAutomationData] = useState<AutomationFlow | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const stageRef = useRef<KonvaStage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Process and load the automation data
  useEffect(() => {
    const processed = processAutomationData(blueprintData);
    setAutomationData(processed);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition() || { x: stageSize.width / 2, y: stageSize.height / 2 };
    
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    // Determine if user is hovering over a specific node for card-specific zooming
    const targetNode = e.target;
    const applyCardSpecificZoom = targetNode && targetNode !== stage;
    
    // Determine direction and set new scale
    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const zoomStep = STAGE_CONFIG.zoom.step;
    
    // Apply different zoom behaviors based on whether hovering over a node (card-specific zooming)
    let limitedScale;
    if (applyCardSpecificZoom) {
      // Card-specific zooming - zoom faster on individual components
      const enhancedZoomStep = zoomStep * 1.5;
      const cardZoomScale = direction > 0 ? oldScale * (1 - enhancedZoomStep) : oldScale * (1 + enhancedZoomStep);
      limitedScale = Math.max(STAGE_CONFIG.zoom.min, Math.min(cardZoomScale, STAGE_CONFIG.zoom.max));
      
      // Find the node's parent to apply card-specific animations if needed
      const nodeGroup = targetNode.getParent();
      if (nodeGroup) {
        // Add subtle glow effect when zooming on a specific component
        nodeGroup.to({
          shadowBlur: direction > 0 ? 10 : 20,
          shadowOpacity: direction > 0 ? 0.3 : 0.6,
          duration: 0.2
        });
      }
    } else {
      // Normal canvas zooming
      const newScale = direction > 0 ? oldScale * (1 - zoomStep) : oldScale * (1 + zoomStep);
      limitedScale = Math.max(STAGE_CONFIG.zoom.min, Math.min(newScale, STAGE_CONFIG.zoom.max));
    }
    
    setScale(limitedScale);
    
    // Calculate new position with adjusted focus for card-specific zooming
    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    };
    
    setPosition(newPos);
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    // Reset stage's draggable property to allow node dragging
    if (stageRef.current) {
      stageRef.current.draggable(false);
    }
  };

  const handleDragMove = (e: KonvaEventObject<MouseEvent>, nodeId: string) => {
    if (!automationData) return;
    
    const updatedNodes = automationData.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          position: {
            x: e.target.x(),
            y: e.target.y()
          }
        };
      }
      return node;
    });
    
    setAutomationData({
      ...automationData,
      nodes: updatedNodes
    });
  };

  const handleNodeClick = (node: FlowNode) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  };

  const handleStageDragStart = () => {
    // Set cursor to grabbing
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleStageDragEnd = () => {
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale * (1 + STAGE_CONFIG.zoom.step), STAGE_CONFIG.zoom.max));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale * (1 - STAGE_CONFIG.zoom.step), STAGE_CONFIG.zoom.min));
  };

  const handleResetView = () => {
    setScale(STAGE_CONFIG.zoom.default);
    setPosition({ x: 0, y: 0 });
  };

  // We're using the GridBackground component instead of rendering dots directly

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: STAGE_CONFIG.background.color, position: 'relative' }}>
      <HeaderBar>
        <Box display="flex" alignItems="center">
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
            Automation Flow: {automationData?.name || 'Loading...'}
          </Typography>
          {automationData && (
            <NodeCountBadge 
              label={`${automationData.nodes.length} Nodes`} 
              size="small" 
            />
          )}
        </Box>
        <Box>
          <Tooltip title="Run Flow">
            <IconButton>
              <PlayArrowIcon sx={{ color: '#ff66c4' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </HeaderBar>
      
      <Box ref={containerRef} sx={{ width: '100%', height: '100%', cursor: 'grab' }}>
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={true}
          onDragStart={handleStageDragStart}
          onDragEnd={handleStageDragEnd}
        >
          {/* Background Grid Layer */}
          <GridBackground 
            width={stageSize.width * 3}
            height={stageSize.height * 3}
            scale={scale}
          />
          
          <Layer>
            {/* Connections between nodes */}
            {automationData?.connections.map((connection: ConnectionType) => (
              <NodeConnection
                key={connection.id}
                connection={connection}
                nodes={automationData.nodes}
              />
            ))}
            
            {/* Nodes */}
            {automationData?.nodes.map((node: FlowNode) => (
              <AutomationNode
                key={node.id}
                node={node}
                onDragStart={handleDragStart}
                onDragMove={(e: KonvaEventObject<DragEvent>) => handleDragMove(e, node.id)}
                onClick={() => handleNodeClick(node)}
              />
            ))}
          </Layer>
        </Stage>
      </Box>
      
      {/* Control panel */}
      <ControlPanel elevation={3}>
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset View">
          <IconButton onClick={handleResetView} size="small">
            <HomeIcon />
          </IconButton>
        </Tooltip>
      </ControlPanel>
      
      {/* Node detail panel */}
      <Drawer
        anchor="right"
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        PaperProps={{
          sx: {
            width: '30%',
            minWidth: 350,
            maxWidth: 500,
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            borderLeft: '1px solid #2A2A2A'
          }
        }}
      >
        {selectedNode && (
          <NodeDetailPanel node={selectedNode} onClose={() => setIsPanelOpen(false)} />
        )}
      </Drawer>
    </Box>
  );
};

export default AutomationNodePage;
