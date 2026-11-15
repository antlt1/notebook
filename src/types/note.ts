import type { Timestamp } from 'firebase/firestore'

/** Một tab trong ghi chú. `value` là nội dung Markdown của riêng tab đó (Q4, Q5). */
export interface NoteTab {
  id: string
  name: string
  value: string
  order: number
}

/** Document `notes/{noteId}` — `id` là Document ID nên không lưu thành field. */
export interface Note {
  id: string
  userId: string
  title: string
  tabs: NoteTab[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
