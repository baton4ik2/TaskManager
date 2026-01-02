import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GoogleIcon, YandexIcon } from '../components/OAuthIcons'
import { AppIcon } from '../components/AppIcon'
import '../App.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await register(username, password)
      } else {
        await login(username, password)
      }
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при входе')
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ width: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <AppIcon size={48} />
          <h2 style={{ marginTop: '15px', marginBottom: '5px', textAlign: 'center' }}>
            {isRegister ? 'Регистрация' : 'Вход'}
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Task Manager</p>
        </div>
        {error && (
          <div style={{ 
            color: '#de350b', 
            marginBottom: '15px', 
            padding: '10px',
            background: '#ffebe6',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '10px' }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>Или войдите через:</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.location.href = '/api/oauth2/authorization/google'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <GoogleIcon size={20} />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/api/oauth2/authorization/yandex'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#FC3F1D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(252, 63, 29, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E6392A';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(252, 63, 29, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FC3F1D';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(252, 63, 29, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <YandexIcon size={20} />
              <span>Yandex</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

