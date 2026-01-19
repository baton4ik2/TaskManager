import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { tasksApi } from '../services/api'
import { AppIcon } from '../components/AppIcon'
import { KanbanBoard } from '../components/KanbanBoard'
import { Task } from '../types/task'
import '../App.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll(),
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: Task['status'] }) =>
      tasksApi.update(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleTaskMove = (taskId: number, newStatus: Task['status']) => {
    updateTaskStatusMutation.mutate({ taskId, status: newStatus })
  }

  return (
    <div className="app">
      <nav style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AppIcon size={32} />
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Task Manager</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>Привет, {user?.username}!</span>
          <button className="btn btn-secondary" onClick={logout}>
            Выход
          </button>
        </div>
      </nav>
      <div className="container">
        <h2 style={{ marginBottom: '20px' }}>Мои задачи</h2>
        {isLoading ? (
          <div>Загрузка...</div>
        ) : (
          <KanbanBoard
            tasks={tasks || []}
            onTaskMove={handleTaskMove}
            onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard

