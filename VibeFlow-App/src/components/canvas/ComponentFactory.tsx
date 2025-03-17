import React from 'react'
import { CanvasComponent } from '../../types/canvas'

// Import component types
import NoteComponent from './components/NoteComponent'
import TaskComponent from './components/TaskComponent'
import TemplateComponent from './components/TemplateComponent'
import WorkflowComponent from '../workflow/WorkflowComponent'
import WorkflowNodeComponent from './components/WorkflowNodeComponent'

interface ComponentFactoryProps {
  component: CanvasComponent
}

/**
 * Factory component that returns the correct component based on type
 */
const ComponentFactory: React.FC<ComponentFactoryProps> = ({ component }) => {
  switch (component.type) {
    case 'note':
      return <NoteComponent data={component} />
    case 'task':
      return <TaskComponent data={component} />
    case 'template':
      return <TemplateComponent data={component} />
    case 'workflow':
      return <WorkflowComponent data={component} />
    case 'workflowNode':
      return <WorkflowNodeComponent data={component as any} />
    default:
      console.error(`Unknown component type: ${(component as any).type}`)
      return null
  }
}

export default ComponentFactory
