import { describe, expect, it } from 'vitest'

import { normalizeTags } from './tags'

describe('normalizeTags', () => {
  it('前後の空白と先頭の # を取り除く', () => {
    // Arrange
    const tags = ['  どんぐり ', '#紅葉', '## 苔']

    // Act
    const normalized = normalizeTags(tags)

    // Assert
    expect(normalized).toEqual(['どんぐり', '紅葉', '苔'])
  })

  it('空のタグを取り除く', () => {
    // Arrange
    const tags = ['', '   ', '#', '石']

    // Act
    const normalized = normalizeTags(tags)

    // Assert
    expect(normalized).toEqual(['石'])
  })

  it('重複したタグは最初の1つだけを残す', () => {
    // Arrange
    const tags = ['苔', '#苔', ' 苔 ', 'シダ']

    // Act
    const normalized = normalizeTags(tags)

    // Assert
    expect(normalized).toEqual(['苔', 'シダ'])
  })
})
