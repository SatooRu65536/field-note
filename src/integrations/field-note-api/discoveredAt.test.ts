import { describe, expect, it } from 'vitest'

import { formatDiscoveredAt } from './discoveredAt'

describe('formatDiscoveredAt', () => {
  it('発見日を日本時間の日付だけで表し，時刻は含めない', () => {
    // Act
    const text = formatDiscoveredAt(new Date('2026-11-12T16:30:00Z'))

    // Assert
    expect(text).toBe('2026/11/13')
  })

  it('まだ発見していない記録は「未発見」と表す', () => {
    // Act
    const text = formatDiscoveredAt(null)

    // Assert
    expect(text).toBe('未発見')
  })
})
