import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { subscribeAuthState } from '@/services/authService'
import { mapAuthError } from '@/utils/firebaseErrors'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return subscribeAuthState(
      (nextUser) => {
        setUser(nextUser)
        setLoading(false)
      },
      (authError) => {
        setError(mapAuthError(authError))
        setLoading(false)
      },
    )
  }, [])

  const value = useMemo<AuthContextValue>(() => ({ user, loading, error }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
