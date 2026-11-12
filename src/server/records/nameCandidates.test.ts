import { describe, expect, it } from 'vitest'

import { mergeNameCandidates } from './nameCandidates'

describe('mergeNameCandidates', () => {
  it('ひらがな・カタカナの違いだけの名前をまとめ，件数を合計する', () => {
    // Act
    const candidates = mergeNameCandidates([
      { name: 'コナラ', recordCount: 3 },
      { name: 'こなら', recordCount: 1 },
    ])

    // Assert
    expect(candidates).toEqual([{ name: 'コナラ', recordCount: 4 }])
  })

  it('まとめた名前の表記は最も多く使われたものにする', () => {
    // Act
    const candidates = mergeNameCandidates([
      { name: 'コナラ', recordCount: 1 },
      { name: 'こなら', recordCount: 2 },
    ])

    // Assert
    expect(candidates).toEqual([{ name: 'こなら', recordCount: 3 }])
  })

  it('記録の多い順に並べる', () => {
    // Act
    const candidates = mergeNameCandidates([
      { name: 'クヌギ', recordCount: 1 },
      { name: 'イチョウ', recordCount: 5 },
    ])

    // Assert
    expect(candidates.map(({ name }) => name)).toEqual(['イチョウ', 'クヌギ'])
  })
})
