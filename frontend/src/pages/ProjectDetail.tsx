import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsApi, tasksApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import '../App.css'

function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM',
  })

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(Number(id)),
    enabled: !!id,
  })

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getAll(Number(id)),
    enabled: !!id,
  })

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      setShowCreateForm(false)
      setFormData({ title: '', description: '', type: 'TASK', priority: 'MEDIUM' })
    },
  })

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (id) {
      createTaskMutation.mutate({
        ...formData,
        projectId: Number(id),
      })
    }
  }

  const tasksByStatus = {
    TODO: tasks?.filter((t: any) => t.status === 'TODO') || [],
    IN_PROGRESS: tasks?.filter((t: any) => t.status === 'IN_PROGRESS') || [],
    IN_REVIEW: tasks?.filter((t: any) => t.status === 'IN_REVIEW') || [],
    DONE: tasks?.filter((t: any) => t.status === 'DONE') || [],
  }

  if (projectLoading) return <div>Загрузка...</div>
  if (!project) return <div>Проект не найден</div>

  return (
    <div className="app">
      <nav style={{
        background: '#0052cc',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>{project.key}: {project.name}</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            Назад к проектам
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            Выход
          </button>
        </div>
      </nav>
      <div className="container">
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{project.name}</h3>
          <p style={{ color: '#6b778c' }}>{project.description}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Задачи</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Отмена' : 'Создать задачу'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Новая задача</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
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
              <div className="form-group">
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
              <button type="submit" className="btn btn-primary">
                Создать
              </button>
            </form>
          </div>
        )}

        {tasksLoading ? (
          <div>Загрузка...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            {Object.entries(tasksByStatus).map(([status, statusTasks]: [string, any]) => (
              <div key={status} className="card">
                <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>{status}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {statusTasks.map((task: any) => (
                    <div
                      key={task.id}
                      style={{
                        padding: '10px',
                        background: '#f4f5f7',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                        {task.key}: {task.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b778c' }}>
                        {task.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail

