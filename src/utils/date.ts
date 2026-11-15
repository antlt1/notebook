import type { Timestamp } from 'firebase/firestore'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * `updatedAt` can still be `null` right after a write while `serverTimestamp()`
 * is pending, so the value is treated as optional.
 */
export function formatRelativeTime(value: Timestamp | null | undefined): string {
  const date = value?.toDate()
  if (date === undefined) {
    return 'Vừa xong'
  }

  const elapsed = Date.now() - date.getTime()
  if (elapsed < MINUTE) {
    return 'Vừa xong'
  }
  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)} phút trước`
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)} giờ trước`
  }

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
