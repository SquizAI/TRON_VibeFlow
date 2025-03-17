import React, { useState, useEffect, useRef } from 'react'
import { Stage, Layer, Circle, Text, Line, Group } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { useWindowSize } from '../../hooks/useWindowSize'

// Knowledge Graph Types
interface GraphNode {
  id: string
  title: string
  type: 'note' | 'task' | 'concept' | 'tag'
  x: number
  y: number
  radius: number
  color: string
  connections: string[]
}

interface GraphEdge {
  source: string
  target: string
  type: 'related' | 'parent' | 'reference' | 'tag'
  strength: number
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface KnowledgeGraphProps {
  initialNodes?: GraphNode[]
  initialEdges?: GraphEdge[]
  onNodeClick?: (nodeId: string) => void
  onNodeDrag?: (nodeId: string, x: number, y: number) => void
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodeClick,
  onNodeDrag
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes)
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const stageRef = useRef<any>(null)
  const windowSize = useWindowSize()
  
  // Auto-layout the graph on initial render or when nodes/edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const newNodes = [...nodes]
      
      // Simple force-directed layout simulation
      // In a real app, you'd use a more sophisticated algorithm
      const centerX = windowSize.width / 2
      const centerY = windowSize.height / 2
      const radius = Math.min(windowSize.width, windowSize.height) * 0.4
      
      newNodes.forEach((node, i) => {
        // Position nodes in a circle if they don't have positions
        if (node.x === 0 && node.y === 0) {
          const angle = (i / nodes.length) * Math.PI * 2
          node.x = centerX + Math.cos(angle) * radius
          node.y = centerY + Math.sin(angle) * radius
        }
      })
      
      setNodes(newNodes)
    }
  }, [nodes.length, windowSize])
  
  // Handle zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    const scaleBy = 1.1
    const stage = stageRef.current
    const oldScale = scale
    
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    
    setScale(newScale)
    
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }
  
  // Handle node drag
  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    )
    
    if (onNodeDrag) {
      onNodeDrag(nodeId, x, y)
    }
  }
  
  // Get edge color based on type
  const getEdgeColor = (type: GraphEdge['type']) => {
    switch (type) {
      case 'related':
        return 'rgba(65, 105, 225, 0.6)' // Royal blue
      case 'parent':
        return 'rgba(0, 180, 0, 0.6)' // Green
      case 'reference':
        return 'rgba(200, 130, 0, 0.6)' // Orange
      case 'tag':
        return 'rgba(150, 150, 150, 0.6)' // Grey
      default:
        return 'rgba(65, 105, 225, 0.6)' // Royal blue
    }
  }
  
  // Get node color based on type with royal blue theme
  const getNodeColor = (type: GraphNode['type'], isSelected: boolean, isHovered: boolean) => {
    let baseColor = '#4169E1' // Royal blue default
    
    switch (type) {
      case 'note':
        baseColor = '#4169E1' // Royal blue
        break
      case 'task':
        baseColor = '#41A9E1' // Light blue
        break
      case 'concept':
        baseColor = '#9C41E1' // Purple
        break
      case 'tag':
        baseColor = '#7941E1' // Blue-purple
        break
    }
    
    if (isSelected) return baseColor
    if (isHovered) return baseColor + 'DD'
    return baseColor + '99' // Add transparency for normal state
  }
  
  return (
    <Stage
      width={windowSize.width}
      height={windowSize.height}
      ref={stageRef}
      onWheel={handleWheel}
      scale={{ x: scale, y: scale }}
      draggable
    >
      <Layer>
        {/* Background grid */}
        <Group opacity={0.2}>
          {Array.from({ length: 30 }).map((_, i) => {
            const spacing = 50
            return (
              <React.Fragment key={`grid-${i}`}>
                {/* Horizontal line */}
                <Line
                  points={[0, i * spacing, windowSize.width, i * spacing]}
                  stroke="#4169E1"
                  strokeWidth={0.5}
                  dash={[2, 4]}
                />
                {/* Vertical line */}
                <Line
                  points={[i * spacing, 0, i * spacing, windowSize.height]}
                  stroke="#4169E1"
                  strokeWidth={0.5}
                  dash={[2, 4]}
                />
              </React.Fragment>
            )
          })}
        </Group>
        
        {/* Edges */}
        {edges.map((edge) => {
          const source = nodes.find((n) => n.id === edge.source)
          const target = nodes.find((n) => n.id === edge.target)
          
          if (!source || !target) return null
          
          const isSelected = 
            selectedNodeId === source.id || 
            selectedNodeId === target.id
          
          return (
            <Group key={`edge-${edge.source}-${edge.target}`}>
              <Line
                points={[source.x, source.y, target.x, target.y]}
                stroke={getEdgeColor(edge.type)}
                strokeWidth={edge.strength * (isSelected ? 2 : 1)}
                shadowColor={getEdgeColor(edge.type)}
                shadowBlur={isSelected ? 5 : 0}
                shadowOpacity={0.5}
                dash={edge.type === 'reference' ? [5, 2] : undefined}
              />
            </Group>
          )
        })}
        
        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id
          const isHovered = hoveredNodeId === node.id
          
          return (
            <Group
              key={`node-${node.id}`}
              x={node.x}
              y={node.y}
              draggable
              onDragMove={(e) => {
                handleNodeDrag(node.id, e.target.x(), e.target.y())
              }}
              onClick={() => {
                setSelectedNodeId(node.id)
                if (onNodeClick) onNodeClick(node.id)
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Node circle with royal blue theme */}
              <Circle
                radius={node.radius || 30}
                fill={getNodeColor(node.type, isSelected, isHovered)}
                stroke="#FFFFFF"
                strokeWidth={isSelected ? 2 : isHovered ? 1 : 0}
                shadowColor="#4169E1"
                shadowBlur={isSelected ? 10 : isHovered ? 5 : 0}
                shadowOpacity={0.5}
                shadowOffset={{ x: 0, y: 2 }}
              />
              
              {/* Node label */}
              <Text
                text={node.title}
                fontSize={12}
                fill="#FFFFFF"
                width={node.radius * 2}
                align="center"
                verticalAlign="middle"
                offsetX={node.radius}
                offsetY={node.radius}
                fontStyle={isSelected ? "bold" : "normal"}
                shadowColor="#000000"
                shadowBlur={2}
                shadowOpacity={0.5}
              />
            </Group>
          )
        })}
      </Layer>
    </Stage>
  )
}

export default KnowledgeGraph
