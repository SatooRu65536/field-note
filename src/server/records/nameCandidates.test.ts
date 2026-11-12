import { describe, expect, it } from 'vitest'

import { mergeNameCandidates } from './nameCandidates'

describe('mergeNameCandidates', () => {
  it('ひらがな・カタカナの違いだけの名前をまとめ，件数を合計する', () => {
    // Act
    const candidates = mergeNameCandidates([
      { name: 'コナラ', categoryId: 'seed', recordCount: 3 },
      { name: 'こなら', categoryId: 'seed', recordCount: 1 },
    ])

    // Assert
    expect(candidates).toEqual([{ name: 'コナラ', recordCount: 4, categoryId: 'seed' }])
  })

  it('まとめた名前の表記は最も多く使われたものにする', () => {
    // Act
    const candidates = mergeNameCandidates([
      { name: 'コナラ', categoryId: 'seed', recordCount: 1 },
      { name: 'こなら', categoryId: 'seed', recordCount: 2 },
    ])

    // Assert
    expect(candidates[0]?.name).toBe('こなら')
  })

  it('推定するカテゴリは，表記によらず同じ名前で最も多く使われたものにする', () => {
    // Act
    const candidates = mergeNameCandidates([
      { name: 'コナラ', categoryId: 'plant', recordCount: 2 },
      { name: 'コナラ', categoryId: 'seed', recordCount: 1 },
      { name: 'こなら', categoryId: 'seed', recordCount: 2 },
    ])

    // Assert
    expect(candidates).toEqual([{ name: 'コナラ', recordCount: 5, categoryId: 'seed' }])
  })

  it('記録の多い順に並べる', () => {
    // Act
    const candidates = mergeNameCandidates([
      { name: 'クヌギ', categoryId: 'plant', recordCount: 1 },
      { name: 'イチョウ', categoryId: 'plant', recordCount: 5 },
    ])

    // Assert
    expect(candidates.map(({ name }) => name)).toEqual(['イチョウ', 'クヌギ'])
  })
})
