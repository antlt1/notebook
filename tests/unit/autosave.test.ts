import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTOSAVE_DELAY, useAutosave } from '@/features/notes/hooks/useAutosave'
import type { NoteTab } from '@/types/note'

const { saveTabsMock } = vi.hoisted(() => ({ saveTabsMock: vi.fn() }))

vi.mock('@/services/noteService', () => ({
  saveTabs: saveTabsMock,
}))

function tabsWith(value: string): NoteTab[] {
  return [{ id: 'tab-1', name: 'Tab 1', value, order: 0 }]
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    saveTabsMock.mockReset()
    saveTabsMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('gộp nhiều lần gõ liên tiếp thành một lần ghi sau debounce', async () => {
    const { result } = renderHook(() => useAutosave('note-1'))

    act(() => {
      result.current.queue(tabsWith('a'))
      result.current.queue(tabsWith('ab'))
      result.current.queue(tabsWith('abc'))
    })
    expect(result.current.status).toBe('saving')

    await advance(AUTOSAVE_DELAY - 1)
    expect(saveTabsMock).not.toHaveBeenCalled()

    await advance(1)
    expect(saveTabsMock).toHaveBeenCalledTimes(1)
    expect(saveTabsMock).toHaveBeenCalledWith('note-1', tabsWith('abc'))
    expect(result.current.status).toBe('saved')
    expect(result.current.savedAt).toBeInstanceOf(Date)
  })

  it('flush ghi ngay, không chờ hết debounce', async () => {
    const { result } = renderHook(() => useAutosave('note-1'))

    act(() => {
      result.current.queue(tabsWith('nội dung'))
      result.current.flush()
    })

    await advance(0)
    expect(saveTabsMock).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('saved')
  })

  it('giữ nội dung chưa ghi khi lỗi và ghi lại được bằng retry', async () => {
    saveTabsMock.mockRejectedValueOnce(
      Object.assign(new Error('permission'), { code: 'permission-denied' }),
    )

    const { result } = renderHook(() => useAutosave('note-1'))

    act(() => {
      result.current.queue(tabsWith('chưa ghi được'))
    })
    await advance(AUTOSAVE_DELAY)

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Bạn không có quyền với ghi chú này')

    await act(async () => {
      result.current.retry()
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(saveTabsMock).toHaveBeenCalledTimes(2)
    expect(saveTabsMock).toHaveBeenLastCalledWith('note-1', tabsWith('chưa ghi được'))
    expect(result.current.status).toBe('saved')
    expect(result.current.error).toBeNull()
  })

  it('ghi tiếp khi có thay đổi mới trong lúc đang ghi', async () => {
    let resolveFirst: (() => void) | undefined
    saveTabsMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve
        }),
    )

    const { result } = renderHook(() => useAutosave('note-1'))

    act(() => {
      result.current.queue(tabsWith('lần 1'))
    })
    await advance(AUTOSAVE_DELAY)
    expect(saveTabsMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.queue(tabsWith('lần 2'))
      resolveFirst?.()
      await Promise.resolve()
    })

    await advance(AUTOSAVE_DELAY)
    expect(saveTabsMock).toHaveBeenCalledTimes(2)
    expect(saveTabsMock).toHaveBeenLastCalledWith('note-1', tabsWith('lần 2'))
    expect(result.current.status).toBe('saved')
  })

  it('không ghi khi chưa biết note (noteId null)', async () => {
    const { result } = renderHook(() => useAutosave(null))

    act(() => {
      result.current.queue(tabsWith('x'))
    })
    await advance(AUTOSAVE_DELAY * 2)

    expect(saveTabsMock).not.toHaveBeenCalled()
  })
})
