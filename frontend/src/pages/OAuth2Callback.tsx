import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/api'
import '../App.css'

function OAuth2Callback() {
  const [searchParams] = useSearchParams()
  const { setToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const username = searchParams.get('username')
    const email = searchParams.get('email')
    const role = searchParams.get('role')

    if (token) {
      // Сохраняем токен в localStorage
      localStorage.setItem('token', token)
      
      // Если информация о пользователе передана в URL, используем её
      if (username && email && role) {
        const user = {
          username: decodeURIComponent(username),
          email: decodeURIComponent(email),
          role: decodeURIComponent(role),
        }
        // Сохраняем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(user))
        
        // Используем window.location для полной перезагрузки страницы
        // чтобы AuthContext загрузил данные из localStorage
        window.location.href = '/'
      } else {
        // Если информации нет в URL, пытаемся загрузить из API
        // Но сначала сохраняем токен в axios interceptor
        setToken(token)
        
        authApi.getCurrentUser()
          .then((userData) => {
            const user = {
              username: userData.username,
              email: userData.email,
              role: userData.role,
            }
            // Сохраняем пользователя в localStorage
            localStorage.setItem('user', JSON.stringify(user))
            
            // Используем window.location для полной перезагрузки
            window.location.href = '/'
          })
          .catch((error) => {
            console.error('Failed to get user info:', error)
            console.error('Error details:', error.response?.data || error.message)
            // Если не удалось получить пользователя, очищаем токен
            localStorage.removeItem('token')
            window.location.href = '/login?error=oauth2_failed'
          })
      }
    } else {
      // Если токен не получен, перенаправляем на страницу входа
      window.location.href = '/login'
    }
  }, [searchParams, setToken])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div>Обработка входа...</div>
    </div>
  )
}

export default OAuth2Callback
