import { useCallback, useEffect, useRef, useState } from 'react'
import { saveTabs } from '@/services/noteService'
import type { NoteTab } from '@/types/note'
import { mapFirestoreError } from '@/utils/firebaseErrors'

/** Mục 7.5: ghi sau ~1000 ms kể từ lần sửa cuối. */
export const AUTOSAVE_DELAY = 1000

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseAutosaveResult {
  status: AutosaveStatus
  savedAt: Date | null
  error: string | null
  /** Đưa bản `tabs` mới vào hàng đợi, ghi sau `delay` ms. */
  queue: (tabs: NoteTab[]) => void
  /** Ghi ngay: blur, Ctrl/Cmd+S, chuyển tab, rời trang. */
  flush: () => void
  /** Ghi lại nội dung còn kẹt sau lỗi. */
  retry: () => void
}

/**
 * Debounce ghi Firestore cho nội dung tab.
 *
 * Nguyên tắc (Mục 7.5): nội dung chưa ghi được giữ lại trong `pendingRef` và
 * không bao giờ bị bỏ âm thầm — kể cả khi lỗi, khi unmount hay khi đổi note.
 */
export function useAutosave(
  noteId: string | null,
  delay: number = AUTOSAVE_DELAY,
): UseAutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pendingRef = useRef<NoteTab[] | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runningRef = useRef(false)
  const mountedRef = useRef(true)
  const noteIdRef = useRef(noteId)
  // `run` được gọi từ timer/`schedule`, nên cần một ref thay vì tham chiếu vòng.
  const runRef = useRef<() => void>(() => {})

  useEffect(() => {
    noteIdRef.current = noteId
  }, [noteId])

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) {
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const schedule = useCallback(
    (wait: number) => {
      clearTimer()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        runRef.current()
      }, wait)
    },
    [clearTimer],
  )

  const run = useCallback(async () => {
    clearTimer()

    const currentNoteId = noteIdRef.current
    const tabs = pendingRef.current
    // Một lần ghi đang chạy thì để nó xong: nội dung mới vẫn nằm trong pending.
    if (currentNoteId === null || tabs === null || runningRef.current) {
      return
    }

    pendingRef.current = null
    runningRef.current = true
    setStatus('saving')
    setError(null)

    try {
      await saveTabs(currentNoteId, tabs)
      runningRef.current = false
      if (!mountedRef.current) {
        return
      }

      if (pendingRef.current !== null) {
        // Có thay đổi mới trong lúc đang ghi → ghi tiếp sau đúng một nhịp debounce.
        schedule(delay)
        return
      }

      setStatus('saved')
      setSavedAt(new Date())
    } catch (saveError) {
      runningRef.current = false
      if (!mountedRef.current) {
        return
      }
      // Giữ lại bản chưa ghi để người dùng bấm "Thử lại" hoặc gõ tiếp.
      pendingRef.current ??= tabs
      setStatus('error')
      setError(mapFirestoreError(saveError))
    }
  }, [clearTimer, delay, schedule])

  useEffect(() => {
    runRef.current = () => {
      void run()
    }
  }, [run])

  const queue = useCallback(
    (tabs: NoteTab[]) => {
      pendingRef.current = tabs
      setError(null)
      setStatus('saving')
      // Đang ghi thì không hẹn giờ mới: `run` tự lên lịch sau khi xong.
      if (!runningRef.current) {
        schedule(delay)
      }
    },
    [delay, schedule],
  )

  const flush = useCallback(() => {
    if (pendingRef.current === null || runningRef.current) {
      clearTimer()
      return
    }
    schedule(0)
  }, [clearTimer, schedule])

  const retry = useCallback(() => {
    if (runningRef.current) {
      return
    }
    schedule(0)
  }, [schedule])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      clearTimer()
      // Best-effort khi unmount/đổi note: vẫn đẩy nội dung cuối lên Firestore.
      const currentNoteId = noteIdRef.current
      const tabs = pendingRef.current
      pendingRef.current = null
      if (currentNoteId !== null && tabs !== null) {
        void saveTabs(currentNoteId, tabs).catch(() => {
          // Đổi note/đóng app là lúc không còn báo lỗi cho người dùng được nữa.
        })
      }
    }
  }, [clearTimer])

  useEffect(() => {
    function handleBeforeUnload() {
      const currentNoteId = noteIdRef.current
      const tabs = pendingRef.current
      if (currentNoteId === null || tabs === null) {
        return
      }
      // Firestore (persistent cache) sẽ hoàn tất ghi khi trình duyệt còn mở;
      // đây chỉ là nỗ lực cuối, không đảm bảo tuyệt đối.
      void saveTabs(currentNoteId, tabs).catch(() => {})
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return { status, savedAt, error, queue, flush, retry }
}
