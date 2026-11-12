import { describe, expect, it } from 'vitest'

import { parseDateInputValue, toDateInputValue } from './dateInput'

describe('toDateInputValue', () => {
  it('ローカルタイムの年月日をゼロ埋めした形式で返し，時刻は含めない', () => {
    // Arrange
    const date = new Date(2026, 0, 2, 23, 59)

    // Act
    const value = toDateInputValue(date)

    // Assert
    expect(value).toBe('2026-01-02')
  })
})

describe('parseDateInputValue', () => {
  it('ローカルタイムのその日の0時を返す', () => {
    // Act
    const date = parseDateInputValue('2026-11-13')

    // Assert
    expect(date).toEqual(new Date(2026, 10, 13))
  })

  it.each([
    ['空文字', ''],
    ['時刻を含む', '2026-11-13T09:30'],
    ['存在しない日付', '2026-02-30'],
  ])('%sの場合は null を返す', (_, value) => {
    // Act
    const date = parseDateInputValue(value)

    // Assert
    expect(date).toBeNull()
  })
})
