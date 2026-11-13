import { describe, expect, it } from 'vitest'

import type { RecordSummary } from '@/integrations/field-note-api/records'

import { filterRecordsByName } from './recordSearch'

function createRecord({ id, name }: { id: string; name: string | null }): RecordSummary {
  return {
    id,
    name,
    categoryId: 'seed',
    latitude: 35,
    longitude: 136,
    discoveredAt: new Date('2026-11-13T00:00:00.000Z'),
    isPublic: true,
    thumbnailPhotoId: null,
    referencePhotoId: null,
  }
}

const RECORDS = [
  createRecord({ id: 'konara', name: 'コナラ' }),
  createRecord({ id: 'kunugi', name: 'クヌギ' }),
  createRecord({ id: 'unknown', name: null }),
]

describe('filterRecordsByName', () => {
  it('検索語が空白だけの場合はすべての記録を返す', () => {
    // Arrange
    const query = '  '

    // Act
    const filtered = filterRecordsByName({ records: RECORDS, query })

    // Assert
    expect(filtered).toEqual(RECORDS)
  })

  it('ひらがな・カタカナの違いを無視して名前の一部で絞り込む', () => {
    // Arrange
    const query = 'こな'

    // Act
    const filtered = filterRecordsByName({ records: RECORDS, query })

    // Assert
    expect(filtered.map(({ id }) => id)).toEqual(['konara'])
  })

  it('名前が分からない記録は表示する名前の「名前不明」で探せる', () => {
    // Arrange
    const query = '不明'

    // Act
    const filtered = filterRecordsByName({ records: RECORDS, query })

    // Assert
    expect(filtered.map(({ id }) => id)).toEqual(['unknown'])
  })
})
