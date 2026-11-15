import { Navigate, Outlet } from 'react-router-dom'
import { FullPageLoader } from '@/components/FullPageLoader'
import { useAuth } from './auth-context'

export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (user !== null) return <Navigate to="/" replace />
  return <Outlet />
}
