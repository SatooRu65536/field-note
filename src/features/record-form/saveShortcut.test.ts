import { describe, expect, it } from 'vitest'

import { isSaveShortcut } from './saveShortcut'

const NO_MODIFIERS = { ctrlKey: false, metaKey: false, altKey: false, shiftKey: false }

describe('isSaveShortcut', () => {
  it.each([
    ['⌘S', { ...NO_MODIFIERS, key: 's', metaKey: true }],
    ['Ctrl+S', { ...NO_MODIFIERS, key: 's', ctrlKey: true }],
    ['Caps Lock 中の ⌘S', { ...NO_MODIFIERS, key: 'S', metaKey: true }],
  ])('%s を保存のショートカットとみなす', (_, event) => {
    // Act
    const result = isSaveShortcut(event)

    // Assert
    expect(result).toBe(true)
  })

  it.each([
    ['S だけ', { ...NO_MODIFIERS, key: 's' }],
    ['⌘⇧S', { ...NO_MODIFIERS, key: 's', metaKey: true, shiftKey: true }],
    ['⌘⌥S', { ...NO_MODIFIERS, key: 's', metaKey: true, altKey: true }],
    ['⌘A', { ...NO_MODIFIERS, key: 'a', metaKey: true }],
  ])('%s は保存のショートカットとみなさない', (_, event) => {
    // Act
    const result = isSaveShortcut(event)

    // Assert
    expect(result).toBe(false)
  })
})
