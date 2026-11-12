import { describe, expect, it } from 'vitest'

import { countRecordsByCategory } from './categoryCounts'

const PLANT = { id: 'plant', name: '植物', color: '#2f7d4f' }
const MINERAL = { id: 'mineral', name: '石・鉱物', color: '#5b6b80' }

describe('countRecordsByCategory', () => {
  it('カテゴリの表示順に記録の件数を返す', () => {
    // Arrange
    const records = [{ categoryId: 'mineral' }, { categoryId: 'plant' }, { categoryId: 'mineral' }]

    // Act
    const counts = countRecordsByCategory({ categories: [PLANT, MINERAL], records })

    // Assert
    expect(counts).toEqual([
      { category: PLANT, count: 1 },
      { category: MINERAL, count: 2 },
    ])
  })

  it('記録がないカテゴリは 0 件として返す', () => {
    // Act
    const counts = countRecordsByCategory({ categories: [PLANT], records: [] })

    // Assert
    expect(counts).toEqual([{ category: PLANT, count: 0 }])
  })

  it('カテゴリ一覧にないカテゴリの記録は数えない', () => {
    // Arrange
    const records = [{ categoryId: 'removed' }]

    // Act
    const counts = countRecordsByCategory({ categories: [PLANT], records })

    // Assert
    expect(counts).toEqual([{ category: PLANT, count: 0 }])
  })
})
