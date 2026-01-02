import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { tasksApi } from '../services/api'
import { AppIcon } from '../components/AppIcon'
import '../App.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll(),
  })

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
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            Проекты
          </button>
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
          <div>
            {tasks && tasks.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ marginBottom: '10px' }}>{task.key}: {task.title}</h3>
                        <p style={{ color: '#6b778c', marginBottom: '10px' }}>{task.description}</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                            {task.projectName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <p style={{ color: '#6b778c', textAlign: 'center' }}>Нет задач</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

