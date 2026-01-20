import axios from 'axios'

// В Docker используем относительный путь (проксируется через nginx)
// При локальной разработке также используется прокси из vite.config.ts
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor для добавления токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если 401, очищаем токен и перенаправляем на логин
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },
  register: async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password })
    return response.data
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export const projectsApi = {
  getAll: async () => {
    const response = await api.get('/projects')
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },
  create: async (data: { name: string; description?: string; key: string }) => {
    const response = await api.post('/projects', data)
    return response.data
  },
  update: async (id: number, data: { name?: string; description?: string }) => {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },
  delete: async (id: number) => {
    await api.delete(`/projects/${id}`)
  },
}

export const tasksApi = {
  getAll: async (projectIds?: number[], assigneeId?: number) => {
    const params = new URLSearchParams()
    if (projectIds && projectIds.length > 0) {
      projectIds.forEach(id => params.append('projectIds', id.toString()))
    }
    if (assigneeId) params.append('assigneeId', assigneeId.toString())
    const response = await api.get(`/tasks?${params.toString()}`)
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },
  create: async (data: {
    title: string
    description?: string
    projectId: number
    type?: string
    status?: string
    priority?: string
    assigneeId?: number
  }) => {
    const response = await api.post('/tasks', data)
    return response.data
  },
  update: async (id: number, data: {
    title?: string
    description?: string
    type?: string
    status?: string
    priority?: string
    assigneeId?: number
  }) => {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },
  delete: async (id: number) => {
    await api.delete(`/tasks/${id}`)
  },
}

export default api

