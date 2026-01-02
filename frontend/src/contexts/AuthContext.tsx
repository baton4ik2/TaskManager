import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../services/api'

interface User {
  username: string
  email: string
  role: string
  userId?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string) => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      setToken(storedToken)
      
      // Если есть токен, но нет пользователя, загружаем пользователя из API
      if (!storedUser) {
        authApi.getCurrentUser()
          .then((userData) => {
            const user = {
              username: userData.username,
              email: userData.email,
              role: userData.role,
              userId: userData.userId,
            }
            setUser(user)
            localStorage.setItem('user', JSON.stringify(user))
            setLoading(false)
          })
          .catch((error) => {
            console.error('Failed to load user:', error)
            // Если не удалось загрузить пользователя, очищаем токен
            localStorage.removeItem('token')
            setToken(null)
            setLoading(false)
          })
      } else {
        setUser(JSON.parse(storedUser))
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password)
    setToken(response.token)
    const userData = {
      username: response.username,
      email: response.email,
      role: response.role,
      userId: response.userId,
    }
    setUser(userData)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (username: string, password: string) => {
    const response = await authApi.register(username, password)
    setToken(response.token)
    const userData = {
      username: response.username,
      email: response.email,
      role: response.role,
      userId: response.userId,
    }
    setUser(userData)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const setTokenValue = (tokenValue: string) => {
    setToken(tokenValue)
    localStorage.setItem('token', tokenValue)
  }

  const setUserValue = (userValue: User) => {
    setUser(userValue)
    localStorage.setItem('user', JSON.stringify(userValue))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setToken: setTokenValue, setUser: setUserValue }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

