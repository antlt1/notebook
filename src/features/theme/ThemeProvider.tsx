import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  applyResolvedTheme,
  getSystemThemeSnapshot,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  subscribeToSystemTheme,
  type ResolvedTheme,
  type Theme,
} from '@/utils/theme'
import { ThemeContext } from './theme-context'

/** Áp theme và tự theo `prefers-color-scheme` khi người dùng chọn "Hệ thống". */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme())
  const systemTheme = useSyncExternalStore<ResolvedTheme>(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    () => 'light',
  )
  const resolvedTheme = resolveTheme(theme, systemTheme)

  useEffect(() => {
    applyResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next)
    setThemeState(next)
  }, [])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
