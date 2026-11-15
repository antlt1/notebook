import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { signOut } from '@/services/authService'
import { createNote, deleteNote, renameNote } from '@/services/noteService'
import { formatRelativeTime } from '@/utils/date'
import { mapAuthError, mapFirestoreError } from '@/utils/firebaseErrors'
import { Sidebar } from './components/Sidebar'
import { NoteEditor } from './editor/NoteEditor'
import { useNotes } from './hooks/useNotes'

export function HomePage() {
  const { user } = useAuth()
  const { noteId = null } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const { notes, status, error, retry } = useNotes(user?.uid ?? null)

  const [creating, setCreating] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const selectedNote = notes.find((note) => note.id === noteId) ?? null

  async function handleCreate() {
    if (user === null) {
      return
    }

    setActionError(null)
    setCreating(true)
    try {
      const createdId = await createNote(user.uid)
      navigate(`/n/${createdId}`)
    } catch (createError) {
      setActionError(mapFirestoreError(createError))
    } finally {
      setCreating(false)
    }
  }

  async function handleRename(id: string, title: string) {
    setActionError(null)
    try {
      await renameNote(id, title)
    } catch (renameError) {
      setActionError(mapFirestoreError(renameError))
    }
  }

  async function handleDelete(id: string) {
    setActionError(null)
    try {
      await deleteNote(id)
      if (id === noteId) {
        navigate('/')
      }
    } catch (deleteError) {
      setActionError(mapFirestoreError(deleteError))
    }
  }

  async function handleSignOut() {
    setActionError(null)
    setSigningOut(true)
    try {
      await signOut()
    } catch (signOutError) {
      setActionError(mapAuthError(signOutError))
      setSigningOut(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar
        notes={notes}
        status={status}
        error={error}
        actionError={actionError}
        selectedNoteId={noteId}
        creating={creating}
        signingOut={signingOut}
        userEmail={user?.email ?? null}
        onRetry={retry}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 px-6 py-8 lg:h-screen lg:overflow-y-auto">
        {noteId === null ? (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-2 text-center">
            <h1 className="text-lg font-semibold tracking-tight">Chọn một ghi chú</h1>
            <p className="text-sm text-muted-foreground">
              Chọn ghi chú ở cột bên trái, hoặc tạo ghi chú mới để bắt đầu.
            </p>
          </div>
        ) : status === 'loading' ? (
          <p className="text-sm text-muted-foreground" role="status">
            Đang tải ghi chú…
          </p>
        ) : selectedNote === null ? (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-2 text-center">
            <h1 className="text-lg font-semibold tracking-tight">Không tìm thấy ghi chú</h1>
            <p className="text-sm text-muted-foreground">
              Ghi chú này có thể đã bị xoá hoặc không thuộc tài khoản của bạn.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Về danh sách</Link>
            </Button>
          </div>
        ) : (
          <article className="mx-auto max-w-3xl space-y-4">
            <header className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{selectedNote.title}</h1>
              <p className="text-xs text-muted-foreground">
                {selectedNote.tabs.length} tab · cập nhật {formatRelativeTime(selectedNote.updatedAt)}
              </p>
            </header>

            {/* `key` để mỗi note có editor riêng: đổi note là remount + flush autosave. */}
            <NoteEditor key={selectedNote.id} note={selectedNote} />
          </article>
        )}
      </main>
    </div>
  )
}
