import { describe, expect, it } from 'vitest'
import { mapAuthError } from '@/utils/firebaseErrors'

describe('mapAuthError', () => {
  it('translates known Firebase Auth codes', () => {
    expect(mapAuthError({ code: 'auth/invalid-credential' })).toBe('Email hoặc mật khẩu không đúng')
    expect(mapAuthError({ code: 'auth/email-already-in-use' })).toBe('Email đã được đăng ký')
    expect(mapAuthError({ code: 'auth/weak-password' })).toBe(
      'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
    )
    expect(mapAuthError({ code: 'auth/popup-closed-by-user' })).toBe('Bạn đã đóng cửa sổ đăng nhập')
    expect(mapAuthError({ code: 'auth/network-request-failed' })).toBe('Lỗi mạng, thử lại sau')
  })

  it('falls back for unknown codes', () => {
    expect(mapAuthError({ code: 'auth/something-new' })).toBe('Đã có lỗi xảy ra, vui lòng thử lại')
  })

  it('falls back for values without a code', () => {
    expect(mapAuthError(new Error('boom'))).toBe('Đã có lỗi xảy ra, vui lòng thử lại')
    expect(mapAuthError(null)).toBe('Đã có lỗi xảy ra, vui lòng thử lại')
    expect(mapAuthError('plain string')).toBe('Đã có lỗi xảy ra, vui lòng thử lại')
  })
})
