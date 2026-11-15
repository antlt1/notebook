import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import type { Note } from '@/types/note'
import { useAutosave } from '../hooks/useAutosave'
import { createEditorExtensions } from './extensions'
import { SaveStatus } from './SaveStatus'
import { SlashMenu } from './SlashMenu'
import { Toolbar } from './Toolbar'
import { useSlashMenu, type SlashBridge } from './useSlashMenu'

interface NoteEditorProps {
  note: Note
}

interface TextStats {
  words: number
  chars: number
}

const EMPTY_STATS: TextStats = { words: 0, chars: 0 }

function readStats(editor: Editor): TextStats {
  const text = editor.getText().trim()
  return {
    words: text.length === 0 ? 0 : text.split(/\s+/u).length,
    chars: text.length,
  }
}

/** Tab đang sửa: Phase 4 chỉ dùng tab đầu tiên (tab bar là Phase 5). */
function pickActiveTab(note: Note) {
  return [...note.tabs].sort((a, b) => a.order - b.order)[0] ?? null
}

/**
 * Editor của một tab: Tiptap + Markdown (Q4), autosave debounce (Mục 7.5),
 * toolbar, menu `/` và đồng bộ realtime từ thiết bị khác.
 */
export function NoteEditor({ note }: NoteEditorProps) {
  const [activeTab] = useState(() => pickActiveTab(note))

  const autosave = useAutosave(note.id)
  const { flush } = autosave
  const slashBridgeRef = useRef<SlashBridge | null>(null)
  // Bản `tabs` mới nhất do máy này sửa (khác với `note.tabs` do server trả về).
  const tabsRef = useRef(note.tabs)
  const lastMarkdownRef = useRef(activeTab?.value ?? '')

  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: activeTab?.value ?? '',
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: 'tiptap',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Nội dung ghi chú',
      },
      // Menu `/` cần chặn phím trước khi ProseMirror xử lý (Enter, mũi tên, Esc).
      handleKeyDown: (_view, event) => slashBridgeRef.current?.onKeyDown(event) ?? false,
    },
    onUpdate: ({ editor: current }) => {
      slashBridgeRef.current?.sync(current)

      const markdown = current.getMarkdown()
      if (markdown === lastMarkdownRef.current) {
        return
      }
      lastMarkdownRef.current = markdown

      if (activeTab !== null) {
        tabsRef.current = tabsRef.current.map((tab) =>
          tab.id === activeTab.id ? { ...tab, value: markdown } : tab,
        )
        autosave.queue(tabsRef.current)
      }
    },
    onSelectionUpdate: ({ editor: current }) => slashBridgeRef.current?.sync(current),
    onBlur: () => flush(),
  })

  const slash = useSlashMenu(editor, slashBridgeRef)

  // Đếm từ/ký tự theo transaction của editor thay vì lưu thêm state.
  const stats = useEditorState({
    editor,
    selector: ({ editor: current }) => (current === null ? EMPTY_STATS : readStats(current)),
  })
  const textStats = stats ?? EMPTY_STATS

  const activeTabValue = note.tabs.find((tab) => tab.id === activeTab?.id)?.value ?? ''
  const saveStatus = autosave.status

  // Đồng bộ nội dung từ thiết bị khác. Bỏ qua khi máy này đang có thay đổi chưa
  // ghi để không làm nhảy con trỏ / mất chữ đang gõ (Mục 7.5).
  useEffect(() => {
    if (editor === null || saveStatus === 'saving' || saveStatus === 'error') {
      return
    }

    if (activeTabValue !== editor.getMarkdown()) {
      editor.commands.setContent(activeTabValue, { contentType: 'markdown', emitUpdate: false })
      lastMarkdownRef.current = activeTabValue
    }
    // Các tab khác lấy theo server; tab đang sửa sẽ được ghi đè ở lần gõ kế tiếp.
    tabsRef.current = note.tabs
  }, [activeTabValue, editor, note.tabs, saveStatus])

  // Ctrl/Cmd+S = lưu ngay (Mục 7.1); ẩn tab (điện thoại) cũng cố gắng ghi nốt.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        flush()
      }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flush()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [flush])

  if (editor === null) {
    return <div className="h-64 animate-pulse rounded-xl border bg-muted/40" aria-hidden="true" />
  }

  return (
    <div className="note-editor overflow-hidden rounded-xl border bg-card">
      <Toolbar editor={editor} />

      <div className="px-4 py-3">
        <EditorContent editor={editor} />
        <SlashMenu
          open={slash.isOpen}
          items={slash.items}
          activeIndex={slash.activeIndex}
          position={slash.position}
          onSelect={slash.select}
          onHover={slash.setActiveIndex}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {textStats.words} từ · {textStats.chars} ký tự
        </span>
        <SaveStatus
          status={autosave.status}
          savedAt={autosave.savedAt}
          error={autosave.error}
          onRetry={autosave.retry}
        />
      </div>
    </div>
  )
}
