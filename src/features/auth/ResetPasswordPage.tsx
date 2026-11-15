import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendPasswordReset } from '@/services/authService'
import { mapAuthError } from '@/utils/firebaseErrors'
import { AuthShell } from './AuthShell'

export function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      await sendPasswordReset(email.trim())
      setSuccess(true)
    } catch (resetError) {
      setError(mapAuthError(resetError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Đặt lại mật khẩu"
      description="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu."
      footer={
        <span>
          Nhớ ra rồi?{' '}
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
            disabled={submitting}
          />
        </div>

        {error === null ? null : (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert role="status">
            <AlertDescription>
              Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư.
            </AlertDescription>
          </Alert>
        ) : null}

        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Gửi liên kết
        </Button>
      </form>
    </AuthShell>
  )
}
