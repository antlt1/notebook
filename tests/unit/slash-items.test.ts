import { describe, expect, it } from 'vitest'
import { filterSlashItems, SLASH_ITEMS } from '@/features/notes/editor/slashItems'

function idsFor(query: string): string[] {
  return filterSlashItems(query).map((item) => item.id)
}

describe('menu / (slash command)', () => {
  it('hiện toàn bộ khối khi chưa gõ gì', () => {
    expect(filterSlashItems('')).toHaveLength(SLASH_ITEMS.length)
  })

  it('tìm được heading khi gõ không dấu', () => {
    expect(idsFor('tieu de 3')).toEqual(['heading-3'])
  })

  it('tìm checklist bằng từ khoá tiếng Việt và tiếng Anh', () => {
    expect(idsFor('viec')).toContain('task-list')
    expect(idsFor('todo')).toContain('task-list')
  })

  it('trả về rỗng khi không khớp khối nào', () => {
    expect(idsFor('zzz-khong-co')).toEqual([])
  })
})
