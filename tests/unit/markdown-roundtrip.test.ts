import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'
import { createEditorExtensions } from '@/features/notes/editor/extensions'

/**
 * Mục 7.3: nội dung tab được lưu dưới dạng Markdown (Q4), nên mọi khối mà editor
 * tạo ra phải đọc lại được — round-trip `md → editor → md` không đổi nội dung.
 */
const manager = new MarkdownManager({
  extensions: createEditorExtensions(),
  indentation: { style: 'space', size: 2 },
})

function editorRoundTrip(markdown: string): string {
  return manager.serialize(manager.parse(markdown))
}

const ROUND_TRIP_SAMPLES: Record<string, string> = {
  h1: '# Tiêu đề 1',
  h2: '## Tiêu đề 2',
  h3: '### Tiêu đề 3',
  h4: '#### Tiêu đề 4',
  paragraph: 'Một đoạn văn bình thường.',
  multiParagraph: 'Đoạn một.\n\nĐoạn hai.',
  marks: 'Đây là **đậm**, *nghiêng*, ~~gạch~~ và `code`.',
  bulletList: '- Một\n- Hai',
  orderedList: '1. Một\n2. Hai',
  nestedList: '- Mục cha\n  - Mục con\n- Mục khác',
  checklist: '- [ ] Việc chưa xong\n- [x] Việc đã xong',
  blockquote: '> Trích dẫn\n> Dòng hai',
  codeBlock: '```ts\nconst a = 1\n```',
  horizontalRule: '---',
  link: '[Tiptap](https://tiptap.dev)',
  combined:
    '# Tiêu đề\n\nĐoạn có **đậm**.\n\n- [ ] Việc\n\n> Trích\n\n```js\nlet x = 1\n```\n\n---',
}

describe('markdown round-trip', () => {
  it.each(Object.entries(ROUND_TRIP_SAMPLES))('giữ nguyên khối %s', (_name, markdown) => {
    expect(editorRoundTrip(markdown)).toBe(markdown)
  })

  it('ổn định khi round-trip nhiều lần (không phình dấu cách/dòng trống)', () => {
    for (const markdown of Object.values(ROUND_TRIP_SAMPLES)) {
      const once = editorRoundTrip(markdown)
      expect(editorRoundTrip(once)).toBe(once)
    }
  })

  it('nội dung rỗng vẫn là chuỗi rỗng', () => {
    expect(editorRoundTrip('')).toBe('')
  })
})
