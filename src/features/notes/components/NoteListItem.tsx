import { useEffect, useRef, useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MAX_TITLE_LENGTH } from '@/services/noteService'
import type { Note } from '@/types/note'
import { cn } from 'cn'
import { formatRelativeTime } from '@/utils/date'
import { ConfirmDialog } from './ConfirmDialog'

interface NoteListItemProps {
  note: Note
  active: boolean
  onRename: (noteId: string, title: string) => Promise<void>
  onDelete: (noteId: string) => Promise<void>
}

export function NoteListItem({ note, active, onRename, onDelete }: NoteListItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEditing() {
    setDraft(note.title)
    setEditing(true)
  }

  function cancelEditing() {
    setDraft(note.title)
    setEditing(false)
  }

  async function commitEditing() {
    const trimmed = draft.trim()
    setEditing(false)
    if (trimmed.length === 0 || trimmed === note.title) {
      return
    }
    await onRename(note.id, trimmed)
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await onDelete(note.id)
      setConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <li className="rounded-lg bg-muted px-2 py-1.5">
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={draft}
            maxLength={MAX_TITLE_LENGTH}
            aria-label="Đổi tên ghi chú"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void commitEditing()
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                cancelEditing()
              }
            }}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Lưu tên"
            onClick={() => void commitEditing()}
          >
            <Check aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Huỷ đổi tên"
            onClick={cancelEditing}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </li>
    )
  }

  return (
    <li
      className={cn(
        'group/note relative rounded-lg transition-colors',
        active ? 'bg-muted' : 'hover:bg-muted/60',
      )}
    >
      <Link
        to={`/n/${note.id}`}
        className="block rounded-lg px-2.5 py-2 pr-16 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="block truncate text-sm font-medium">{note.title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {formatRelativeTime(note.updatedAt)}
        </span>
      </Link>

      <div className="absolute top-1.5 right-1 flex opacity-0 transition-opacity group-hover/note:opacity-100 focus-within:opacity-100">
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label={`Đổi tên “${note.title}”`}
          onClick={startEditing}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label={`Xoá “${note.title}”`}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xoá ghi chú?"
        description={`“${note.title}” và toàn bộ tab bên trong sẽ bị xoá vĩnh viễn.`}
        confirmLabel="Xoá"
        pending={deleting}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void handleConfirmDelete()}
      />
    </li>
  )
}
