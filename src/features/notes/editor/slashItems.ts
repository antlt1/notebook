import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  SquareCode,
  type LucideIcon,
} from 'lucide-react'
import type { Editor } from '@tiptap/react'

export interface SlashItem {
  id: string
  label: string
  hint: string
  keywords: string[]
  icon: LucideIcon
  run: (editor: Editor) => void
}

/** Menu `/` theo Mục 7.1: Đoạn văn, H1–H4, danh sách (•, 1., ☐), trích dẫn, code block, đường kẻ. */
export const SLASH_ITEMS: SlashItem[] = [
  {
    id: 'paragraph',
    label: 'Đoạn văn',
    hint: 'Văn bản thường',
    keywords: ['doan', 'van', 'paragraph', 'text', 'p'],
    icon: Pilcrow,
    run: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'heading-1',
    label: 'Tiêu đề 1',
    hint: '# Tiêu đề lớn',
    keywords: ['tieu', 'de', 'heading', 'h1', '1'],
    icon: Heading1,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'heading-2',
    label: 'Tiêu đề 2',
    hint: '## Tiêu đề mục',
    keywords: ['tieu', 'de', 'heading', 'h2', '2'],
    icon: Heading2,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading-3',
    label: 'Tiêu đề 3',
    hint: '### Tiêu đề nhỏ',
    keywords: ['tieu', 'de', 'heading', 'h3', '3'],
    icon: Heading3,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'heading-4',
    label: 'Tiêu đề 4',
    hint: '#### Tiêu đề phụ',
    keywords: ['tieu', 'de', 'heading', 'h4', '4'],
    icon: Heading4,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 4 }).run(),
  },
  {
    id: 'bullet-list',
    label: 'Danh sách',
    hint: '• Gạch đầu dòng',
    keywords: ['danh', 'sach', 'list', 'bullet', 'gach'],
    icon: List,
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'ordered-list',
    label: 'Danh sách số',
    hint: '1. Thứ tự',
    keywords: ['danh', 'sach', 'so', 'ordered', 'number', 'list'],
    icon: ListOrdered,
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'task-list',
    label: 'Checklist',
    hint: '☐ Việc cần làm',
    keywords: ['checklist', 'task', 'todo', 'viec', 'can', 'lam', 'o'],
    icon: ListChecks,
    run: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'blockquote',
    label: 'Trích dẫn',
    hint: '> Câu trích dẫn',
    keywords: ['trich', 'dan', 'quote', 'blockquote'],
    icon: Quote,
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code-block',
    label: 'Khối mã',
    hint: '``` code ```',
    keywords: ['code', 'khoi', 'ma', 'block'],
    icon: SquareCode,
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'horizontal-rule',
    label: 'Đường kẻ',
    hint: '---',
    keywords: ['duong', 'ke', 'hr', 'rule', 'divider'],
    icon: Minus,
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]

/** Bỏ dấu tiếng Việt để gõ "tieu de" vẫn tìm ra "Tiêu đề". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function filterSlashItems(query: string): SlashItem[] {
  const needle = normalize(query)
  if (needle.length === 0) {
    return SLASH_ITEMS
  }

  // Mỗi từ khoá phải khớp, để "tieu de 3" tìm ra đúng "Tiêu đề 3".
  const words = needle.split(/\s+/).filter((word) => word.length > 0)

  return SLASH_ITEMS.filter((item) => {
    const haystack = normalize([item.label, item.hint, ...item.keywords].join(' '))
    return words.every((word) => haystack.includes(word))
  })
}
