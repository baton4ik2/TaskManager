import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { tasksApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { Task } from '../types/task'
import '../App.css'

function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
  })

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
      })
    }
  }, [task])

  const updateMutation = useMutation({
    mutationFn: (data: any) => tasksApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(Number(id)),
    onSuccess: () => {
      navigate(-1)
    },
  })

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) return <div>Загрузка...</div>
  if (!task) return <div>Задача не найдена</div>

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
        <h1 style={{ margin: 0 }}>{task.key}</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Назад
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            Выход
          </button>
        </div>
      </nav>
      <div className="container">
        <div className="card">
          {isEditing ? (
            <form onSubmit={handleUpdate}>
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
                  rows={5}
                />
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Приоритет</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">
                  Сохранить
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ marginBottom: '10px' }}>{task.title}</h2>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#dfe1e6',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {task.status}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      background: '#dfe1e6',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {task.priority}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      background: '#dfe1e6',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {task.type}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    Редактировать
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteMutation.mutate()}>
                    Удалить
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Описание</h3>
                <p style={{ color: '#6b778c', whiteSpace: 'pre-wrap' }}>
                  {task.description || 'Нет описания'}
                </p>
              </div>
              <div>
                <p style={{ color: '#6b778c', fontSize: '14px' }}>
                  <strong>Проект:</strong> {task.projectName}
                </p>
                <p style={{ color: '#6b778c', fontSize: '14px' }}>
                  <strong>Создал:</strong> {task.reporterUsername}
                </p>
                {task.assigneeUsername && (
                  <p style={{ color: '#6b778c', fontSize: '14px' }}>
                    <strong>Исполнитель:</strong> {task.assigneeUsername}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskDetail

