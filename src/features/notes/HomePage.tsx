import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { signOut } from '@/services/authService'
import { mapAuthError } from '@/utils/firebaseErrors'

export function HomePage() {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setError(null)
    setSigningOut(true)
    try {
      await signOut()
    } catch (signOutError) {
      setError(mapAuthError(signOutError))
      setSigningOut(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-semibold tracking-tight">GhiChu Notebook</h1>
      <p className="text-sm text-muted-foreground">Đăng nhập với {user?.email}</p>
      <p className="text-xs text-muted-foreground">Khu vực ghi chú sẽ có ở Phase 3.</p>

      {error === null ? null : (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button variant="outline" disabled={signingOut} onClick={handleSignOut}>
        {signingOut ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Đăng xuất
      </Button>
    </main>
  )
}
