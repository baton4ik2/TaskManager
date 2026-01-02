import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import OAuth2Callback from './pages/OAuth2Callback'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import TaskDetail from './pages/TaskDetail'
import './App.css'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      Загрузка...
    </div>
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OAuth2Callback />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <PrivateRoute>
                  <TaskDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

