import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'

type ProtectedRouteProps = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading',
  )

  useEffect(() => {
    let isActive = true

    async function checkSession() {
      try {
        await api.get('/auth/me')

        if (isActive) {
          setStatus('authenticated')
        }
      } catch {
        if (isActive) {
          setStatus('unauthenticated')
        }
      }
    }

    checkSession()

    return () => {
      isActive = false
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Verificando tu sesión...
        </p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}