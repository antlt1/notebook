import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('drops falsy values', () => {
    expect(cn('text-sm', false, undefined, null, '')).toBe('text-sm')
  })

  it('resolves conflicting tailwind classes to the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
