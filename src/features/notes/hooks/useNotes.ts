import { useCallback, useEffect, useState } from 'react'
import { subscribeNotes } from '@/services/noteService'
import type { Note } from '@/types/note'
import { mapFirestoreError } from '@/utils/firebaseErrors'

export type NotesStatus = 'loading' | 'ready' | 'error'

interface NotesState {
  status: NotesStatus
  notes: Note[]
  error: string | null
}

export interface UseNotesResult {
  notes: Note[]
  status: NotesStatus
  error: string | null
  retry: () => void
}

const INITIAL_STATE: NotesState = { status: 'loading', notes: [], error: null }

/** Realtime note list for the signed-in user, with loading/error states and a retry. */
export function useNotes(uid: string | null): UseNotesResult {
  const [state, setState] = useState<NotesState>(INITIAL_STATE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (uid === null) {
      return
    }

    // Ignore callbacks from a subscription that is already stale (user changed, retry, unmount).
    let active = true

    const unsubscribe = subscribeNotes(
      uid,
      (nextNotes) => {
        if (active) {
          setState({ status: 'ready', notes: nextNotes, error: null })
        }
      },
      (subscribeError) => {
        if (active) {
          setState((previous) => ({
            status: 'error',
            notes: previous.notes,
            error: mapFirestoreError(subscribeError),
          }))
        }
      },
    )

    return () => {
      // Always unsubscribe on unmount/sign-out to stop the listener and its reads.
      active = false
      unsubscribe()
    }
  }, [uid, attempt])

  const retry = useCallback(() => {
    setState(INITIAL_STATE)
    setAttempt((current) => current + 1)
  }, [])

  return { notes: state.notes, status: state.status, error: state.error, retry }
}
