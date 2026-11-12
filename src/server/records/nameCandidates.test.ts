import { describe, expect, it } from 'vitest'

import { mergeNameCandidates } from './nameCandidates'

describe('mergeNameCandidates', () => {
  it('ひらがな・カタカナの違いだけの名前をまとめ，件数を合計する', () => {
    // Act
    const candidates = mergeNameCandidates({
      rows: [
        { name: 'コナラ', categoryId: 'seed', recordCount: 3 },
        { name: 'こなら', categoryId: 'seed', recordCount: 1 },
      ],
      tagRows: [],
    })

    // Assert
    expect(candidates).toEqual([{ name: 'コナラ', recordCount: 4, categoryId: 'seed', tags: [] }])
  })

  it('まとめた名前の表記は最も多く使われたものにする', () => {
    // Act
    const candidates = mergeNameCandidates({
      rows: [
        { name: 'コナラ', categoryId: 'seed', recordCount: 1 },
        { name: 'こなら', categoryId: 'seed', recordCount: 2 },
      ],
      tagRows: [],
    })

    // Assert
    expect(candidates[0]?.name).toBe('こなら')
  })

  it('推定するカテゴリは，表記によらず同じ名前で最も多く使われたものにする', () => {
    // Act
    const candidates = mergeNameCandidates({
      rows: [
        { name: 'コナラ', categoryId: 'plant', recordCount: 2 },
        { name: 'コナラ', categoryId: 'seed', recordCount: 1 },
        { name: 'こなら', categoryId: 'seed', recordCount: 2 },
      ],
      tagRows: [],
    })

    // Assert
    expect(candidates).toEqual([{ name: 'コナラ', recordCount: 5, categoryId: 'seed', tags: [] }])
  })

  it('記録の多い順に並べる', () => {
    // Act
    const candidates = mergeNameCandidates({
      rows: [
        { name: 'クヌギ', categoryId: 'plant', recordCount: 1 },
        { name: 'イチョウ', categoryId: 'plant', recordCount: 5 },
      ],
      tagRows: [],
    })

    // Assert
    expect(candidates.map(({ name }) => name)).toEqual(['イチョウ', 'クヌギ'])
  })
})

describe('mergeNameCandidates のタグ', () => {
  it('表記によらず同じ名前の記録に付けられたタグを，使われた回数の多い順に並べる', () => {
    // Act
    const candidates = mergeNameCandidates({
      rows: [{ name: 'コナラ', categoryId: 'seed', recordCount: 3 }],
      tagRows: [
        { name: 'コナラ', tag: '秋', recordCount: 1 },
        { name: 'コナラ', tag: 'どんぐり', recordCount: 2 },
        { name: 'こなら', tag: '秋', recordCount: 2 },
        { name: 'クヌギ', tag: '樹液', recordCount: 5 },
      ],
    })

    // Assert
    expect(candidates[0]?.tags).toEqual(['秋', 'どんぐり'])
  })
})

describe('mergeNameCandidates のタグの絞り込み', () => {
  it('同じ名前の記録の半数未満にしか付けられていないタグは推定に使わない', () => {
    // Act
    const candidates = mergeNameCandidates({
      rows: [{ name: 'コナラ', categoryId: 'seed', recordCount: 4 }],
      tagRows: [
        { name: 'コナラ', tag: 'どんぐり', recordCount: 2 },
        { name: 'コナラ', tag: '虫食い', recordCount: 1 },
      ],
    })

    // Assert
    expect(candidates[0]?.tags).toEqual(['どんぐり'])
  })
})
