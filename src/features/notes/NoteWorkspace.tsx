import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MAX_TABS, NOTE_SIZE_WARNING_BYTES } from '@/lib/noteLimits'
import type { Note, NoteTab } from '@/types/note'
import { NoteEditor } from './editor/NoteEditor'
import { useAutosave } from './hooks/useAutosave'
import { TabBar } from './tabs/TabBar'
import {
  addTab,
  createTab,
  estimateTabsBytes,
  moveTab,
  pickTabId,
  removeTab,
  renameTab,
} from './tabs/tabs'
import { createTabsStore } from './tabs/tabsStore'

interface NoteWorkspaceProps {
  note: Note
}

function pickNeighbourId(tabs: NoteTab[], removedId: string): string | null {
  const index = tabs.findIndex((tab) => tab.id === removedId)
  const remaining = tabs.filter((tab) => tab.id !== removedId)
  if (remaining.length === 0) {
    return null
  }
  return remaining[Math.min(Math.max(index, 0), remaining.length - 1)].id
}

/**
 * Khu vực làm việc của một ghi chú: thanh tab + editor của tab đang mở.
 *
 * `?tab=` quyết định tab đang mở (Mục 8.2), nên reload/chia sẻ link vẫn mở đúng
 * tab. Mọi thay đổi (nội dung lẫn cấu trúc tab) đi qua **một** store + **một**
 * hàng đợi autosave để tránh hai lần ghi đè nhau (Mục 7.5).
 */
export function NoteWorkspace({ note }: NoteWorkspaceProps) {
  const [store] = useState(() => createTabsStore(note.tabs))
  const tabs = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const autosave = useAutosave(note.id)
  const { flush, queue, status } = autosave

  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTabId = searchParams.get('tab')
  const activeTabId = pickTabId(tabs, requestedTabId)
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null

  // Nhận thay đổi từ thiết bị khác, nhưng không đè lên bản đang chờ ghi của máy này.
  useEffect(() => {
    if (status === 'saving' || status === 'error') {
      return
    }
    store.applyServer(note.tabs)
  }, [note.tabs, status, store])

  const openTab = useCallback(
    (tabId: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          next.set('tab', tabId)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Giữ URL khớp tab đang mở khi `?tab=` thiếu hoặc trỏ vào tab đã bị xoá.
  useEffect(() => {
    if (activeTabId === null || requestedTabId === activeTabId) {
      return
    }
    openTab(activeTabId)
  }, [activeTabId, openTab, requestedTabId])

  /** Ghi ngay thay đổi cấu trúc tab (thêm/đổi tên/xoá/kéo) để không mất khi đóng app. */
  const commitTabs = useCallback(
    (next: NoteTab[]) => {
      store.update(() => next)
      queue(store.getSnapshot())
      flush()
    },
    [flush, queue, store],
  )

  const handleSelect = useCallback(
    (tabId: string) => {
      // Ghi nốt nội dung tab cũ trước khi đổi tab (Mục 7.5).
      flush()
      openTab(tabId)
    },
    [flush, openTab],
  )

  const handleContentChange = useCallback(
    (markdown: string) => {
      if (activeTabId === null) {
        return
      }
      const next = store.update((current) =>
        current.map((tab) => (tab.id === activeTabId ? { ...tab, value: markdown } : tab)),
      )
      queue(next)
    },
    [activeTabId, queue, store],
  )

  const handleAdd = useCallback(() => {
    const current = store.getSnapshot()
    if (current.length >= MAX_TABS) {
      return
    }
    const tab = createTab(current)
    commitTabs(addTab(current, tab))
    openTab(tab.id)
  }, [commitTabs, openTab, store])

  const handleRename = useCallback(
    (tabId: string, name: string) => {
      commitTabs(renameTab(store.getSnapshot(), tabId, name))
    },
    [commitTabs, store],
  )

  const handleDelete = useCallback(
    (tabId: string) => {
      const current = store.getSnapshot()
      const next = removeTab(current, tabId)
      if (next === current) {
        return
      }
      const fallbackId = tabId === activeTabId ? pickNeighbourId(current, tabId) : null
      commitTabs(next)
      if (fallbackId !== null) {
        openTab(fallbackId)
      }
    },
    [activeTabId, commitTabs, openTab, store],
  )

  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      commitTabs(moveTab(store.getSnapshot(), activeId, overId))
    },
    [commitTabs, store],
  )

  const sizeBytes = estimateTabsBytes(tabs)
  const showSizeWarning = sizeBytes > NOTE_SIZE_WARNING_BYTES

  return (
    <div className="space-y-3">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelect={handleSelect}
        onAdd={handleAdd}
        onRename={handleRename}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />

      {showSizeWarning ? (
        <p
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200"
        >
          Ghi chú đã khá lớn (~{Math.round(sizeBytes / 1024)} KB). Firestore giới hạn 1 MiB cho
          mỗi ghi chú — nên tách bớt nội dung sang ghi chú khác.
        </p>
      ) : null}

      {activeTab === null ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Ghi chú này chưa có tab nào. Bấm “Thêm tab” để bắt đầu.
        </p>
      ) : (
        <NoteEditor
          key={activeTab.id}
          tab={activeTab}
          save={autosave}
          onContentChange={handleContentChange}
          onFlush={flush}
        />
      )}
    </div>
  )
}
