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
