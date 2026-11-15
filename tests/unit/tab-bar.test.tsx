import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TabBar } from '@/features/notes/tabs/TabBar'
import type { NoteTab } from '@/types/note'

const TABS: NoteTab[] = [
  { id: 'a', name: 'Tab 1', value: '# Một', order: 0 },
  { id: 'b', name: 'Tab 2', value: '', order: 1 },
]

function setup(overrides: Partial<ComponentProps<typeof TabBar>> = {}) {
  const props = {
    tabs: TABS,
    activeTabId: 'a',
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
    onReorder: vi.fn(),
    ...overrides,
  }

  render(<TabBar {...props} />)
  return props
}

describe('TabBar', () => {
  it('hiện mọi tab và đánh dấu tab đang mở', () => {
    setup()

    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'false')
  })

  it('bấm vào tab gọi onSelect', async () => {
    const user = userEvent.setup()
    const props = setup()

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    expect(props.onSelect).toHaveBeenCalledWith('b')
  })

  it('double-click để đổi tên, Enter để lưu', async () => {
    const user = userEvent.setup()
    const props = setup()

    await user.dblClick(screen.getByRole('tab', { name: 'Tab 2' }))
    const input = screen.getByRole('textbox', { name: 'Đổi tên tab Tab 2' })
    await user.clear(input)
    await user.type(input, 'Ý tưởng{Enter}')

    expect(props.onRename).toHaveBeenCalledWith('b', 'Ý tưởng')
  })

  it('Escape huỷ đổi tên, không ghi tên mới', async () => {
    const user = userEvent.setup()
    const props = setup()

    await user.dblClick(screen.getByRole('tab', { name: 'Tab 2' }))
    const input = screen.getByRole('textbox', { name: 'Đổi tên tab Tab 2' })
    await user.clear(input)
    await user.type(input, 'Không lưu{Escape}')

    expect(props.onRename).not.toHaveBeenCalled()
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
  })

  it('nút ＋ gọi onAdd', async () => {
    const user = userEvent.setup()
    const props = setup()

    await user.click(screen.getByRole('button', { name: 'Thêm tab' }))

    expect(props.onAdd).toHaveBeenCalledTimes(1)
  })

  it('xoá tab phải xác nhận trong hộp thoại', async () => {
    const user = userEvent.setup()
    const props = setup()

    await user.click(screen.getByRole('button', { name: 'Xoá tab Tab 2' }))
    expect(screen.getByRole('heading', { name: 'Xoá tab?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xoá tab' }))

    expect(props.onDelete).toHaveBeenCalledWith('b')
  })

  it('không cho xoá tab cuối cùng', () => {
    setup({ tabs: [TABS[0]], activeTabId: 'a' })

    expect(screen.getByRole('button', { name: 'Xoá tab Tab 1' })).toBeDisabled()
  })

  it('dùng phím mũi tên để chuyển tab', async () => {
    const user = userEvent.setup()
    const props = setup()

    await user.click(screen.getByRole('tab', { name: 'Tab 1' }))
    await user.keyboard('{ArrowRight}')

    expect(props.onSelect).toHaveBeenCalledWith('b')
  })
})
