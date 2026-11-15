import type { NoteTab } from '@/types/note'
import { normalizeOrders, tabsEqual } from './tabs'

/**
 * Nguồn dữ liệu tab cho một note đang mở.
 *
 * Vì sao cần store ngoài React: nội dung tab vừa do người dùng sửa (state cục bộ)
 * vừa do `onSnapshot` từ thiết bị khác đẩy về. Giữ nó trong một store nhỏ cho phép
 * `useSyncExternalStore` đọc mà không phải `setState` trong effect (rule
 * `react-hooks` v7 cấm) và gộp mọi thay đổi vào **một** mảng để autosave chỉ ghi
 * một lần (tránh ghi đè chéo giữa nội dung và tên tab).
 */
export interface TabsStore {
  getSnapshot: () => NoteTab[]
  subscribe: (listener: () => void) => () => void
  /**
   * Nhận bản từ Firestore. Chỉ nên gọi khi máy này không có thay đổi chờ ghi
   * (xem `NoteWorkspace`), nếu không sẽ đè mất chữ đang gõ.
   */
  applyServer: (tabs: NoteTab[]) => void
  /** Sửa cục bộ; trả về mảng mới để caller đưa vào autosave. */
  update: (updater: (tabs: NoteTab[]) => NoteTab[]) => NoteTab[]
}

export function createTabsStore(initialTabs: NoteTab[]): TabsStore {
  let tabs = normalizeOrders(initialTabs)
  const listeners = new Set<() => void>()

  function notify() {
    for (const listener of listeners) {
      listener()
    }
  }

  function replace(next: NoteTab[]) {
    const normalized = normalizeOrders(next)
    if (tabsEqual(tabs, normalized)) {
      return false
    }
    tabs = normalized
    notify()
    return true
  }

  return {
    getSnapshot: () => tabs,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    applyServer: (next) => {
      replace(next)
    },
    update: (updater) => {
      replace(updater(tabs))
      return tabs
    },
  }
}
