const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
  'auth/invalid-email': 'Email không hợp lệ',
  'auth/user-disabled': 'Tài khoản đã bị vô hiệu hoá',
  'auth/user-not-found': 'Email hoặc mật khẩu không đúng',
  'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
  'auth/email-already-in-use': 'Email đã được đăng ký',
  'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
  'auth/missing-email': 'Vui lòng nhập email',
  'auth/missing-password': 'Vui lòng nhập mật khẩu',
  'auth/too-many-requests': 'Quá nhiều lần thử, vui lòng thử lại sau',
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập',
  'auth/cancelled-popup-request': 'Đã huỷ đăng nhập',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ đăng nhập, hãy cho phép popup và thử lại',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được bật',
  'auth/network-request-failed': 'Lỗi mạng, thử lại sau',
}

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'Bạn không có quyền với ghi chú này',
  unauthenticated: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  unavailable: 'Mất kết nối, đang thử lại…',
  'deadline-exceeded': 'Máy chủ phản hồi chậm, thử lại sau',
  'not-found': 'Ghi chú không còn tồn tại',
  'failed-precondition': 'Truy vấn chưa sẵn sàng, thử lại sau',
  'resource-exhausted': 'Tạm thời quá tải, thử lại sau',
  aborted: 'Ghi chú vừa bị thay đổi, thử lại',
}

const FALLBACK_MESSAGE = 'Đã có lỗi xảy ra, vui lòng thử lại'

function getErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code?: unknown }
    return typeof code === 'string' ? code : null
  }
  return null
}

export function mapAuthError(error: unknown): string {
  const code = getErrorCode(error)
  if (code !== null && code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[code]
  }
  return FALLBACK_MESSAGE
}

export function mapFirestoreError(error: unknown): string {
  const code = getErrorCode(error)
  if (code !== null) {
    return code in FIRESTORE_ERROR_MESSAGES ? FIRESTORE_ERROR_MESSAGES[code] : FALLBACK_MESSAGE
  }

  // Lỗi không phải từ Firestore (ví dụ validation của noteService) đã là tiếng Việt sẵn.
  return error instanceof Error && error.message.length > 0 ? error.message : FALLBACK_MESSAGE
}
