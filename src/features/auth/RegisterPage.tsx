import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithGoogle, signUpWithEmail } from '@/services/authService'
import { mapAuthError } from '@/utils/firebaseErrors'
import { AuthShell } from './AuthShell'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await signUpWithEmail(email.trim(), password)
    } catch (signUpError) {
      setError(mapAuthError(signUpError))
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
      title="Tạo tài khoản"
      description="Mỗi tài khoản có không gian ghi chú riêng."
      footer={
        <span>
          Đã có tài khoản?{' '}
          <Link className="text-foreground underline underline-offset-4" to="/login">
            Đăng nhập
          </Link>
        </span>
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
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
          />
          <p className="text-xs text-muted-foreground">Tối thiểu 6 ký tự.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Nhập lại mật khẩu</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          Đăng ký
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
