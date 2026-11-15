import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail, signInWithGoogle } from '@/services/authService'
import { mapAuthError } from '@/utils/firebaseErrors'
import { AuthShell } from './AuthShell'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signInWithEmail(email.trim(), password)
    } catch (signInError) {
      setError(mapAuthError(signInError))
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setGoogleSubmitting(true)
    try {
      await signInWithGoogle()
    } catch (googleError) {
      setError(mapAuthError(googleError))
      setGoogleSubmitting(false)
    }
  }

  const busy = submitting || googleSubmitting

  return (
    <AuthShell
      title="Đăng nhập"
      description="Đăng nhập để mở các ghi chú của bạn."
      footer={
        <div className="flex w-full items-center justify-between">
          <Link className="text-foreground underline underline-offset-4" to="/register">
            Tạo tài khoản
          </Link>
          <Link className="underline underline-offset-4" to="/reset-password">
            Quên mật khẩu?
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
          />
        </div>

        {error === null ? null : (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button className="w-full" type="submit" disabled={busy}>
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Đăng nhập
        </Button>
      </form>

      <div className="relative text-center text-xs text-muted-foreground">
        <span className="bg-card px-2">hoặc</span>
      </div>

      <Button
        className="w-full"
        type="button"
        variant="outline"
        disabled={busy}
        onClick={handleGoogleSignIn}
      >
        {googleSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Tiếp tục với Google
      </Button>
    </AuthShell>
  )
}
