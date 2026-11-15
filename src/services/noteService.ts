import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { MAX_TABS, MAX_TITLE_LENGTH } from '@/lib/noteLimits'
import type { Note, NoteTab } from '@/types/note'

export const DEFAULT_TITLE = 'Ghi chú mới'
export { MAX_TAB_NAME_LENGTH, MAX_TABS, MAX_TITLE_LENGTH } from '@/lib/noteLimits'

const NOTES_COLLECTION = 'notes'

export function createEmptyTab(): NoteTab {
  return { id: crypto.randomUUID(), name: 'Tab 1', value: '', order: 0 }
}

function notesRef() {
  return collection(db, NOTES_COLLECTION)
}

function noteRef(noteId: string) {
  return doc(db, NOTES_COLLECTION, noteId)
}

function toNote(snapshot: QueryDocumentSnapshot<DocumentData>): Note {
  return { id: snapshot.id, ...(snapshot.data() as Omit<Note, 'id'>) }
}

/**
 * Realtime list of the signed-in user's notes. The `where('userId')` clause is
 * mandatory: the read rule only authorizes queries scoped to the owner.
 */
export function subscribeNotes(
  uid: string,
  onData: (notes: Note[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const notesQuery = query(notesRef(), where('userId', '==', uid), orderBy('updatedAt', 'desc'))

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      onData(snapshot.docs.map(toNote))
    },
    onError,
  )
}

export async function createNote(uid: string, title: string = DEFAULT_TITLE): Promise<string> {
  const trimmed = title.trim() || DEFAULT_TITLE

  const created = await addDoc(notesRef(), {
    userId: uid,
    title: trimmed.slice(0, MAX_TITLE_LENGTH),
    tabs: [createEmptyTab()],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return created.id
}

export async function renameNote(noteId: string, title: string): Promise<void> {
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    throw new Error('Tiêu đề không được để trống')
  }

  await updateDoc(noteRef(noteId), {
    title: trimmed.slice(0, MAX_TITLE_LENGTH),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Ghi nội dung của mọi tab. Phase 4 chỉ sửa một tab nhưng schema lưu cả mảng
 * `tabs[]` (Q6) nên vẫn update nguyên mảng + `updatedAt` để sidebar sắp xếp lại.
 */
export async function saveTabs(noteId: string, tabs: NoteTab[]): Promise<void> {
  if (tabs.length === 0 || tabs.length > MAX_TABS) {
    throw new Error('Số lượng tab không hợp lệ')
  }

  await updateDoc(noteRef(noteId), {
    tabs,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteDoc(noteRef(noteId))
}
