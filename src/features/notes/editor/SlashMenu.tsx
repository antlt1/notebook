import { cn } from 'cn'
import type { SlashItem } from './slashItems'

interface SlashMenuProps {
  open: boolean
  items: SlashItem[]
  activeIndex: number
  position: { top: number; left: number } | null
  onSelect: (item: SlashItem) => void
  onHover: (index: number) => void
}

/** Panel gợi ý khối khi gõ `/`. Focus vẫn ở editor nên điều hướng bằng phím nằm ở `useSlashMenu`. */
export function SlashMenu({
  open,
  items,
  activeIndex,
  position,
  onSelect,
  onHover,
}: SlashMenuProps) {
  if (!open || position === null) {
    return null
  }

  return (
    <div
      role="listbox"
      aria-label="Chèn khối"
      className="fixed z-50 max-h-64 w-64 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: position.top, left: position.left }}
    >
      {items.length === 0 ? (
        <p className="px-2 py-3 text-xs text-muted-foreground">Không có khối nào khớp.</p>
      ) : (
        items.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                index === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
              )}
              // Giữ focus ở editor để lệnh chạy đúng vị trí con trỏ.
              onMouseDown={(event) => {
                event.preventDefault()
                onSelect(item)
              }}
              onMouseEnter={() => onHover(index)}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          )
        })
      )}
    </div>
  )
}
