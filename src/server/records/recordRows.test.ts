import { describe, expect, it } from 'vitest'

import { toRecordSummary } from './recordRows'

const ROW = {
  id: 'record-1',
  name: 'コナラ',
  categoryId: 'seed',
  latitude: 35.17,
  longitude: 136.88,
  discoveredAt: new Date(2026, 10, 13),
  isPublic: true,
  isDiscovered: true,
  thumbnailPhotoId: null,
}

describe('toRecordSummary', () => {
  it('発見した記録は発見した日を残す', () => {
    // Act
    const summary = toRecordSummary(ROW)

    // Assert
    expect(summary).toEqual({
      id: 'record-1',
      name: 'コナラ',
      categoryId: 'seed',
      latitude: 35.17,
      longitude: 136.88,
      discoveredAt: new Date(2026, 10, 13),
      isPublic: true,
      thumbnailPhotoId: null,
      referencePhotoId: null,
    })
  })

  it('まだ発見していない記録は発見した日を null にする', () => {
    // Act
    const summary = toRecordSummary({ ...ROW, isDiscovered: false })

    // Assert
    expect(summary.discoveredAt).toBeNull()
  })
})
