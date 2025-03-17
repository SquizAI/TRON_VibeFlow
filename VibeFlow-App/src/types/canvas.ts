export interface Position {
  x: number;
  y: number;
}

export interface ComponentBase {
  id: string;
  type: 'note' | 'task' | 'template' | 'workflow' | 'workflowNode' | 'concept' | 'tag';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
  color?: string;
  parentId?: string;
  children?: string[];
  collaborators?: string[];
  permissions?: ComponentPermissions;
  relationships?: Relationship[];
  references?: Reference[];
}

export interface NoteComponent extends ComponentBase {
  type: 'note';
  content: string;
  isLocked: boolean;
  tags: string[];
  color: string;
  template?: string;
  templateData?: Record<string, any>;
  sections?: NoteSection[];
  attachments?: Attachment[];
  comments?: Comment[];
  version?: number;
  history?: NoteHistoryEntry[];
  aiSuggestions?: AISuggestion[];
  customFields?: CustomField[];
}

export interface TaskComponent extends ComponentBase {
  type: 'task';
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review' | 'deferred';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  dueDate?: string;
  startDate?: string;
  assignee?: string;
  assignees?: string[];
  subtasks: SubTask[];
  dependencies?: string[];
  blockedBy?: string[];
  timeEstimate?: number;
  timeSpent?: number;
  recurrence?: RecurrenceRule;
  labels?: string[];
  attachments?: Attachment[];
  comments?: Comment[];
  history?: TaskHistoryEntry[];
  completionPercentage?: number;
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  timeEstimate?: number;
}

export interface TemplateComponent extends ComponentBase {
  type: 'template';
  description: string;
  tasks: TemplateTask[];
  category: string;
  icon: string;
}

export interface TemplateTask {
  id: string;
  text: string;
  hasSubtasks: boolean;
}

export interface WorkflowComponent extends ComponentBase {
  type: 'workflow';
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'error' | 'scheduled';
  version: number;
  schedule?: ScheduleConfig;
  lastRunAt?: string;
  nextRunAt?: string;
  runHistory?: WorkflowRunHistory[];
  variables?: WorkflowVariable[];
  triggers?: WorkflowTrigger[];
  category?: string;
  tags?: string[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: Position;
  data: Record<string, any>;
  inputs: NodePort[];
  outputs: NodePort[];
  module: string;
  nodeType: 'trigger' | 'action' | 'condition' | 'output' | 'transformation';
  status?: 'pending' | 'running' | 'completed' | 'error';
  errorMessage?: string;
  executionTime?: number;
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface WorkflowNodeComponent extends ComponentBase {
  type: 'workflowNode';
  module: string;
  nodeType: 'trigger' | 'action' | 'condition' | 'output' | 'transformation';
  description?: string;
  workflowId?: string;
  originalId?: string;
  inputConnections?: NodeConnection[];
  outputConnections?: NodeConnection[];
  config?: Record<string, any>;
  status?: 'pending' | 'running' | 'completed' | 'error';
  lastExecutionResult?: any;
  validationErrors?: string[];
  documentationUrl?: string;
}

// Add concept and tag components
export interface ConceptComponent extends ComponentBase {
  type: 'concept';
  description: string;
  relatedTo: string[];
  definition: string;
  examples?: string[];
  references?: Reference[];
  keywords?: string[];
  mediaUrl?: string;
}

export interface TagComponent extends ComponentBase {
  type: 'tag';
  color: string;
  description?: string;
  parent?: string;
  count?: number;
}

// Supporting types for enhanced components
export interface NoteSection {
  id: string;
  title: string;
  content: string;
  type?: 'text' | 'checklist' | 'table' | 'code' | 'media';
  isCollapsed?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: Attachment[];
  parentId?: string;
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface NoteHistoryEntry {
  version: number;
  userId: string;
  userName: string;
  timestamp: string;
  changes: HistoryChange[];
}

export interface TaskHistoryEntry {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  field: string;
  oldValue: any;
  newValue: any;
}

export interface HistoryChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AISuggestion {
  id: string;
  type: 'link' | 'tag' | 'content' | 'related';
  content: string;
  confidence: number;
  timestamp: string;
  isApplied: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'user' | 'checkbox';
  value: any;
  options?: string[];
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  endCount?: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  months?: number[];
}

export interface WorkflowRunHistory {
  id: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  trigger: string;
  nodeResults: Record<string, any>;
  error?: string;
  executionTime?: number;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  scope: 'global' | 'workflow' | 'run';
  isSecret?: boolean;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'scheduled' | 'webhook' | 'event';
  config: Record<string, any>;
  enabled: boolean;
}

export interface ScheduleConfig {
  type: 'once' | 'recurring';
  datetime?: string;
  recurrence?: RecurrenceRule;
  timezone?: string;
}

export interface NodePort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: string;
  description?: string;
  isRequired?: boolean;
  defaultValue?: any;
}

export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  data?: any;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'related' | 'parent' | 'child' | 'reference' | 'tag';
  strength: number;
  description?: string;
  createdAt: string;
}

export interface Reference {
  id: string;
  title: string;
  url?: string;
  citation?: string;
  type: 'web' | 'book' | 'article' | 'note' | 'other';
  date?: string;
}

export interface ComponentPermissions {
  isPublic: boolean;
  ownerUserId: string;
  readers?: string[];
  editors?: string[];
  admins?: string[];
}

export type CanvasComponent = 
  NoteComponent | TaskComponent | TemplateComponent | WorkflowComponent | 
  WorkflowNodeComponent | ConceptComponent | TagComponent;
