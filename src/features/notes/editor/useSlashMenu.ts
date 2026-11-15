import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { filterSlashItems, type SlashItem } from './slashItems'

interface SlashMenuState {
  query: string
  range: { from: number; to: number }
  /** Toạ độ viewport — panel render bằng `position: fixed`. */
  position: { top: number; left: number }
  activeIndex: number
}

/** Cầu nối để editor (tạo trước hook) gọi được menu mà không cần import vòng. */
export interface SlashBridge {
  sync: (editor: Editor) => void
  onKeyDown: (event: KeyboardEvent) => boolean
}

export interface UseSlashMenuResult {
  isOpen: boolean
  items: SlashItem[]
  activeIndex: number
  position: { top: number; left: number } | null
  setActiveIndex: (index: number) => void
  select: (item: SlashItem) => void
  close: () => void
}

/** `/` + tối đa một từ ngay trước con trỏ. */
const SLASH_PATTERN = /\/([\p{L}\p{N}]*)$/u

function readSlashState(editor: Editor): Omit<SlashMenuState, 'activeIndex'> | null {
  const { selection } = editor.state
  if (!selection.empty) {
    return null
  }

  const { $from } = selection
  if (!$from.parent.isTextblock) {
    return null
  }

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\n', '\n')
  const match = SLASH_PATTERN.exec(textBefore)
  if (match === null) {
    return null
  }

  // Chỉ mở khi `/` đứng đầu khối hoặc sau khoảng trắng (tránh bắt nhầm URL).
  const startOffset = textBefore.length - match[0].length
  const charBefore = startOffset === 0 ? '' : textBefore[startOffset - 1]
  if (charBefore !== '' && charBefore !== ' ') {
    return null
  }

  const from = $from.start() + startOffset
  try {
    const coords = editor.view.coordsAtPos(from)
    return {
      query: match[1],
      range: { from, to: from + match[0].length },
      position: { top: coords.bottom + 4, left: coords.left },
    }
  } catch {
    // `coordsAtPos` ném lỗi khi vị trí không còn render được (hiếm) — bỏ qua menu.
    return null
  }
}

export function useSlashMenu(
  editor: Editor | null,
  bridgeRef: { current: SlashBridge | null },
): UseSlashMenuResult {
  const [state, setState] = useState<SlashMenuState | null>(null)
  const stateRef = useRef<SlashMenuState | null>(null)

  const items = useMemo(() => filterSlashItems(state?.query ?? ''), [state?.query])
  const itemsRef = useRef<SlashItem[]>(items)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const close = useCallback(() => {
    stateRef.current = null
    setState(null)
  }, [])

  const moveActive = useCallback((delta: number) => {
    setState((previous) => {
      if (previous === null) {
        return previous
      }
      const count = filterSlashItems(previous.query).length
      if (count === 0) {
        return previous
      }
      return { ...previous, activeIndex: (previous.activeIndex + delta + count) % count }
    })
  }, [])

  const select = useCallback(
    (item: SlashItem) => {
      const current = stateRef.current
      close()
      if (editor === null || current === null) {
        return
      }

      // Xoá `/query` rồi mới áp khối, để dấu `/` không dính vào nội dung.
      editor.chain().focus().deleteRange(current.range).run()
      item.run(editor)
    },
    [close, editor],
  )

  useEffect(() => {
    if (editor === null) {
      bridgeRef.current = null
      return
    }

    bridgeRef.current = {
      sync: (target) => {
        const next = readSlashState(target)
        setState((previous) => {
          if (next === null) {
            return null
          }
          // Giữ vị trí đang chọn khi con trỏ chỉ dịch trong cùng một từ khoá.
          if (previous !== null && previous.query === next.query) {
            return { ...next, activeIndex: previous.activeIndex }
          }
          return { ...next, activeIndex: 0 }
        })
      },
      onKeyDown: (event) => {
        if (stateRef.current === null) {
          return false
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          moveActive(1)
          return true
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          moveActive(-1)
          return true
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          const item = itemsRef.current[stateRef.current.activeIndex]
          if (item === undefined) {
            return false
          }
          event.preventDefault()
          select(item)
          return true
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          close()
          return true
        }

        return false
      },
    }

    return () => {
      bridgeRef.current = null
    }
  }, [bridgeRef, close, editor, moveActive, select])

  const setActiveIndex = useCallback((index: number) => {
    setState((previous) => (previous === null ? previous : { ...previous, activeIndex: index }))
  }, [])

  const isOpen = state !== null

  // Panel dùng toạ độ viewport nên cuộn trang sẽ làm lệch — đóng menu thay vì bám theo.
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleScroll = () => close()
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [close, isOpen])

  return {
    isOpen,
    items,
    activeIndex: state?.activeIndex ?? 0,
    position: state?.position ?? null,
    setActiveIndex,
    select,
    close,
  }
}
