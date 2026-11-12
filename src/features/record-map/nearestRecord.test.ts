import { describe, expect, it } from 'vitest'

import type { RecordSummary } from '@/integrations/field-note-api/records'

import { calculateDistanceMeters, findNearestRecord } from './nearestRecord'

/**
 * 指定した位置の記録を作成する
 * @param id 記録の ID
 * @param latitude 緯度
 * @param longitude 経度
 * @returns 記録
 */
function createRecord({
  id,
  latitude,
  longitude,
}: {
  id: string
  latitude: number
  longitude: number
}): RecordSummary {
  return {
    id,
    name: null,
    categoryId: 'plant',
    latitude,
    longitude,
    discoveredAt: new Date(2026, 10, 13),
    isPublic: true,
    thumbnailPhotoId: null,
  }
}

describe('calculateDistanceMeters', () => {
  it('経度1度ぶんの赤道上の距離を約111km と求める', () => {
    // Act
    const distance = calculateDistanceMeters({
      from: { latitude: 0, longitude: 0 },
      to: { latitude: 0, longitude: 1 },
    })

    // Assert
    expect(distance).toBeCloseTo(111195, -1)
  })

  it('同じ地点の距離は 0 にする', () => {
    // Act
    const distance = calculateDistanceMeters({
      from: { latitude: 35, longitude: 136 },
      to: { latitude: 35, longitude: 136 },
    })

    // Assert
    expect(distance).toBe(0)
  })
})

describe('findNearestRecord', () => {
  it('基準の地点から最も近い記録を返す', () => {
    // Arrange
    const records = [
      createRecord({ id: 'far', latitude: 35.5, longitude: 137 }),
      createRecord({ id: 'near', latitude: 35.18, longitude: 136.9 }),
    ]

    // Act
    const nearest = findNearestRecord({ records, center: { latitude: 35.17, longitude: 136.88 } })

    // Assert
    expect(nearest?.id).toBe('near')
  })

  it('記録がない場合は null を返す', () => {
    // Act
    const nearest = findNearestRecord({ records: [], center: { latitude: 35, longitude: 136 } })

    // Assert
    expect(nearest).toBeNull()
  })
})
