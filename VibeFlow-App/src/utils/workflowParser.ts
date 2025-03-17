/**
 * Workflow Parser
 * Converts JSON flow data from blueprints into visual components for the canvas
 */
import { v4 as uuidv4 } from 'uuid';

// Types for the flow data
interface FlowModule {
  id: number;
  module: string;
  version: number;
  parameters: Record<string, any>;
  mapper?: Record<string, any>;
  metadata: {
    designer?: {
      x: number;
      y: number;
    };
    [key: string]: any;
  };
  routes?: Array<{
    flow: FlowModule[];
  }>;
  [key: string]: any;
}

interface Blueprint {
  name: string;
  flow: FlowModule[];
  metadata: Record<string, any>;
}

// Types for our generated components
interface CanvasComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  zIndex: number;
  content?: string;
  module?: string;
  nodeType?: 'trigger' | 'action' | 'condition' | 'output';
  workflowId?: string;
  locked?: boolean;
  outputConnections?: string[];
  inputConnections?: string[];
  [key: string]: any;
}

// Node type mapping based on module name
const getNodeType = (moduleName: string): 'trigger' | 'action' | 'condition' | 'output' => {
  if (moduleName.includes('Webhook') || moduleName.includes('Trigger')) {
    return 'trigger';
  } else if (moduleName.includes('Router') || moduleName.includes('Condition') || moduleName.includes('Switch')) {
    return 'condition';
  } else if (moduleName.includes('Send') || moduleName.includes('Output')) {
    return 'output';
  } else {
    return 'action';
  }
};

// Parse a single module into a canvas component
const parseModule = (
  module: FlowModule, 
  workflowId: string, 
  baseZIndex: number = 1
): CanvasComponent => {
  // Default node dimensions
  const width = 180;
  const height = 120;
  
  // Extract position from designer metadata or use defaults
  const x = module.metadata?.designer?.x || 0;
  const y = module.metadata?.designer?.y || 0;
  
  // Extract module name and clean it for display
  const moduleName = module.module.split(':').pop() || 'Unknown Module';
  const title = moduleName.replace(/([A-Z])/g, ' $1').trim();
  
  // Create component
  return {
    id: `node-${module.id}-${uuidv4().substring(0, 8)}`,
    type: 'workflowNode',
    x,
    y,
    width,
    height,
    title,
    zIndex: baseZIndex,
    module: module.module,
    nodeType: getNodeType(module.module),
    workflowId,
    originalId: module.id.toString(),
    outputConnections: [],
    inputConnections: []
  };
};

// Parse routes and build connections between nodes
const processRoutes = (
  module: FlowModule, 
  nodeMap: Map<string, CanvasComponent>,
  routeSourceId: string
) => {
  if (!module.routes) return;
  
  module.routes.forEach((route, routeIndex) => {
    // Process each module in the route
    let previousModule: CanvasComponent | null = null;
    
    route.flow.forEach((routeModule) => {
      const existingNode = nodeMap.get(routeModule.id.toString());
      
      if (existingNode) {
        // If this is the first node in the route, connect it to the source
        if (!previousModule) {
          const sourceNode = nodeMap.get(routeSourceId);
          if (sourceNode) {
            if (!sourceNode.outputConnections) {
              sourceNode.outputConnections = [];
            }
            sourceNode.outputConnections.push(existingNode.id);
            
            if (!existingNode.inputConnections) {
              existingNode.inputConnections = [];
            }
            existingNode.inputConnections.push(sourceNode.id);
          }
        } else {
          // Connect to the previous module in the route
          if (!previousModule.outputConnections) {
            previousModule.outputConnections = [];
          }
          previousModule.outputConnections.push(existingNode.id);
          
          if (!existingNode.inputConnections) {
            existingNode.inputConnections = [];
          }
          existingNode.inputConnections.push(previousModule.id);
        }
        
        previousModule = existingNode;
        
        // Process any sub-routes
        if (routeModule.routes) {
          processRoutes(routeModule, nodeMap, routeModule.id.toString());
        }
      }
    });
  });
};

/**
 * Parse a blueprint JSON into canvas components and connections
 */
export const parseBlueprint = (blueprint: Blueprint): CanvasComponent[] => {
  const workflowId = uuidv4();
  const components: CanvasComponent[] = [];
  const nodeMap = new Map<string, CanvasComponent>();
  
  // First pass: Create all nodes
  blueprint.flow.forEach((module) => {
    const component = parseModule(module, workflowId);
    components.push(component);
    nodeMap.set(module.id.toString(), component);
    
    // Process modules inside routes
    if (module.routes) {
      module.routes.forEach((route, routeIndex) => {
        route.flow.forEach((routeModule, moduleIndex) => {
          // Check if we've already processed this module
          if (!nodeMap.has(routeModule.id.toString())) {
            const routeComponent = parseModule(
              routeModule, 
              workflowId, 
              moduleIndex + 1
            );
            components.push(routeComponent);
            nodeMap.set(routeModule.id.toString(), routeComponent);
          }
        });
      });
    }
  });
  
  // Second pass: Create connections
  blueprint.flow.forEach((module) => {
    // Process direct connections between adjacent modules in the main flow
    const moduleIndex = blueprint.flow.findIndex(m => m.id === module.id);
    if (moduleIndex < blueprint.flow.length - 1) {
      const currentNode = nodeMap.get(module.id.toString());
      const nextNode = nodeMap.get(blueprint.flow[moduleIndex + 1].id.toString());
      
      if (currentNode && nextNode) {
        if (!currentNode.outputConnections) {
          currentNode.outputConnections = [];
        }
        currentNode.outputConnections.push(nextNode.id);
        
        if (!nextNode.inputConnections) {
          nextNode.inputConnections = [];
        }
        nextNode.inputConnections.push(currentNode.id);
      }
    }
    
    // Process connections in routes
    if (module.routes) {
      processRoutes(module, nodeMap, module.id.toString());
    }
  });
  
  return components;
};

/**
 * Load a blueprint from JSON and convert to canvas components
 */
export const loadBlueprintFromJson = async (jsonPath: string): Promise<CanvasComponent[]> => {
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`Failed to load blueprint: ${response.statusText}`);
    }
    
    const blueprint = await response.json();
    return parseBlueprint(blueprint);
  } catch (error) {
    console.error('Error loading blueprint:', error);
    return [];
  }
};

export default {
  parseBlueprint,
  loadBlueprintFromJson
};
