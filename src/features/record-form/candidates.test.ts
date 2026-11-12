import { describe, expect, it } from 'vitest'

import { filterNameSuggestions, findSavedNameMemo, MAX_NAME_SUGGESTIONS } from './candidates'

const CANDIDATES = [
  { name: 'コナラ', recordCount: 5 },
  { name: 'こならの実', recordCount: 3 },
  { name: 'クヌギ', recordCount: 2 },
  { name: 'ナラガシワ', recordCount: 1 },
]

const MEMOS = [{ nameKey: 'こなら', memo: 'ブナ科の落葉高木' }]

describe('filterNameSuggestions', () => {
  it('ひらがな・カタカナの違いを無視して前方一致する名前を，元の順で返す', () => {
    // Act
    const suggestions = filterNameSuggestions({ candidates: CANDIDATES, input: 'こな' })

    // Assert
    expect(suggestions).toEqual(['コナラ', 'こならの実'])
  })

  it('途中に含むだけの名前は返さない', () => {
    // Act
    const suggestions = filterNameSuggestions({ candidates: CANDIDATES, input: 'なら' })

    // Assert
    expect(suggestions).toEqual(['ナラガシワ'])
  })

  it('入力が空白だけの場合は候補を返さない', () => {
    // Act
    const suggestions = filterNameSuggestions({ candidates: CANDIDATES, input: '  ' })

    // Assert
    expect(suggestions).toEqual([])
  })

  it('入力と同じ名前は候補に含めない', () => {
    // Act
    const suggestions = filterNameSuggestions({ candidates: CANDIDATES, input: 'コナラ' })

    // Assert
    expect(suggestions).toEqual(['こならの実'])
  })

  it('候補は上限の件数までにする', () => {
    // Arrange
    const candidates = Array.from({ length: MAX_NAME_SUGGESTIONS + 1 }, (_, index) => ({
      name: `イチョウ${index}`,
      recordCount: 1,
    }))

    // Act
    const suggestions = filterNameSuggestions({ candidates, input: 'い' })

    // Assert
    expect(suggestions).toHaveLength(MAX_NAME_SUGGESTIONS)
  })
})

describe('findSavedNameMemo', () => {
  it('ひらがな・カタカナの違いを無視して同じ名前のメモを返す', () => {
    // Act
    const memo = findSavedNameMemo({ memos: MEMOS, name: 'コナラ' })

    // Assert
    expect(memo).toBe('ブナ科の落葉高木')
  })

  it('同じ名前がない場合は空文字を返す', () => {
    // Act
    const memo = findSavedNameMemo({ memos: MEMOS, name: 'イチョウ' })

    // Assert
    expect(memo).toBe('')
  })
})
