import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { projectsApi } from '../services/api'
import { AppIcon } from '../components/AppIcon'
import { useState } from 'react'
import '../App.css'

function Projects() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', key: '' })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowCreateForm(false)
      setFormData({ name: '', description: '', key: '' })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <AppIcon size={32} />
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Task Manager</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Главная
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            Выход
          </button>
        </div>
      </nav>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Проекты</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Отмена' : 'Создать проект'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Новый проект</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ключ проекта (например: PROJ)</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  required
                  maxLength={10}
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
              <button type="submit" className="btn btn-primary">
                Создать
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div>Загрузка...</div>
        ) : (
          <div>
            {projects && projects.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {projects.map((project: any) => (
                  <div
                    key={project.id}
                    className="card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ marginBottom: '10px' }}>{project.key}: {project.name}</h3>
                        <p style={{ color: '#6b778c' }}>{project.description}</p>
                        <p style={{ color: '#6b778c', fontSize: '12px', marginTop: '10px' }}>
                          Владелец: {project.ownerUsername}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <p style={{ color: '#6b778c', textAlign: 'center' }}>Нет проектов</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects

