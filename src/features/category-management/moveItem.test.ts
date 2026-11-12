import { describe, expect, it } from 'vitest'

import { moveItem } from './moveItem'

describe('moveItem', () => {
  it('要素を1つ前へ移動する', () => {
    // Act
    const items = moveItem({ items: ['a', 'b', 'c'], index: 2, offset: -1 })

    // Assert
    expect(items).toEqual(['a', 'c', 'b'])
  })

  it('要素を1つ後ろへ移動する', () => {
    // Act
    const items = moveItem({ items: ['a', 'b', 'c'], index: 0, offset: 1 })

    // Assert
    expect(items).toEqual(['b', 'a', 'c'])
  })

  it.each([
    ['先頭をさらに前へ', 0, -1],
    ['末尾をさらに後ろへ', 2, 1],
  ])('%s移動する場合は並びを変えない', (_, index, offset) => {
    // Act
    const items = moveItem({ items: ['a', 'b', 'c'], index, offset })

    // Assert
    expect(items).toEqual(['a', 'b', 'c'])
  })
})
