import React from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../types/task'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: number, newStatus: Task['status']) => void
  onTaskClick?: (taskId: number) => void
}

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onTaskClick?: (taskId: number) => void
}

interface TaskCardProps {
  task: Task
  onTaskClick?: (taskId: number) => void
}

const statusLabels: Record<Task['status'], string> = {
  TODO: 'К выполнению',
  IN_PROGRESS: 'В работе',
  IN_REVIEW: 'На проверке',
  DONE: 'Выполнено',
}

const statusColors: Record<Task['status'], string> = {
  TODO: '#dfe1e6',
  IN_PROGRESS: '#0052cc',
  IN_REVIEW: '#ffab00',
  DONE: '#36b37e',
}

const priorityColors: Record<Task['priority'], string> = {
  LOW: '#6b778c',
  MEDIUM: '#0052cc',
  HIGH: '#ff5630',
  CRITICAL: '#de350b',
}

function TaskCard({ task, onTaskClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const cardStyle = {
    ...style,
    padding: '12px',
    background: '#fff',
    borderRadius: '8px',
    marginBottom: '8px',
    cursor: 'grab',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${statusColors[task.status]}`,
    borderLeft: `4px solid ${statusColors[task.status]}`,
    transition: 'all 0.2s ease',
  } as React.CSSProperties

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      {...listeners}
      onClick={() => onTaskClick?.(task.id)}
      className="kanban-task-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
        {task.key}: {task.title}
      </div>
      {task.description && (
        <div
          style={{
            fontSize: '12px',
            color: '#6b778c',
            marginBottom: '8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '2px 6px',
            background: priorityColors[task.priority],
            color: 'white',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '500',
          }}
        >
          {task.priority}
        </span>
        <span
          style={{
            padding: '2px 6px',
            background: '#dfe1e6',
            color: '#42526e',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '500',
          }}
        >
          {task.type}
        </span>
      </div>
      {task.assigneeUsername && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#6b778c',
          }}
        >
          👤 {task.assigneeUsername}
        </div>
      )}
    </div>
  )
}

function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
  const taskIds = tasks.map((task) => task.id.toString())
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div
      ref={setNodeRef}
      className="kanban-column"
      style={{
        minWidth: '280px',
        background: isOver ? '#e4e6ea' : '#f4f5f7',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 250px)',
        overflowY: 'auto',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        style={{
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '12px',
          color: '#42526e',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title} ({tasks.length})
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
          {tasks.length === 0 && (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#6b778c',
                fontSize: '12px',
              }}
            >
              Нет задач
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tasksByStatus: Record<Task['status'], Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  }

  tasks.forEach((task) => {
    tasksByStatus[task.status].push(task)
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Не обновляем статус во время перетаскивания, только визуально показываем
    // Реальное обновление произойдет в handleDragEnd
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id.toString() === activeId)
    if (!activeTask) return

    // Если перетаскиваем над колонкой (статусом)
    if (['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(overId)) {
      if (activeTask.status !== overId) {
        onTaskMove(activeTask.id, overId as Task['status'])
      }
    } else {
      // Если перетаскиваем над другой задачей, берем статус этой задачи
      const overTask = tasks.find((t) => t.id.toString() === overId)
      if (overTask && activeTask.status !== overTask.status) {
        onTaskMove(activeTask.id, overTask.status)
      }
    }
  }

  const activeTask = activeId ? tasks.find((t) => t.id.toString() === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
        }}
      >
        {(Object.keys(tasksByStatus) as Task['status'][]).map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={statusLabels[status]}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div
            style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: `1px solid ${statusColors[activeTask.status]}`,
              borderLeft: `4px solid ${statusColors[activeTask.status]}`,
              opacity: 0.9,
              transform: 'rotate(5deg)',
              maxWidth: '280px',
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
              {activeTask.key}: {activeTask.title}
            </div>
            {activeTask.description && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b778c',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {activeTask.description}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '2px 6px',
                  background: priorityColors[activeTask.priority],
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '500',
                }}
              >
                {activeTask.priority}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

