import { useRef, useState, type KeyboardEvent } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MAX_TAB_NAME_LENGTH, MAX_TABS } from '@/lib/noteLimits'
import type { NoteTab } from '@/types/note'
import { cn } from 'cn'
import { ConfirmDialog } from '../components/ConfirmDialog'

interface TabBarProps {
  tabs: NoteTab[]
  activeTabId: string | null
  onSelect: (tabId: string) => void
  onAdd: () => void
  onRename: (tabId: string, name: string) => void
  onDelete: (tabId: string) => void
  onReorder: (activeId: string, overId: string) => void
}

function tabDomId(tabId: string): string {
  return `note-tab-${tabId}`
}

/** Thông báo cho trình đọc màn hình khi kéo tab (dnd-kit mặc định là tiếng Anh). */
const SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    'Nhấn Space để nhấc tab, dùng phím mũi tên để di chuyển, Enter để thả, Escape để huỷ.',
}

const ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `Đã nhấc tab ${active.data.current?.label ?? ''}.`,
  onDragOver: ({ over }) => (over === null ? undefined : `Đang ở vị trí ${over.data.current?.index ?? ''}.`),
  onDragEnd: ({ over }) => (over === null ? 'Đã huỷ di chuyển tab.' : 'Đã thả tab.'),
  onDragCancel: () => 'Đã huỷ di chuyển tab.',
}

/**
 * Thanh tab của một ghi chú (Mục 8.1): chọn tab, thêm, đổi tên bằng double-click,
 * xoá có xác nhận và kéo-thả đổi thứ tự (Mục 2).
 */
export function TabBar({
  tabs,
  activeTabId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: TabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())

  const sensors = useSensors(
    // Chỉ kéo từ "tay nắm" nên cần một ngưỡng nhỏ, tránh kéo nhầm khi bấm.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function startRename(tab: NoteTab) {
    setEditingId(tab.id)
    setDraft(tab.name)
  }

  function commitRename() {
    if (editingId !== null) {
      onRename(editingId, draft)
    }
    setEditingId(null)
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitRename()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setEditingId(null)
    }
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (tabs.length === 0) {
      return
    }

    // dnd-kit đã dùng phím này để kéo tab (nó gọi `preventDefault`) — không đổi tab,
    // nếu không thì mũi tên vừa di chuyển tab vừa nhảy sang tab khác.
    if (event.defaultPrevented) {
      return
    }

    // Đang đứng ở tay nắm kéo: phím mũi tên thuộc về thao tác kéo, không phải chuyển tab.
    if ((event.target as HTMLElement).closest('[data-tab-drag-handle]') !== null) {
      return
    }

    const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId)
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % tabs.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    }

    if (nextIndex === null) {
      return
    }

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    onSelect(nextTab.id)
    tabRefs.current.get(nextTab.id)?.focus()
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over === null || active.id === over.id) {
      return
    }
    onReorder(String(active.id), String(over.id))
  }

  const pendingDeleteTab = tabs.find((tab) => tab.id === pendingDeleteId) ?? null
  const canDelete = tabs.length > 1

  return (
    <div className="flex items-center gap-1.5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: ANNOUNCEMENTS,
          screenReaderInstructions: SCREEN_READER_INSTRUCTIONS,
        }}
      >
        <div
          role="tablist"
          aria-label="Các tab của ghi chú"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5"
          onKeyDown={handleTabListKeyDown}
        >
          <SortableContext
            items={tabs.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab, index) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                index={index}
                active={tab.id === activeTabId}
                editing={tab.id === editingId}
                draft={draft}
                canDelete={canDelete}
                registerRef={(element) => {
                  if (element === null) {
                    tabRefs.current.delete(tab.id)
                    return
                  }
                  tabRefs.current.set(tab.id, element)
                }}
                onSelect={() => onSelect(tab.id)}
                onStartRename={() => startRename(tab)}
                onDraftChange={setDraft}
                onRenameKeyDown={handleRenameKeyDown}
                onCommitRename={commitRename}
                onRequestDelete={() => setPendingDeleteId(tab.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label="Thêm tab"
        title={tabs.length >= MAX_TABS ? `Tối đa ${MAX_TABS} tab` : 'Thêm tab'}
        disabled={tabs.length >= MAX_TABS}
        onClick={onAdd}
      >
        <Plus aria-hidden="true" />
      </Button>

      <ConfirmDialog
        open={pendingDeleteTab !== null}
        title="Xoá tab?"
        description={
          pendingDeleteTab === null
            ? ''
            : `Tab “${pendingDeleteTab.name}” và toàn bộ nội dung bên trong sẽ bị xoá. Thao tác này không thể hoàn tác.`
        }
        confirmLabel="Xoá tab"
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteId(null)
          }
        }}
        onConfirm={() => {
          if (pendingDeleteTab !== null) {
            onDelete(pendingDeleteTab.id)
          }
          setPendingDeleteId(null)
        }}
      />
    </div>
  )
}

interface SortableTabProps {
  tab: NoteTab
  index: number
  active: boolean
  editing: boolean
  draft: string
  canDelete: boolean
  registerRef: (element: HTMLButtonElement | null) => void
  onSelect: () => void
  onStartRename: () => void
  onDraftChange: (value: string) => void
  onRenameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCommitRename: () => void
  onRequestDelete: () => void
}

function SortableTab({
  tab,
  index,
  active,
  editing,
  draft,
  canDelete,
  registerRef,
  onSelect,
  onStartRename,
  onDraftChange,
  onRenameKeyDown,
  onCommitRename,
  onRequestDelete,
}: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
    data: { label: tab.name, index: index + 1 },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex shrink-0 items-center gap-0.5 rounded-lg border pr-0.5 pl-2.5',
        active ? 'border-ring bg-accent text-accent-foreground' : 'bg-card',
        isDragging && 'z-10 opacity-70 shadow-md',
      )}
    >
      {editing ? (
        <Input
          autoFocus
          value={draft}
          maxLength={MAX_TAB_NAME_LENGTH}
          aria-label={`Đổi tên tab ${tab.name}`}
          className="my-1 h-6 w-32 px-1 py-0 text-xs"
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onRenameKeyDown}
          onBlur={onCommitRename}
        />
      ) : (
        <button
          ref={registerRef}
          id={tabDomId(tab.id)}
          type="button"
          role="tab"
          aria-selected={active}
          tabIndex={active ? 0 : -1}
          title={tab.name}
          className="max-w-40 truncate py-1 text-xs font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          onClick={onSelect}
          onDoubleClick={onStartRename}
        >
          {tab.name}
        </button>
      )}

      <button
        type="button"
        data-tab-drag-handle=""
        aria-label={`Kéo để đổi thứ tự tab ${tab.name}`}
        className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label={`Xoá tab ${tab.name}`}
        title={canDelete ? `Xoá tab ${tab.name}` : 'Không thể xoá tab cuối cùng'}
        disabled={!canDelete}
        className="rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-40"
        onClick={onRequestDelete}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
