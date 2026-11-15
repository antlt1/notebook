import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Theme } from '@/utils/theme'
import { useTheme } from './theme-context'

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Giao diện sáng', icon: Sun },
  { value: 'dark', label: 'Giao diện tối', icon: Moon },
  { value: 'system', label: 'Theo hệ thống', icon: Monitor },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Chọn giao diện sáng hoặc tối"
      className="inline-flex items-center gap-0.5 rounded-md border p-0.5"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon
        const active = theme === option.value
        return (
          <Button
            key={option.value}
            type="button"
            size="icon-xs"
            variant={active ? 'secondary' : 'ghost'}
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            onClick={() => setTheme(option.value)}
          >
            <Icon aria-hidden="true" />
          </Button>
        )
      })}
    </div>
  )
}
