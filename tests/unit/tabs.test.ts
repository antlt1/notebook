import { describe, expect, it } from 'vitest'
import {
  addTab,
  createTab,
  estimateTabsBytes,
  moveTab,
  nextTabName,
  normalizeOrders,
  pickTabId,
  removeTab,
  renameTab,
  tabsEqual,
} from '@/features/notes/tabs/tabs'
import { MAX_TAB_NAME_LENGTH, MAX_TABS } from '@/lib/noteLimits'
import type { NoteTab } from '@/types/note'

function tab(id: string, name: string, order: number, value = ''): NoteTab {
  return { id, name, value, order }
}

const TABS: NoteTab[] = [tab('a', 'Tab 1', 0, '# Một'), tab('b', 'Tab 2', 1), tab('c', 'Tab 3', 2)]

describe('tabs helpers', () => {
  it('sắp xếp theo order và đánh lại 0..n-1', () => {
    const shuffled = [tab('c', 'Tab 3', 7), tab('a', 'Tab 1', 3), tab('b', 'Tab 2', 5)]

    expect(normalizeOrders(shuffled).map((item) => [item.id, item.order])).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ])
  })

  it('chọn tab đầu tiên khi ?tab= thiếu hoặc trỏ vào tab không tồn tại', () => {
    expect(pickTabId(TABS, null)).toBe('a')
    expect(pickTabId(TABS, 'deleted')).toBe('a')
    expect(pickTabId(TABS, 'c')).toBe('c')
    expect(pickTabId([], 'a')).toBeNull()
  })

  it('đặt tên tab mới tránh trùng tên đang dùng', () => {
    expect(nextTabName([])).toBe('Tab 1')
    expect(nextTabName([tab('a', 'Tab 1', 0)])).toBe('Tab 2')
    expect(
      nextTabName([tab('a', 'Tab 1', 0), tab('b', 'Tab 3', 1), tab('c', 'Tab 4', 2)]),
    ).toBe('Tab 5')
  })

  it('thêm tab vào cuối và không vượt MAX_TABS', () => {
    const created = createTab(TABS, 'new')
    const next = addTab(TABS, created)

    expect(created).toEqual({ id: 'new', name: 'Tab 4', value: '', order: 3 })
    expect(next.map((item) => item.id)).toEqual(['a', 'b', 'c', 'new'])

    const full = Array.from({ length: MAX_TABS }, (_, index) => tab(`t${index}`, `Tab`, index))
    expect(addTab(full, tab('overflow', 'Tab', MAX_TABS))).toBe(full)
  })

  it('đổi tên: trim, cắt quá dài, bỏ qua tên rỗng', () => {
    expect(renameTab(TABS, 'a', '  Ý tưởng  ')[0].name).toBe('Ý tưởng')
    expect(renameTab(TABS, 'a', 'x'.repeat(MAX_TAB_NAME_LENGTH + 10))[0].name).toHaveLength(
      MAX_TAB_NAME_LENGTH,
    )
    expect(renameTab(TABS, 'a', '   ')).toBe(TABS)
  })

  it('xoá tab và đánh lại order, luôn giữ tab cuối cùng', () => {
    const afterDelete = removeTab(TABS, 'b')
    expect(afterDelete.map((item) => [item.id, item.order])).toEqual([
      ['a', 0],
      ['c', 1],
    ])

    const onlyOne = [tab('a', 'Tab 1', 0)]
    expect(removeTab(onlyOne, 'a')).toBe(onlyOne)
  })

  it('kéo tab tới vị trí mới rồi đánh lại order', () => {
    expect(moveTab(TABS, 'c', 'a').map((item) => item.id)).toEqual(['c', 'a', 'b'])
    expect(moveTab(TABS, 'a', 'c').map((item) => item.id)).toEqual(['b', 'c', 'a'])
    expect(moveTab(TABS, 'a', 'a')).toBe(TABS)
    expect(moveTab(TABS, 'a', 'missing')).toBe(TABS)
  })

  it('so sánh nội dung hai mảng tab', () => {
    expect(tabsEqual(TABS, [...TABS])).toBe(true)
    expect(tabsEqual(TABS, TABS.slice(1))).toBe(false)
    expect(tabsEqual(TABS, [{ ...TABS[0], value: 'khác' }, TABS[1], TABS[2]])).toBe(false)
  })

  it('ước lượng dung lượng tăng theo nội dung', () => {
    const small = estimateTabsBytes([tab('a', 'Tab 1', 0)])
    const large = estimateTabsBytes([tab('a', 'Tab 1', 0, 'x'.repeat(10_000))])

    expect(small).toBeGreaterThan(0)
    expect(large).toBeGreaterThan(small + 9_000)
  })
})
