import { describe, expect, it } from 'vitest'

import { createRecordLabel } from './recordLabel'

describe('createRecordLabel', () => {
  it('実際に確認した記録は名前だけにする', () => {
    // Act
    const label = createRecordLabel({ name: 'コナラ', isConfirmed: true })

    // Assert
    expect(label).toBe('コナラ')
  })

  it('実際には確認していない記録は「（未確認）」を付ける', () => {
    // Act
    const label = createRecordLabel({ name: null, isConfirmed: false })

    // Assert
    expect(label).toBe('名前不明（未確認）')
  })
})
