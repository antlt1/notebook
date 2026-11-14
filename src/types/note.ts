import type { Timestamp } from 'firebase/firestore'

export interface NoteTab {
  id: string
  name: string
  value: string
  order: number
}

export interface Note {
  id: string
  userId: string
  title: string
  tabs: NoteTab[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const MAX_TABS_PER_NOTE = 30
export const MAX_TITLE_LENGTH = 200
export const MAX_TAB_NAME_LENGTH = 50
