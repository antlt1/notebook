import { createContext, useContext } from 'react'
import type { ResolvedTheme, Theme } from '@/utils/theme'

export interface ThemeContextValue {
  /** Lựa chọn của người dùng: sáng, tối, hoặc theo hệ thống. */
  theme: Theme
  /** Giá trị thực tế đang áp dụng — dùng khi cần biết đang sáng hay tối. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
