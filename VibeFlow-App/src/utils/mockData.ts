import { CanvasComponent, NoteComponent, TaskComponent, TemplateComponent, WorkflowComponent } from '../types/canvas'

/**
 * Generates a random ID
 */
const generateId = () => Math.random().toString(36).substring(2, 11)

/**
 * Generates a set of mock components for development purposes
 */
export const generateMockComponents = (): CanvasComponent[] => {
  const now = new Date().toISOString()
  
  // Create a mock note
  const noteComponent: NoteComponent = {
    id: generateId(),
    type: 'note',
    title: 'Welcome to VibeFlo!',
    content: 'This is your infinite canvas for ideas, tasks, and more.\n\n• Hold SPACE+DRAG to pan\n• Use mouse wheel to zoom\n• Click and drag to move components',
    isLocked: false,
    tags: ['welcome', 'getting-started'],
    color: '#3366FF',
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    zIndex: 1,
    createdAt: now,
    updatedAt: now
  }
  
  // Create a mock task component
  const taskComponent: TaskComponent = {
    id: generateId(),
    type: 'task',
    title: 'Try our enhanced task system',
    description: 'Our task system supports nested subtasks and secure notes.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    subtasks: [
      { id: generateId(), text: 'Add a subtask', completed: false, timeEstimate: 15 },
      { id: generateId(), text: 'Try the Kanban view', completed: false, timeEstimate: 20 },
      { id: generateId(), text: 'Filter tasks by priority', completed: false, timeEstimate: 10 }
    ],
    x: 450,
    y: 100,
    width: 350,
    height: 250,
    zIndex: 2,
    createdAt: now,
    updatedAt: now
  }
  
  // Create a mock template component
  const templateComponent: TemplateComponent = {
    id: generateId(),
    type: 'template',
    title: 'Project Kickoff Template',
    description: 'Use this template to start new projects with all necessary tasks.',
    category: 'Project Management',
    icon: 'project',
    tasks: [
      { id: generateId(), text: 'Define project scope', hasSubtasks: true },
      { id: generateId(), text: 'Set up project timeline', hasSubtasks: true },
      { id: generateId(), text: 'Assign team members', hasSubtasks: false },
      { id: generateId(), text: 'Schedule kickoff meeting', hasSubtasks: false }
    ],
    x: 100,
    y: 400,
    width: 300,
    height: 250,
    zIndex: 3,
    createdAt: now,
    updatedAt: now
  }
  
  // Create a mock workflow component
  const workflowComponent: WorkflowComponent = {
    id: generateId(),
    type: 'workflow',
    title: 'Content Approval Flow',
    description: 'Automated workflow for content review and approval.',
    status: 'draft',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'New Content Created' }
      },
      {
        id: 'node-2',
        type: 'action',
        position: { x: 250, y: 50 },
        data: { label: 'Notify Reviewer' }
      },
      {
        id: 'node-3',
        type: 'condition',
        position: { x: 450, y: 50 },
        data: { label: 'Approved?' }
      },
      {
        id: 'node-4',
        type: 'action',
        position: { x: 650, y: 0 },
        data: { label: 'Publish Content' }
      },
      {
        id: 'node-5',
        type: 'action',
        position: { x: 650, y: 100 },
        data: { label: 'Request Revisions' }
      }
    ],
    edges: [
      { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
      { id: 'edge-2-3', source: 'node-2', target: 'node-3' },
      { id: 'edge-3-4', source: 'node-3', target: 'node-4' },
      { id: 'edge-3-5', source: 'node-3', target: 'node-5' }
    ],
    x: 450,
    y: 400,
    width: 400,
    height: 300,
    zIndex: 4,
    createdAt: now,
    updatedAt: now
  }
  
  // Create a secure note component
  const secureNoteComponent: NoteComponent = {
    id: generateId(),
    type: 'note',
    title: 'Secure Note Feature',
    content: '• Click the lock icon in the note header to protect with a password\n• Sensitive information stays encrypted\n• Unlock only when needed',
    isLocked: true,
    tags: ['security', 'feature'],
    color: '#9C27B0',
    x: 800,
    y: 100,
    width: 300,
    height: 200,
    zIndex: 5,
    createdAt: now,
    updatedAt: now
  }
  
  return [
    noteComponent,
    taskComponent,
    templateComponent,
    workflowComponent,
    secureNoteComponent
  ]
}
