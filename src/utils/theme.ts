/** Theme chỉ là tuỳ chọn UI nên được phép nằm trong localStorage (Mục 10.5). */
export const THEME_STORAGE_KEY = 'ghichu-theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư) → dùng mặc định.
    return 'system'
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Không lưu được thì vẫn giữ theme trong bộ nhớ của phiên hiện tại.
  }
}

export function subscribeToSystemTheme(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(DARK_QUERY)
  mediaQuery.addEventListener('change', onChange)
  return () => mediaQuery.removeEventListener('change', onChange)
}

export function getSystemThemeSnapshot(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function resolveTheme(theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === 'system' ? systemTheme : theme
}

/** Gắn/bỏ class `dark` trên `<html>` và đồng bộ `color-scheme` cho control native. */
export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

/** Gọi trước khi render React để tránh nháy trắng khi người dùng chọn dark. */
export function applyStoredTheme(): void {
  applyResolvedTheme(resolveTheme(readStoredTheme(), getSystemThemeSnapshot()))
}
