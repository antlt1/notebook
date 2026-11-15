import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/features/auth/LoginPage'
import { signInWithEmail } from '@/services/authService'

vi.mock('@/services/authService', () => ({
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

describe('LoginPage', () => {
  it('shows a Vietnamese message when credentials are rejected', async () => {
    vi.mocked(signInWithEmail).mockRejectedValueOnce({ code: 'auth/invalid-credential' })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Mật khẩu'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không đúng')
    expect(signInWithEmail).toHaveBeenCalledWith('user@example.com', 'secret123')
  })

  it('submits the trimmed email', async () => {
    vi.mocked(signInWithEmail).mockResolvedValueOnce({} as never)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), '  spaced@example.com  ')
    await user.type(screen.getByLabelText('Mật khẩu'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(signInWithEmail).toHaveBeenCalledWith('spaced@example.com', 'secret123')
  })
})
