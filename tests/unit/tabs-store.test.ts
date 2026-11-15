import { describe, expect, it, vi } from 'vitest'
import { createTabsStore } from '@/features/notes/tabs/tabsStore'
import type { NoteTab } from '@/types/note'

function tab(id: string, name: string, order: number, value = ''): NoteTab {
  return { id, name, value, order }
}

const INITIAL: NoteTab[] = [tab('a', 'Tab 1', 0), tab('b', 'Tab 2', 1)]

describe('tabsStore', () => {
  it('giữ nguyên tham chiếu khi không có thay đổi (useSyncExternalStore cần)', () => {
    const store = createTabsStore(INITIAL)
    const snapshot = store.getSnapshot()
    const listener = vi.fn()
    store.subscribe(listener)

    store.applyServer([...INITIAL])
    store.update((tabs) => tabs)

    expect(store.getSnapshot()).toBe(snapshot)
    expect(listener).not.toHaveBeenCalled()
  })

  it('update trả mảng mới, chuẩn hoá order và thông báo cho subscriber', () => {
    const store = createTabsStore(INITIAL)
    const listener = vi.fn()
    store.subscribe(listener)

    const next = store.update((tabs) => [...tabs, tab('c', 'Tab 3', 9)])

    expect(next.map((item) => item.order)).toEqual([0, 1, 2])
    expect(store.getSnapshot()).toBe(next)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('applyServer thay snapshot khi dữ liệu Firestore khác bản cục bộ', () => {
    const store = createTabsStore(INITIAL)
    const listener = vi.fn()
    store.subscribe(listener)

    store.applyServer([tab('a', 'Tab 1', 0, 'nội dung mới'), tab('b', 'Tab 2', 1)])

    expect(store.getSnapshot()[0].value).toBe('nội dung mới')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('unsubscribe dừng nhận thông báo', () => {
    const store = createTabsStore(INITIAL)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    unsubscribe()

    store.update((tabs) => [...tabs, tab('c', 'Tab 3', 2)])

    expect(listener).not.toHaveBeenCalled()
  })
})
