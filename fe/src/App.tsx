import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary'
import Toaster from '@/components/Toaster/toaster'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import LoginPage from '@/features/auth/pages/LoginPage/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage/RegisterPage'
import { useAuthStore } from '@/features/auth/auth.store'
import HomePage from '@/features/home/HomePage'
import AppLayout from '@/layout/AppLayout'
import NotFoundPage from '@/layout/404/notFoundPage'

function AppRoutes() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      <Route
        path='/login'
        element={
          isAuthenticated ? (
            <Navigate to='/' replace />
          ) : (
            <LoginPage onRegisterClick={() => navigate('/register')} onSuccess={() => navigate('/')} />
          )
        }
      />
      <Route
        path='/register'
        element={
          isAuthenticated ? <Navigate to='/' replace /> : <RegisterPage onLoginClick={() => navigate('/login')} />
        }
      />

      <Route path='/' element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Route>

      <Route element={<AppLayout />}>
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      <Toaster />
    </BrowserRouter>
  )
}
