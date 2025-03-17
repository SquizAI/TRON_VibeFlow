import { Group, Text, Rect, Line, Circle } from 'react-konva'
import { TaskComponent as TaskComponentType, SubTask } from '../../../types/canvas'
import useCanvasStore from '../../../store/canvasStore'

interface TaskComponentProps {
  data: TaskComponentType
}

const TaskComponent = ({ data }: TaskComponentProps) => {
  const { updateComponent } = useCanvasStore()
  const padding = 15
  
  // Status colors
  const statusColors: Record<string, string> = {
    'todo': '#6E7C8C',
    'in-progress': '#31C48D',
    'completed': '#2563EB',
    'blocked': '#EF4444',
    'review': '#8B5CF6',
    'deferred': '#9CA3AF'
  }
  
  // Priority indicator
  const renderPriorityIndicator = () => {
    const width = 80
    const height = 6
    const priorityColor: Record<string, string> = {
      'low': '#9CA3AF',
      'medium': '#F59E0B',
      'high': '#EF4444',
      'urgent': '#B91C1C',
      'critical': '#7F1D1D'
    }
    
    return (
      <Group x={padding} y={15}>
        <Rect
          width={width}
          height={height}
          fill="#282C34"
          cornerRadius={3}
        />
        <Rect
          width={data.priority === 'low' ? width * 0.33 : data.priority === 'medium' ? width * 0.66 : width}
          height={height}
          fill={priorityColor[data.priority]}
          cornerRadius={3}
        />
      </Group>
    )
  }
  
  // Render a single subtask item
  const renderSubtask = (subtask: SubTask, index: number) => {
    const y = index * 40
    
    return (
      <Group key={subtask.id} y={y}>
        <Circle
          x={padding + 10}
          y={10}
          radius={8}
          fill={subtask.completed ? '#31C48D' : 'transparent'}
          stroke={subtask.completed ? '#31C48D' : 'rgba(255, 255, 255, 0.5)'}
          strokeWidth={1.5}
          onClick={() => {
            // Toggle completion status
            const updatedSubtasks = [...data.subtasks]
            updatedSubtasks[index] = {
              ...subtask,
              completed: !subtask.completed
            }
            
            updateComponent(data.id, {
              subtasks: updatedSubtasks
            })
          }}
        />
        
        {/* Checkmark for completed tasks */}
        {subtask.completed && (
          <Group x={padding + 10} y={10}>
            <Line
              points={[4, 0, 8, 4, 4, 8]}
              stroke="white"
              strokeWidth={1.5}
              x={-3}
              y={-4}
            />
          </Group>
        )}
        
        <Text
          x={padding + 30}
          y={3}
          text={subtask.text}
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill={subtask.completed ? 'rgba(255, 255, 255, 0.6)' : 'white'}
          textDecoration={subtask.completed ? 'line-through' : undefined}
          width={data.width - padding * 2 - 40}
        />
        
        {/* Time estimate chip */}
        {subtask.timeEstimate && (
          <Group x={data.width - 60 - padding}>
            <Rect
              width={50}
              height={20}
              fill="rgba(255, 255, 255, 0.1)"
              cornerRadius={10}
            />
            <Text
              x={5}
              y={3}
              text={`${subtask.timeEstimate}m`}
              fontSize={12}
              fontFamily="Inter, sans-serif"
              fill="rgba(255, 255, 255, 0.7)"
              width={40}
              align="center"
            />
          </Group>
        )}
      </Group>
    )
  }
  
  // Add new subtask input
  const renderAddSubtaskInput = () => {
    return (
      <Group y={data.subtasks.length * 40 + 10}>
        <Rect
          x={padding}
          y={0}
          width={data.width - padding * 2}
          height={36}
          fill="rgba(255, 255, 255, 0.05)"
          cornerRadius={5}
        />
        <Text
          x={padding + 15}
          y={10}
          text="Add a new task..."
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="rgba(255, 255, 255, 0.4)"
        />
      </Group>
    )
  }
  
  // Render task filtering controls
  const renderTaskControls = () => {
    return (
      <Group y={data.subtasks.length * 40 + 60}>
        <Rect
          x={padding}
          y={0}
          width={data.width - padding * 2}
          height={40}
          fill="rgba(255, 255, 255, 0.03)"
          cornerRadius={5}
        />
        
        {/* Status filters */}
        <Group x={padding + 10} y={10}>
          <Text
            text="All Status"
            fontSize={12}
            fontFamily="Inter, sans-serif"
            fill="rgba(255, 255, 255, 0.7)"
          />
          <Line
            points={[0, 24, 10, 14]}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth={1}
            x={80}
            y={-6}
          />
        </Group>
        
        {/* Priority filters */}
        <Group x={padding + 120} y={10}>
          <Text
            text="All Priorities"
            fontSize={12}
            fontFamily="Inter, sans-serif"
            fill="rgba(255, 255, 255, 0.7)"
          />
          <Line
            points={[0, 24, 10, 14]}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth={1}
            x={90}
            y={-6}
          />
        </Group>
      </Group>
    )
  }
  
  // Render dependency visualization
  const renderDependencies = () => {
    if (!data.dependencies || data.dependencies.length === 0) return null;
    
    return (
      <Group y={data.dueDate ? 60 : 50}>
        <Rect
          x={padding}
          y={0}
          width={data.width - padding * 2}
          height={30}
          fill="rgba(65, 105, 225, 0.1)"
          cornerRadius={5}
          shadowColor="rgba(65, 105, 225, 0.2)"
          shadowBlur={5}
          shadowOpacity={0.5}
        />
        <Text
          x={padding + 10}
          y={8}
          text={`Dependencies: ${data.dependencies.length}`}
          fontSize={12}
          fontFamily="Inter, sans-serif"
          fill="rgba(255, 255, 255, 0.7)"
        />
        {/* Dependency visualization as connected dots */}
        <Group x={padding + 120} y={15}>
          {data.dependencies.map((_, i) => (
            <Circle
              key={`dep-${i}`}
              x={i * 15}
              radius={4}
              fill="#4169E1"
              shadowColor="#4169E1"
              shadowBlur={8}
              shadowOpacity={0.7}
            />
          ))}
          {data.dependencies.length > 1 && (
            <Line
              points={Array.from({length: data.dependencies.length}).flatMap((_, i) => 
                i < data.dependencies.length - 1 ? [i * 15, 0, (i + 1) * 15, 0] : []
              )}
              stroke="#4169E1"
              strokeWidth={1.5}
              dash={[2, 2]}
            />
          )}
        </Group>
      </Group>
    );
  };
  
  return (
    <Group>
      {/* Task header with priority and status */}
      <Group>
        {/* Royal blue glow at the top */}
        <Rect
          x={0}
          y={0}
          width={data.width}
          height={3}
          fill="#4169E1"
          cornerRadius={[3, 3, 0, 0]}
          shadowColor="#4169E1"
          shadowBlur={5}
          shadowOpacity={0.5}
        />
        
        {renderPriorityIndicator()}
        
        <Rect
          x={data.width - padding - 100}
          y={10}
          width={85}
          height={22}
          fill={statusColors[data.status] + '30'}
          cornerRadius={11}
          shadowColor={statusColors[data.status]}
          shadowBlur={4}
          shadowOpacity={0.4}
        />
        <Text
          x={data.width - padding - 97}
          y={13}
          text={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          fontSize={12}
          fontStyle="bold"
          fontFamily="Inter, sans-serif"
          fill={statusColors[data.status]}
          width={80}
          align="center"
        />
        
        {/* Due date if available */}
        {data.dueDate && (
          <Group x={padding} y={30}>
            <Text
              text={`Due: ${new Date(data.dueDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}`}
              fontSize={12}
              fontFamily="Inter, sans-serif"
              fill="rgba(255, 255, 255, 0.7)"
            />
          </Group>
        )}
        
        {/* Completion percentage with glowing circle */}
        <Group x={data.width - padding - 40} y={30}>
          <Circle
            radius={18}
            fill="rgba(65, 105, 225, 0.1)"
            stroke="#4169E1"
            strokeWidth={2}
            shadowColor="#4169E1"
            shadowBlur={8}
            shadowOpacity={0.4}
          />
          <Text
            x={-14}
            y={-7}
            text={`${data.completionPercentage || 0}%`}
            fontSize={12}
            fontStyle="bold"
            fontFamily="Inter, sans-serif"
            fill="white"
            width={28}
            align="center"
          />
        </Group>
      </Group>
      
      {/* Task description */}
      <Text
        x={padding}
        y={60}
        text={data.description}
        fontSize={14}
        fontFamily="Inter, sans-serif"
        fill="rgba(255, 255, 255, 0.9)"
        width={data.width - padding * 2}
        lineHeight={1.4}
      />
      
      {/* Render dependencies if any */}
      {renderDependencies()}
      
      {/* Subtasks */}
      <Group x={0} y={(data.dependencies?.length ?? 0) > 0 ? 140 : 100}>
        <Rect
          x={padding}
          y={-10}
          width={data.width - padding * 2}
          height={data.subtasks.length * 40 + 20}
          fill="rgba(255, 255, 255, 0.02)"
          cornerRadius={5}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={1}
        />
        
        {data.subtasks.map((subtask, index) => renderSubtask(subtask, index))}
      </Group>
      
      {renderAddSubtaskInput()}
      {renderTaskControls()}
    </Group>
  )
}

export default TaskComponent
