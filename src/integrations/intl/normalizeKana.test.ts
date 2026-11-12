import { describe, expect, it } from 'vitest'

import { normalizeKana, toKatakana } from './normalizeKana'

describe('normalizeKana', () => {
  it('カタカナをひらがなに揃える', () => {
    // Act
    const normalized = normalizeKana('コナラ')

    // Assert
    expect(normalized).toBe('こなら')
  })

  it('半角カタカナを全角に直してからひらがなに揃える', () => {
    // Act
    const normalized = normalizeKana('ｺﾅﾗ')

    // Assert
    expect(normalized).toBe('こなら')
  })

  it('前後の空白を除き，英字を小文字に揃える', () => {
    // Act
    const normalized = normalizeKana(' Ｍａｐｌｅ ')

    // Assert
    expect(normalized).toBe('maple')
  })

  it('長音記号と漢字は変えない', () => {
    // Act
    const normalized = normalizeKana('ドングリー（団栗）')

    // Assert
    expect(normalized).toBe('どんぐりー(団栗)')
  })
})

describe('toKatakana', () => {
  it('ひらがなをカタカナにし，それ以外は変えない', () => {
    // Act
    const katakana = toKatakana('こならの実ー')

    // Assert
    expect(katakana).toBe('コナラノ実ー')
  })
})
