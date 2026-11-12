import { describe, expect, it } from 'vitest'

import { createRecordLabel } from './recordLabel'

describe('createRecordLabel', () => {
  it('発見した記録は名前だけにする', () => {
    // Act
    const label = createRecordLabel({ name: 'コナラ', discoveredAt: new Date(2026, 10, 13) })

    // Assert
    expect(label).toBe('コナラ')
  })

  it('まだ発見していない記録は「（未発見）」を付ける', () => {
    // Act
    const label = createRecordLabel({ name: null, discoveredAt: null })

    // Assert
    expect(label).toBe('名前不明（未発見）')
  })
})
