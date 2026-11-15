import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Timestamp } from 'firebase/firestore'
import { formatRelativeTime } from '@/utils/date'
import { mapFirestoreError } from '@/utils/firebaseErrors'

const NOW = new Date('2026-11-15T12:00:00+07:00')

function timestampFrom(date: Date): Timestamp {
  return { toDate: () => date } as unknown as Timestamp
}

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('treats a pending serverTimestamp as just now', () => {
    expect(formatRelativeTime(null)).toBe('Vừa xong')
    expect(formatRelativeTime(undefined)).toBe('Vừa xong')
  })

  it('formats recent updates in minutes and hours', () => {
    expect(formatRelativeTime(timestampFrom(new Date(NOW.getTime() - 5 * 60 * 1000)))).toBe(
      '5 phút trước',
    )
    expect(formatRelativeTime(timestampFrom(new Date(NOW.getTime() - 3 * 60 * 60 * 1000)))).toBe(
      '3 giờ trước',
    )
  })

  it('falls back to a date for anything older than a day', () => {
    expect(formatRelativeTime(timestampFrom(new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000)))).toBe(
      new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    )
  })
})

describe('mapFirestoreError', () => {
  it('translates known Firestore codes', () => {
    expect(mapFirestoreError({ code: 'permission-denied' })).toBe('Bạn không có quyền với ghi chú này')
    expect(mapFirestoreError({ code: 'unavailable' })).toBe('Mất kết nối, đang thử lại…')
  })

  it('falls back for unknown Firestore codes', () => {
    expect(mapFirestoreError({ code: 'some/new-code' })).toBe('Đã có lỗi xảy ra, vui lòng thử lại')
  })

  it('keeps app-level validation messages', () => {
    expect(mapFirestoreError(new Error('Tiêu đề không được để trống'))).toBe(
      'Tiêu đề không được để trống',
    )
  })
})
