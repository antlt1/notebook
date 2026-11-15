import { useEffect, useRef } from 'react'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import type { NoteTab } from '@/types/note'
import type { UseAutosaveResult } from '../hooks/useAutosave'
import { createEditorExtensions } from './extensions'
import { SaveStatus } from './SaveStatus'
import { SlashMenu } from './SlashMenu'
import { Toolbar } from './Toolbar'
import { useSlashMenu, type SlashBridge } from './useSlashMenu'

interface NoteEditorProps {
  /** Tab đang mở. Remount theo `key` khi đổi tab nên không cần theo dõi id ở đây. */
  tab: NoteTab
  /** Trạng thái autosave dùng chung cho cả note (nhiều tab). */
  save: Pick<UseAutosaveResult, 'status' | 'savedAt' | 'error' | 'retry'>
  onContentChange: (markdown: string) => void
  /** Ghi ngay: blur, Ctrl/Cmd+S, ẩn tab. */
  onFlush: () => void
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

/**
 * Editor của **một tab**: Tiptap + Markdown (Q4), toolbar, menu `/` và đồng bộ
 * realtime từ thiết bị khác. Nội dung do `NoteWorkspace` giữ để nhiều tab dùng
 * chung một hàng đợi autosave (Mục 7.5).
 */
export function NoteEditor({ tab, save, onContentChange, onFlush }: NoteEditorProps) {
  const slashBridgeRef = useRef<SlashBridge | null>(null)
  const lastMarkdownRef = useRef(tab.value)

  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: tab.value,
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
      onContentChange(markdown)
    },
    onSelectionUpdate: ({ editor: current }) => slashBridgeRef.current?.sync(current),
    onBlur: onFlush,
  })

  const slash = useSlashMenu(editor, slashBridgeRef)

  // Đếm từ/ký tự theo transaction của editor thay vì lưu thêm state.
  const stats = useEditorState({
    editor,
    selector: ({ editor: current }) => (current === null ? EMPTY_STATS : readStats(current)),
  })
  const textStats = stats ?? EMPTY_STATS

  const saveStatus = save.status

  // Đồng bộ nội dung từ thiết bị khác. Bỏ qua khi máy này đang có thay đổi chưa
  // ghi để không làm nhảy con trỏ / mất chữ đang gõ (Mục 7.5).
  useEffect(() => {
    if (editor === null || saveStatus === 'saving' || saveStatus === 'error') {
      return
    }

    if (tab.value !== editor.getMarkdown()) {
      editor.commands.setContent(tab.value, { contentType: 'markdown', emitUpdate: false })
      lastMarkdownRef.current = tab.value
    }
  }, [editor, saveStatus, tab.value])

  // Ctrl/Cmd+S = lưu ngay (Mục 7.1); ẩn tab (điện thoại) cũng cố gắng ghi nốt.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        onFlush()
      }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        onFlush()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [onFlush])

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
          status={save.status}
          savedAt={save.savedAt}
          error={save.error}
          onRetry={save.retry}
        />
      </div>
    </div>
  )
}
