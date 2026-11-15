import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SaveStatus } from '@/features/notes/editor/SaveStatus'

describe('SaveStatus', () => {
  it('hiện "Đang lưu…" khi đang ghi', () => {
    render(<SaveStatus status="saving" savedAt={null} error={null} onRetry={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Đang lưu…')
  })

  it('hiện giờ lưu khi đã lưu xong', () => {
    render(
      <SaveStatus
        status="saved"
        savedAt={new Date(2026, 10, 15, 14, 32)}
        error={null}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu lúc 14:32')
  })

  it('hiện lỗi kèm nút thử lại và gọi onRetry', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()

    render(
      <SaveStatus
        status="error"
        savedAt={null}
        error="Mất kết nối, đang thử lại…"
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Mất kết nối, đang thử lại…')
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('không hiện gì khi chưa có thay đổi', () => {
    render(<SaveStatus status="idle" savedAt={null} error={null} onRetry={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})
