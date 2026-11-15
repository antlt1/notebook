import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { Markdown } from '@tiptap/markdown'
import type { Extensions } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

/**
 * Tạo bộ extension MỚI cho mỗi editor (và cho MarkdownManager dùng khi test),
 * để hai document không dùng chung state của extension.
 *
 * Danh sách này là nguồn duy nhất quyết định Markdown nào được đọc/ghi (Q4), nên
 * test round-trip dùng lại đúng hàm này thay vì tự dựng extension riêng.
 */
export function createEditorExtensions(): Extensions {
  return [
    StarterKit.configure({
      // Mục 7.1: chỉ H1–H4 (Q9); H5–H6 để Backlog.
      heading: { levels: [1, 2, 3, 4] },
      // Code block có highlight đến từ CodeBlockLowlight bên dưới.
      codeBlock: false,
      link: {
        // Đang soạn thảo thì bấm vào link không được điều hướng.
        openOnClick: false,
        autolink: true,
        // Mục 13: link ngoài luôn có rel an toàn.
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      },
      undoRedo: { depth: 100 },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({
      placeholder: "Gõ '/' để chèn khối, hoặc cứ viết…",
    }),
    Markdown.configure({ indentation: { style: 'space', size: 2 } }),
  ]
}
