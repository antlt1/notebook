import { useState, type FormEvent, type ReactNode } from 'react'
import { useEditorState, type Editor } from '@tiptap/react'
import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Undo2,
  Unlink,
} from 'lucide-react'
import { Popover } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const HEADING_LEVELS = [1, 2, 3, 4] as const

/**
 * Chuẩn hoá href trước khi ghi vào document: thêm `https://` khi thiếu scheme và
 * chặn các scheme nguy hiểm (`javascript:`, `data:`…) — Mục 13.
 */
function normalizeHref(raw: string): string | null {
  const value = raw.trim()
  if (value.length === 0) {
    return null
  }
  if (value.startsWith('#') || value.startsWith('/')) {
    return value
  }
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) {
    return value
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return null
  }
  return `https://${value}`
}

interface ToolbarProps {
  editor: Editor
}

/** Toolbar dính trên cùng của editor (Mục 7.1): undo/redo, heading, marks, list, khối. */
export function Toolbar({ editor }: ToolbarProps) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [href, setHref] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      headingLevel: HEADING_LEVELS.find((level) => current.isActive('heading', { level })) ?? null,
      isBold: current.isActive('bold'),
      isItalic: current.isActive('italic'),
      isStrike: current.isActive('strike'),
      isCode: current.isActive('code'),
      isLink: current.isActive('link'),
      isBulletList: current.isActive('bulletList'),
      isOrderedList: current.isActive('orderedList'),
      isTaskList: current.isActive('taskList'),
      isBlockquote: current.isActive('blockquote'),
      isCodeBlock: current.isActive('codeBlock'),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  })

  function handleHeadingChange(value: string) {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run()
      return
    }
    const level = Number(value)
    if (level === 1 || level === 2 || level === 3 || level === 4) {
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  function handleLinkOpenChange(open: boolean) {
    setLinkOpen(open)
    setLinkError(null)
    if (open) {
      setHref((editor.getAttributes('link').href as string | undefined) ?? '')
    }
  }

  function applyLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = href.trim()

    if (trimmed.length === 0) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setLinkOpen(false)
      return
    }

    const nextHref = normalizeHref(trimmed)
    if (nextHref === null) {
      setLinkError('Chỉ hỗ trợ http(s), mailto, tel hoặc liên kết trong trang.')
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: nextHref }).run()
    setLinkOpen(false)
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkOpen(false)
  }

  return (
    <div
      role="toolbar"
      aria-label="Định dạng nội dung"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b bg-card/95 px-2 py-1.5 backdrop-blur"
    >
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Hoàn tác"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Làm lại"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 aria-hidden="true" />
      </Button>

      <Divider />

      <label className="sr-only" htmlFor="editor-heading">
        Kiểu đoạn
      </label>
      <select
        id="editor-heading"
        className="h-7 rounded-md border border-border bg-background px-1.5 text-xs text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        value={state.headingLevel === null ? 'paragraph' : String(state.headingLevel)}
        onChange={(event) => handleHeadingChange(event.target.value)}
      >
        <option value="paragraph">Đoạn văn</option>
        <option value="1">Tiêu đề 1</option>
        <option value="2">Tiêu đề 2</option>
        <option value="3">Tiêu đề 3</option>
        <option value="4">Tiêu đề 4</option>
      </select>

      <Divider />

      <ToolbarButton
        label="Đậm (Ctrl+B)"
        active={state.isBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Nghiêng (Ctrl+I)"
        active={state.isItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Gạch ngang"
        active={state.isStrike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Code trong dòng"
        active={state.isCode}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code aria-hidden="true" />
      </ToolbarButton>

      <Popover.Root open={linkOpen} onOpenChange={handleLinkOpenChange}>
        <Popover.Trigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant={state.isLink ? 'secondary' : 'ghost'}
            aria-label="Chèn liên kết"
            aria-pressed={state.isLink}
          >
            <Link2 aria-hidden="true" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align="start"
            className="z-50 w-80 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md"
          >
            <form className="space-y-2" onSubmit={applyLink}>
              <label className="block text-xs font-medium" htmlFor="link-href">
                Địa chỉ liên kết
              </label>
              <Input
                id="link-href"
                autoFocus
                value={href}
                placeholder="https://…"
                onChange={(event) => {
                  setHref(event.target.value)
                  setLinkError(null)
                }}
              />
              {linkError === null ? null : (
                <p className="text-xs text-destructive" role="alert">
                  {linkError}
                </p>
              )}
              <div className="flex items-center justify-between gap-2">
                {state.isLink ? (
                  <Button type="button" size="sm" variant="ghost" onClick={removeLink}>
                    <Unlink aria-hidden="true" />
                    Bỏ liên kết
                  </Button>
                ) : (
                  <span />
                )}
                <Button type="submit" size="sm">
                  Áp dụng
                </Button>
              </div>
            </form>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Divider />

      <ToolbarButton
        label="Danh sách gạch đầu dòng"
        active={state.isBulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Danh sách đánh số"
        active={state.isOrderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Checklist"
        active={state.isTaskList}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListChecks aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Trích dẫn"
        active={state.isBlockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Khối mã"
        active={state.isCodeBlock}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <SquareCode aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Đường kẻ"
        active={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus aria-hidden="true" />
      </ToolbarButton>
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />
}

interface ToolbarButtonProps {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({ label, active, onClick, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? 'secondary' : 'ghost'}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
