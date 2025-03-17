import { Group, Text, Rect, Line, Circle } from 'react-konva'
import { TemplateComponent as TemplateComponentType } from '../../../types/canvas'
import useCanvasStore from '../../../store/canvasStore'
import { useState, useEffect } from 'react'

interface TemplateComponentProps {
  data: TemplateComponentType
}

const TemplateComponent = ({ data }: TemplateComponentProps) => {
  const { updateComponent } = useCanvasStore()
  const padding = 15
  
  // Render template task item
  const renderTemplateTask = (task: { id: string; text: string; hasSubtasks: boolean }, index: number) => {
    const y = index * 35
    
    return (
      <Group key={task.id} y={y}>
        <Circle
          x={padding + 10}
          y={10}
          radius={8}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={1.5}
        />
        
        <Text
          x={padding + 30}
          y={3}
          text={task.text}
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="white"
          width={data.width - padding * 2 - 40}
        />
        
        {/* Subtask indicator */}
        {task.hasSubtasks && (
          <Group x={data.width - 40 - padding}>
            <Rect
              width={24}
              height={20}
              fill="rgba(255, 255, 255, 0.1)"
              cornerRadius={4}
            />
            <Text
              x={7}
              y={3}
              text="+"
              fontSize={12}
              fontFamily="Inter, sans-serif"
              fill="rgba(255, 255, 255, 0.7)"
            />
          </Group>
        )}
      </Group>
    )
  }
  
  // Render description
  const renderDescription = () => {
    return (
      <Group y={10}>
        <Rect
          x={padding}
          y={0}
          width={data.width - padding * 2}
          height={60}
          fill="rgba(255, 255, 255, 0.05)"
          cornerRadius={5}
        />
        <Text
          x={padding + 10}
          y={10}
          text={data.description}
          fontSize={13}
          fontFamily="Inter, sans-serif"
          fill="rgba(255, 255, 255, 0.8)"
          width={data.width - padding * 2 - 20}
          lineHeight={1.3}
        />
      </Group>
    )
  }
  
  // Render template category
  const renderCategory = () => {
    return (
      <Group y={85}>
        <Text
          x={padding}
          y={0}
          text="CATEGORY"
          fontSize={11}
          fontFamily="Inter, sans-serif"
          fill="rgba(255, 255, 255, 0.5)"
          letterSpacing={1}
        />
        <Text
          x={padding}
          y={20}
          text={data.category}
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="rgba(255, 255, 255, 0.9)"
          fontStyle="bold"
        />
      </Group>
    )
  }
  
  // Render task list
  const renderTaskList = () => {
    return (
      <Group y={125}>
        <Text
          x={padding}
          y={0}
          text="TASKS"
          fontSize={11}
          fontFamily="Inter, sans-serif"
          fill="rgba(255, 255, 255, 0.5)"
          letterSpacing={1}
        />
        
        <Rect
          x={padding}
          y={25}
          width={data.width - padding * 2}
          height={data.tasks.length * 35 + 10}
          fill="rgba(255, 255, 255, 0.02)"
          cornerRadius={5}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={1}
        />
        
        <Group y={30}>
          {data.tasks.map((task, index) => renderTemplateTask(task, index))}
        </Group>
      </Group>
    )
  }
  
  // Render use template button
  const renderUseTemplateButton = () => {
    return (
      <Group y={data.height - 60}>
        <Rect
          x={(data.width - 170) / 2}
          y={0}
          width={170}
          height={40}
          fill="#3282F6"
          cornerRadius={8}
          shadowColor="rgba(0, 0, 0, 0.3)"
          shadowBlur={10}
          shadowOffset={{ x: 0, y: 2 }}
          shadowOpacity={0.5}
        />
        <Text
          x={(data.width - 170) / 2 + 35}
          y={12}
          text="Choose Template"
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="white"
          fontStyle="bold"
        />
      </Group>
    )
  }
  
  return (
    <Group>
      {renderDescription()}
      {renderCategory()}
      {renderTaskList()}
      {renderUseTemplateButton()}
    </Group>
  )
}

export default TemplateComponent
