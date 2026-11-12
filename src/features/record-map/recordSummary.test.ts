import { describe, expect, it } from 'vitest'

import { toRecordSummary } from './recordSummary'

const RECORD = {
  id: 'record-1',
  name: 'コナラ',
  categoryId: 'seed',
  latitude: 35.17,
  longitude: 136.88,
  discoveredAt: new Date(2026, 10, 13),
  memo: '',
  isPublic: true,
  tags: [],
  nameMemo: '',
  photoIds: ['photo-1', 'photo-2'],
  updatedAt: new Date(2026, 10, 14),
}

describe('toRecordSummary', () => {
  it('最初の写真をサムネイルにする', () => {
    // Act
    const summary = toRecordSummary(RECORD)

    // Assert
    expect(summary).toEqual({
      id: 'record-1',
      name: 'コナラ',
      categoryId: 'seed',
      latitude: 35.17,
      longitude: 136.88,
      discoveredAt: new Date(2026, 10, 13),
      isPublic: true,
      thumbnailPhotoId: 'photo-1',
    })
  })

  it('写真がない場合はサムネイルを null にする', () => {
    // Act
    const summary = toRecordSummary({ ...RECORD, photoIds: [] })

    // Assert
    expect(summary.thumbnailPhotoId).toBeNull()
  })
})
