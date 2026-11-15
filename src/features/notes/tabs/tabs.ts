import { MAX_TAB_NAME_LENGTH, MAX_TABS } from '@/lib/noteLimits'
import type { NoteTab } from '@/types/note'

/** Tab theo đúng thứ tự hiển thị (`order` tăng dần). */
export function sortTabs(tabs: NoteTab[]): NoteTab[] {
  return [...tabs].sort((a, b) => a.order - b.order)
}

/** Đánh lại `order` = 0..n-1 theo đúng thứ tự mảng (không sắp xếp lại). */
function reindex(tabs: NoteTab[]): NoteTab[] {
  return tabs.map((tab, index) => (tab.order === index ? tab : { ...tab, order: index }))
}

/** Sắp xếp theo `order` rồi đánh lại 0..n-1 (dùng cho dữ liệu mới từ Firestore). */
export function normalizeOrders(tabs: NoteTab[]): NoteTab[] {
  return reindex(sortTabs(tabs))
}

export function findTab(tabs: NoteTab[], tabId: string | null): NoteTab | null {
  if (tabId === null) {
    return null
  }
  return tabs.find((tab) => tab.id === tabId) ?? null
}

/**
 * Tab sẽ mở: ưu tiên `?tab=` nếu còn tồn tại, ngược lại tab đầu tiên. Trả `null`
 * khi note không có tab nào (dữ liệu hỏng) để UI hiện trạng thái lỗi thay vì crash.
 */
export function pickTabId(tabs: NoteTab[], requestedId: string | null): string | null {
  const sorted = sortTabs(tabs)
  if (requestedId !== null && sorted.some((tab) => tab.id === requestedId)) {
    return requestedId
  }
  return sorted[0]?.id ?? null
}

/** Tên mặc định "Tab N", bỏ qua số đã dùng để không trùng tên. */
export function nextTabName(tabs: NoteTab[]): string {
  const used = new Set(tabs.map((tab) => tab.name.trim().toLowerCase()))
  let index = tabs.length + 1
  while (used.has(`tab ${index}`)) {
    index += 1
  }
  return `Tab ${index}`
}

export function createTab(tabs: NoteTab[], id: string = crypto.randomUUID()): NoteTab {
  return { id, name: nextTabName(tabs), value: '', order: tabs.length }
}

/** Thêm tab mới vào cuối; vượt `MAX_TABS` thì trả nguyên mảng cũ (UI đã chặn nút). */
export function addTab(tabs: NoteTab[], tab: NoteTab): NoteTab[] {
  if (tabs.length >= MAX_TABS) {
    return tabs
  }
  const ordered = normalizeOrders(tabs)
  return reindex([...ordered, { ...tab, order: ordered.length }])
}

/**
 * Đổi tên tab. Tên rỗng hoặc chỉ khoảng trắng thì giữ nguyên tên cũ; dài quá
 * `MAX_TAB_NAME_LENGTH` thì cắt bớt (khớp `firestore.rules`).
 */
export function renameTab(tabs: NoteTab[], tabId: string, name: string): NoteTab[] {
  const trimmed = name.trim().slice(0, MAX_TAB_NAME_LENGTH)
  if (trimmed.length === 0) {
    return tabs
  }
  return tabs.map((tab) => (tab.id === tabId ? { ...tab, name: trimmed } : tab))
}

/** Xoá tab; luôn giữ lại ít nhất một tab (Mục 5.2). */
export function removeTab(tabs: NoteTab[], tabId: string): NoteTab[] {
  if (tabs.length <= 1) {
    return tabs
  }
  return reindex(normalizeOrders(tabs).filter((tab) => tab.id !== tabId))
}

/** Kéo tab `activeId` tới vị trí của `overId` rồi đánh lại `order`. */
export function moveTab(tabs: NoteTab[], activeId: string, overId: string): NoteTab[] {
  if (activeId === overId) {
    return tabs
  }

  const sorted = normalizeOrders(tabs)
  const from = sorted.findIndex((tab) => tab.id === activeId)
  const to = sorted.findIndex((tab) => tab.id === overId)
  if (from === -1 || to === -1) {
    return tabs
  }

  const next = [...sorted]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return reindex(next)
}

/** Hai mảng tab có cùng nội dung? Dùng để bỏ qua cập nhật không cần thiết. */
export function tabsEqual(a: NoteTab[], b: NoteTab[]): boolean {
  if (a.length !== b.length) {
    return false
  }
  return a.every((tab, index) => {
    const other = b[index]
    return (
      tab.id === other.id &&
      tab.name === other.name &&
      tab.value === other.value &&
      tab.order === other.order
    )
  })
}

/** Dung lượng thô của `tabs[]` (UTF-8) — Mục 5.3 cảnh báo khi gần 1 MiB. */
export function estimateTabsBytes(tabs: NoteTab[]): number {
  return new TextEncoder().encode(JSON.stringify(tabs)).length
}
