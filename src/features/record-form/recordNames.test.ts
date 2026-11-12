import { describe, expect, it } from 'vitest'

import { getLastName, replaceLastName, splitRecordNames } from './recordNames'

describe('splitRecordNames', () => {
  it('全角・半角のカンマと読点で区切る', () => {
    // Act
    const names = splitRecordNames('サッパ，シロギス,ハゼ、メバル')

    // Assert
    expect(names).toEqual(['サッパ', 'シロギス', 'ハゼ', 'メバル'])
  })

  it('前後の空白・空の名前・重複を取り除く', () => {
    // Act
    const names = splitRecordNames(' サッパ ，，シロギス，サッパ，')

    // Assert
    expect(names).toEqual(['サッパ', 'シロギス'])
  })

  it('区切り文字がない場合は1つの名前にする', () => {
    // Act
    const names = splitRecordNames('コナラ')

    // Assert
    expect(names).toEqual(['コナラ'])
  })
})

describe('getLastName', () => {
  it('最後の区切り文字より後ろを返す', () => {
    // Act
    const lastName = getLastName('サッパ，シロ')

    // Assert
    expect(lastName).toBe('シロ')
  })

  it('区切り文字がない場合は入力全体を返す', () => {
    // Act
    const lastName = getLastName('サッ')

    // Assert
    expect(lastName).toBe('サッ')
  })
})

describe('replaceLastName', () => {
  it('最後の名前だけを候補に置き換える', () => {
    // Act
    const input = replaceLastName({ input: 'サッパ，シロ', name: 'シロギス' })

    // Assert
    expect(input).toBe('サッパ，シロギス')
  })

  it('区切り文字の直後に空白がある場合も，空白ごと置き換える', () => {
    // Act
    const input = replaceLastName({ input: 'サッパ, しろ', name: 'シロギス' })

    // Assert
    expect(input).toBe('サッパ,シロギス')
  })
})
