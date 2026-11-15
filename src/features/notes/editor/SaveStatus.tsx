import { CircleAlert, Loader2 } from 'lucide-react'
import type { AutosaveStatus } from '../hooks/useAutosave'

interface SaveStatusProps {
  status: AutosaveStatus
  savedAt: Date | null
  error: string | null
  onRetry: () => void
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

/** Trạng thái lưu ở chân editor: Đang lưu… / Đã lưu lúc HH:mm / Lỗi (Mục 7.5). */
export function SaveStatus({ status, savedAt, error, onRetry }: SaveStatusProps) {
  return (
    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
      {status === 'saving' ? (
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          Đang lưu…
        </span>
      ) : null}

      {status === 'saved' && savedAt !== null ? (
        <span>Đã lưu lúc {formatClock(savedAt)}</span>
      ) : null}

      {status === 'error' ? (
        <span className="inline-flex items-center gap-1.5 text-destructive">
          <CircleAlert className="size-3" aria-hidden="true" />
          {error ?? 'Lỗi lưu'}
          <button
            type="button"
            className="underline underline-offset-2 hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            onClick={onRetry}
          >
            Thử lại
          </button>
        </span>
      ) : null}
    </p>
  )
}
