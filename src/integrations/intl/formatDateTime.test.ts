import { describe, expect, it } from 'vitest'

import { formatDate, formatDateTime } from './formatDateTime'

// 2026-11-12T16:30:00Z は日本時間で 2026年11月13日 1:30
const DATE = new Date('2026-11-12T16:30:00Z')

describe('formatDateTime', () => {
  it('実行環境のタイムゾーンによらず日本時間の年月日・時分で表す', () => {
    // Act
    const formatted = formatDateTime(DATE)

    // Assert
    expect(formatted).toBe('2026年11月13日 01:30')
  })
})

describe('formatDate', () => {
  it('実行環境のタイムゾーンによらず日本時間の年/月/日で表す', () => {
    // Act
    const formatted = formatDate(DATE)

    // Assert
    expect(formatted).toBe('2026/11/13')
  })
})
