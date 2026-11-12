import { describe, expect, it } from 'vitest'

import { matchesSearchQuery } from './searchMatching'

describe('matchesSearchQuery', () => {
  it('ひらがな・カタカナが混ざった名前も，表記の違いを無視して一致させる', () => {
    // Act
    const isMatched = matchesSearchQuery({ name: 'アオサギの巣', tags: [], query: 'あおさぎの' })

    // Assert
    expect(isMatched).toBe(true)
  })

  it('半角カナ・全角英字で保存された名前にも一致させる', () => {
    // Act
    const isMatchedKana = matchesSearchQuery({ name: 'ｺﾅﾗ', tags: [], query: 'こなら' })
    const isMatchedAlphabet = matchesSearchQuery({ name: 'ＡＢＣの木', tags: [], query: 'abc' })

    // Assert
    expect(isMatchedKana).toBe(true)
    expect(isMatchedAlphabet).toBe(true)
  })

  it('タグに検索語を含む場合も一致させる', () => {
    // Act
    const isMatched = matchesSearchQuery({ name: 'クヌギ', tags: ['どんぐり'], query: 'ドング' })

    // Assert
    expect(isMatched).toBe(true)
  })

  it('名前が分からない記録はタグだけで判定する', () => {
    // Act
    const isMatched = matchesSearchQuery({ name: null, tags: ['石英'], query: '石' })

    // Assert
    expect(isMatched).toBe(true)
  })

  it('名前にもタグにも検索語を含まない場合は一致させない', () => {
    // Act
    const isMatched = matchesSearchQuery({ name: 'コナラ', tags: ['秋'], query: 'くぬぎ' })

    // Assert
    expect(isMatched).toBe(false)
  })

  it('検索語が空白だけの場合は一致させない', () => {
    // Act
    const isMatched = matchesSearchQuery({ name: 'コナラ', tags: [], query: '  ' })

    // Assert
    expect(isMatched).toBe(false)
  })
})
