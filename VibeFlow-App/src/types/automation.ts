export interface Position {
  x: number;
  y: number;
}

export interface ConnectionHandle {
  nodeId: string;
  handleId: string;
  type: 'input' | 'output';
  position: Position;
}

export interface DragVelocity {
  x: number;
  y: number;
}

export interface FlowNode {
  id: string;
  type: string;
  name: string;
  position: Position;
  data: Record<string, any>;
  selected?: boolean;
  handles?: {
    inputs: ConnectionHandle[];
    outputs: ConnectionHandle[];
  };
}

export interface ConnectionType {
  id: string;
  from: string;
  to: string;
  data?: {
    sourceHandle?: string;
    targetHandle?: string;
    routeIndex?: number;
    label?: string;
    type?: string;
    sourcePosition?: Position;
    targetPosition?: Position;
    animated?: boolean;
  };
}

export interface AutomationFlow {
  id: string;
  name: string;
  nodes: FlowNode[];
  connections: ConnectionType[];
}

export interface NodeConfiguration {
  color: string;
  icon: string;
  category: string;
  description: string;
  aiTip?: string;
  maxInputs?: number;
  maxOutputs?: number;
  animation?: {
    duration?: number;
    easing?: string;
  };
}

export interface NodeType {
  [key: string]: NodeConfiguration;
}

// Node type configuration with colors and icons
export const NODE_TYPES: NodeType = {
  ManyChatWebhook: {
    color: '#7263F0',
    icon: 'webhook',
    category: 'Trigger',
    description: 'Starts a flow when a webhook request is received',
    aiTip: 'This trigger node is the starting point of your flow. Connect it to actions to process webhook data.'
  },
  GetSubscriberInfo: {
    color: '#7263F0',
    icon: 'person',
    category: 'Action',
    description: 'Retrieves subscriber information',
    aiTip: 'Fetches subscriber data that can be used in later nodes. Connect to a router to handle different outcomes.'
  },
  BasicRouter: {
    color: '#F05A23',
    icon: 'call_split',
    category: 'Flow Control',
    description: 'Routes the flow based on conditions',
    aiTip: 'Routes your flow based on conditions. Connect the success path for positive outcomes and failure for errors.'
  },
  messageAssistantAdvanced: {
    color: '#10A37F',
    icon: 'smart_toy',
    category: 'AI',
    description: 'Uses OpenAI to generate a response',
    aiTip: 'Creates AI-generated responses using advanced language models. Try using specific prompts for better results.'
  },
  CreateCompletion: {
    color: '#10A37F',
    icon: 'psychology',
    category: 'AI',
    description: 'Creates a completion using OpenAI',
    aiTip: 'Generates completions based on prompts. Works well for structured text generation tasks.'
  },
  SetSubscriberCustomField: {
    color: '#7263F0',
    icon: 'edit',
    category: 'Action',
    description: 'Sets a custom field for a subscriber',
    aiTip: 'Updates custom fields for subscribers. Use this to store important information for later use.'
  },
  SendFlow: {
    color: '#7263F0',
    icon: 'send',
    category: 'Action',
    description: 'Sends a flow to a subscriber',
    aiTip: 'Triggers another flow for the subscriber. Useful for building modular automation systems.'
  },
  FunctionSleep: {
    color: '#607D8B',
    icon: 'timelapse',
    category: 'Utility',
    description: 'Pauses the flow for a specified duration',
    aiTip: 'Adds a delay to your automation flow. Useful for rate limiting or creating timed sequences.'
  },
  Break: {
    color: '#F44336',
    icon: 'block',
    category: 'Flow Control',
    description: 'Breaks out of the current flow',
    aiTip: 'Stops the execution of the current flow. Use this to exit early based on certain conditions.'
  },
  TextGeneration: {
    color: '#10A37F',
    icon: 'psychology',
    category: 'AI',
    description: 'Generates text using AI',
    aiTip: 'Creates text content with AI. Connect to processing nodes to filter or enhance the output.'
  },
  StoreResult: {
    color: '#4169E1',
    icon: 'storage',
    category: 'Database',
    description: 'Stores data in a database',
    aiTip: 'Saves data to your database for later retrieval. Useful for persisting important information.'
  },
  SendAlert: {
    color: '#FF9800',
    icon: 'notifications',
    category: 'Notification',
    description: 'Sends notification alerts',
    aiTip: 'Sends alerts through various channels. Use this to notify team members about important events.'
  }
};

// Default configuration for nodes that don't have a specific configuration
export const DEFAULT_NODE_CONFIG: NodeConfiguration = {
  color: '#607D8B',
  icon: 'settings',
  category: 'Unknown',
  description: 'Unknown node type',
  aiTip: 'This node type is not recognized. Check documentation for supported node types.',
  maxInputs: 1,
  maxOutputs: 1,
  animation: {
    duration: 0.3,
    easing: 'easeInOut'
  }
};

// Stage configuration for the automation canvas
export const STAGE_CONFIG = {
  grid: {
    spacing: 20,
    dotSize: 1,
    dotColor: '#1C3252',  // Dark blue dots for flat 2D grid look
    crossSize: 5,
    crossColor: '#2196F3', // Blue crosses at major grid intersections
    lineWidth: 1.5
  },
  zoom: {
    min: 0.1,
    max: 3,
    default: 1,
    step: 0.1
  },
  physics: {
    dragInertia: true,
    inertiaDeceleration: 0.95,
    snapToGrid: false,
    connectionAnimated: true
  },
  background: {
    color: '#0A1929', // Darker background with subtle blue accents
    opacity: 1
  },
  glow: {
    color: '#4285F4',
    blur: 10,
    intensity: 0.75
  }
};

// Status colors for different node states
export const STATUS_COLORS = {
  success: '#4CAF50',
  running: '#2196F3',
  error: '#F44336',
  warning: '#FF9800',
  inactive: '#9E9E9E'
};
