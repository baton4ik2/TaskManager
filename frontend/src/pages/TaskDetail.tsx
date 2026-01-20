import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { tasksApi, usersApi } from '../services/api'
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
    type: '',
    assigneeId: null as number | null,
  })

  const { data: task, isLoading: isTaskLoading } = useQuery<Task>({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(Number(id)),
    enabled: !!id,
  })

  const { data: users } = useQuery<any[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        type: task.type,
        assigneeId: task.assigneeId || null,
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      navigate('/')
    },
  })

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isTaskLoading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>
  if (!task) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Задача не найдена</div>

  const statusLabels: Record<string, string> = {
    TODO: 'К выполнению',
    IN_PROGRESS: 'В работе',
    IN_REVIEW: 'На проверке',
    DONE: 'Выполнено',
  }

  const priorityColors: Record<string, string> = {
    LOW: '#6b778c',
    MEDIUM: '#0052cc',
    HIGH: '#ff5630',
    CRITICAL: '#de350b',
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
        <h1 style={{ margin: 0, fontSize: '20px' }}>{task.key}: {task.title}</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Назад
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            Выход
          </button>
        </div>
      </nav>
      <div className="container" style={{ marginTop: '20px' }}>
        <div className="card" style={{ padding: '30px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="TODO">К выполнению</option>
                    <option value="IN_PROGRESS">В работе</option>
                    <option value="IN_REVIEW">На проверке</option>
                    <option value="DONE">Выполнено</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Исполнитель</label>
                  <select
                    value={formData.assigneeId || ''}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">Без исполнителя</option>
                    {users?.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '30px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: '#dfe1e6',
                      color: '#42526e',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {task.type}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      background: priorityColors[task.priority],
                      color: 'white',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {task.priority}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      background: '#36b37e',
                      color: 'white',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>{task.title}</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    Редактировать
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => window.confirm('Удалить эту задачу?') && deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '1px solid #dfe1e6', paddingBottom: '10px' }}>
                    Описание
                  </h3>
                  <div style={{ color: '#172b4d', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {task.description || <em style={{ color: '#6b778c' }}>Нет описания</em>}
                  </div>
                </div>
                <div style={{ background: '#f4f5f7', padding: '20px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Детали</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b778c', display: 'block', marginBottom: '4px' }}>Проект</label>
                      <span style={{ fontWeight: '500' }}>{task.projectName}</span>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b778c', display: 'block', marginBottom: '4px' }}>Автор</label>
                      <span style={{ fontWeight: '500' }}>👤 {task.reporterUsername}</span>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b778c', display: 'block', marginBottom: '4px' }}>Исполнитель</label>
                      <span style={{ fontWeight: '500' }}>
                        {task.assigneeUsername ? `👤 ${task.assigneeUsername}` : <em style={{ color: '#6b778c' }}>Не назначен</em>}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b778c', display: 'block', marginBottom: '4px' }}>Создана</label>
                      <span style={{ fontSize: '13px' }}>{new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b778c', display: 'block', marginBottom: '4px' }}>Обновлена</label>
                      <span style={{ fontSize: '13px' }}>{new Date(task.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskDetail

