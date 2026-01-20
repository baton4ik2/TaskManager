import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { tasksApi, projectsApi } from '../services/api'
import { AppIcon } from '../components/AppIcon'
import { KanbanBoard } from '../components/KanbanBoard'
import { Task } from '../types/task'
import { useState, useEffect } from 'react'
import '../App.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: 0,
    type: 'TASK',
    priority: 'MEDIUM',
  })
  
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  })

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', selectedProjectIds],
    queryFn: () => tasksApi.getAll(selectedProjectIds),
  })

  // Устанавливаем проект по умолчанию для формы, когда проекты загружены
  useEffect(() => {
    if (projects && projects.length > 0 && formData.projectId === 0) {
      setFormData(prev => ({ ...prev, projectId: projects[0].id }))
    }
  }, [projects])

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setShowCreateForm(false)
      setFormData({ ...formData, title: '', description: '' })
    },
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

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.projectId === 0 && projects && projects.length > 0) {
      createTaskMutation.mutate({ ...formData, projectId: projects[0].id })
    } else {
      createTaskMutation.mutate(formData)
    }
  }

  const toggleProjectFilter = (projectId: number) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  return (
    <div className="app">
      {/* ... nav ... */}
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
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            Проекты
          </button>
          <span>Привет, {user?.username}!</span>
          <button className="btn btn-secondary" onClick={logout}>
            Выход
          </button>
        </div>
      </nav>

      <div className="container">
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>Задачи</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Отмена' : 'Создать задачу'}
            </button>
          </div>

          {/* Фильтр по проектам */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: '#6b778c', fontWeight: '500' }}>Проекты:</span>
            <button
              onClick={() => setSelectedProjectIds([])}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #dfe1e6',
                background: selectedProjectIds.length === 0 ? '#0052cc' : 'white',
                color: selectedProjectIds.length === 0 ? 'white' : '#42526e',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              Все
            </button>
            {projects?.map(project => (
              <button
                key={project.id}
                onClick={() => toggleProjectFilter(project.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #dfe1e6',
                  background: selectedProjectIds.includes(project.id) ? '#0052cc' : 'white',
                  color: selectedProjectIds.includes(project.id) ? 'white' : '#42526e',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>

        {showCreateForm && (
          <div className="card" style={{ marginBottom: '20px', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '15px' }}>Новая задача</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Что нужно сделать?"
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Добавьте подробностей..."
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Проект</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
                    required
                  >
                    {projects?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Тип</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="TASK">Задача</option>
                    <option value="BUG">Ошибка</option>
                    <option value="STORY">История</option>
                    <option value="EPIC">Эпик</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Приоритет</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="LOW">Низкий</option>
                    <option value="MEDIUM">Средний</option>
                    <option value="HIGH">Высокий</option>
                    <option value="CRITICAL">Критический</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? 'Создание...' : 'Создать задачу'}
                </button>
              </div>
            </form>
          </div>
        )}

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

