import { Loader2 } from 'lucide-react'

export function FullPageLoader({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span role="status">{label}</span>
    </div>
  )
}
