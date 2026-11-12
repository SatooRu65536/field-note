import { describe, expect, it } from 'vitest'

import { parseDateTimeLocalValue, toDateTimeLocalValue } from './dateTimeLocal'

describe('toDateTimeLocalValue', () => {
  it('ローカルタイムの年月日・時分をゼロ埋めした形式で返す', () => {
    // Arrange
    const date = new Date(2026, 0, 2, 3, 4, 59)

    // Act
    const value = toDateTimeLocalValue(date)

    // Assert
    expect(value).toBe('2026-01-02T03:04')
  })
})

describe('parseDateTimeLocalValue', () => {
  it('ローカルタイムとして解釈した日時を返す', () => {
    // Arrange
    const value = '2026-11-13T09:30'

    // Act
    const date = parseDateTimeLocalValue(value)

    // Assert
    expect(date).toEqual(new Date(2026, 10, 13, 9, 30))
  })

  it.each([
    ['空文字', ''],
    ['秒を含む', '2026-11-13T09:30:00'],
    ['存在しない日付', '2026-02-30T09:30'],
    ['存在しない時刻', '2026-11-13T24:00'],
  ])('%sの場合は null を返す', (_, value) => {
    // Act
    const date = parseDateTimeLocalValue(value)

    // Assert
    expect(date).toBeNull()
  })
})
