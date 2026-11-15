import { useMemo, useState } from 'react'
import { Loader2, LogOut, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import type { NotesStatus } from '../hooks/useNotes'
import type { Note } from '@/types/note'
import { NoteListItem } from './NoteListItem'

interface SidebarProps {
  notes: Note[]
  status: NotesStatus
  error: string | null
  actionError: string | null
  selectedNoteId: string | null
  creating: boolean
  signingOut: boolean
  userEmail: string | null
  onRetry: () => void
  onCreate: () => void
  onRename: (noteId: string, title: string) => Promise<void>
  onDelete: (noteId: string) => Promise<void>
  onSignOut: () => void
}

export function Sidebar({
  notes,
  status,
  error,
  actionError,
  selectedNoteId,
  creating,
  signingOut,
  userEmail,
  onRetry,
  onCreate,
  onRename,
  onDelete,
  onSignOut,
}: SidebarProps) {
  const [search, setSearch] = useState('')

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi')
    if (query.length === 0) {
      return notes
    }
    return notes.filter((note) => note.title.toLocaleLowerCase('vi').includes(query))
  }, [notes, search])

  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-sidebar text-sidebar-foreground lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold tracking-tight">GhiChu Notebook</span>
          <Button type="button" size="sm" disabled={creating} onClick={onCreate}>
            {creating ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            Ghi chú
          </Button>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            className="pl-8"
            placeholder="Tìm theo tiêu đề…"
            aria-label="Tìm ghi chú theo tiêu đề"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {status === 'loading' ? (
          <ul className="space-y-1" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <li key={index} className="animate-pulse rounded-lg bg-muted/70 px-2.5 py-3">
                <div className="h-3 w-2/3 rounded bg-muted-foreground/20" />
                <div className="mt-2 h-2 w-1/3 rounded bg-muted-foreground/20" />
              </li>
            ))}
          </ul>
        ) : null}

        {status === 'error' ? (
          <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Thử lại
            </Button>
          </div>
        ) : null}

        {status === 'ready' && notes.length === 0 ? (
          <div className="space-y-2 px-1 py-6 text-center">
            <p className="text-sm font-medium">Chưa có ghi chú nào</p>
            <p className="text-xs text-muted-foreground">Bấm “Ghi chú” để tạo cái đầu tiên.</p>
          </div>
        ) : null}

        {status === 'ready' && notes.length > 0 && filteredNotes.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Không tìm thấy ghi chú nào khớp “{search.trim()}”.
          </p>
        ) : null}

        {status === 'ready' && filteredNotes.length > 0 ? (
          <ul className="space-y-0.5">
            {filteredNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                active={note.id === selectedNoteId}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </ul>
        ) : null}
      </div>

      {actionError === null ? null : (
        <p className="px-3 pb-2 text-xs text-destructive" role="alert">
          {actionError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3">
        <span className="truncate text-xs text-muted-foreground" title={userEmail ?? undefined}>
          {userEmail}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={signingOut}
            onClick={onSignOut}
          >
            {signingOut ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <LogOut aria-hidden="true" />
            )}
            Đăng xuất
          </Button>
        </div>
      </div>
    </aside>
  )
}
