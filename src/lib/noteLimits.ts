/**
 * Giới hạn dùng chung cho note — tách khỏi `noteService` để helper/test thuần
 * không phải import Firebase (tránh khởi tạo SDK khi chạy unit test).
 *
 * Giá trị phải khớp `firestore.rules` (Mục 6.1) và Mục 5.2.
 */
export const MAX_TITLE_LENGTH = 200
export const MAX_TABS = 30
export const MAX_TAB_NAME_LENGTH = 50

/** Mục 5.3: cảnh báo khi note gần giới hạn 1 MiB của một document Firestore. */
export const NOTE_SIZE_WARNING_BYTES = 700 * 1024
