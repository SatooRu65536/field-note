import { describe, expect, it } from 'vitest'

import { isSameCategorySet } from './categoryOrder'

describe('isSameCategorySet', () => {
  it('登録済みの ID を並び替えただけの場合は true を返す', () => {
    // Act
    const result = isSameCategorySet({
      currentIds: ['plant', 'mineral', 'seed'],
      orderedIds: ['seed', 'plant', 'mineral'],
    })

    // Assert
    expect(result).toBe(true)
  })

  it.each([
    ['足りない', ['plant', 'mineral']],
    ['重複している', ['plant', 'plant', 'seed']],
    ['登録されていない ID を含む', ['plant', 'mineral', 'fish']],
  ])('ID が%s場合は false を返す', (_, orderedIds) => {
    // Act
    const result = isSameCategorySet({ currentIds: ['plant', 'mineral', 'seed'], orderedIds })

    // Assert
    expect(result).toBe(false)
  })
})
