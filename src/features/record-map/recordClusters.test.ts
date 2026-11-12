import { describe, expect, it } from 'vitest'

import type { RecordSummary } from '@/integrations/field-note-api/records'

import { CLUSTER_MAX_ZOOM, createRecordClusterIndex, getRecordMapItems } from './recordClusters'

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

const JAPAN = { west: 122, east: 154, south: 20, north: 46 }

// 名古屋駅付近で約 10m 離れた2件と，東京駅付近の1件
const RECORDS = [
  createRecord({ id: 'nagoya-1', latitude: 35.1709, longitude: 136.8815 }),
  createRecord({ id: 'nagoya-2', latitude: 35.1710, longitude: 136.8816 }),
  createRecord({ id: 'tokyo', latitude: 35.6812, longitude: 139.7671 }),
]

describe('getRecordMapItems', () => {
  it('縮小した地図では，近い記録を件数つきの1つのまとまりにする', () => {
    // Arrange
    const index = createRecordClusterIndex(RECORDS)

    // Act
    const items = getRecordMapItems({ index, bounds: JAPAN, zoom: 10 })

    // Assert
    const clusters = items.filter((item) => item.type === 'cluster')
    const records = items.flatMap((item) => (item.type === 'record' ? [item.record.id] : []))
    expect(clusters).toHaveLength(1)
    expect(clusters[0]).toMatchObject({ recordCount: 2 })
    expect(records).toEqual(['tokyo'])
  })

  it('まとまりを押したときのズームは，今より拡大したズームにする', () => {
    // Arrange
    const index = createRecordClusterIndex(RECORDS)

    // Act
    const [cluster] = getRecordMapItems({ index, bounds: JAPAN, zoom: 10 }).filter(
      (item) => item.type === 'cluster',
    )

    // Assert
    expect(cluster?.type === 'cluster' && cluster.expansionZoom).toBeGreaterThan(10)
  })

  it('まとめる上限より拡大した地図では，すべての記録を1件ずつ表示する', () => {
    // Arrange
    const index = createRecordClusterIndex(RECORDS)

    // Act
    const items = getRecordMapItems({ index, bounds: JAPAN, zoom: CLUSTER_MAX_ZOOM + 1 })

    // Assert
    expect(items.every((item) => item.type === 'record')).toBe(true)
    expect(items).toHaveLength(3)
  })

  it('表示範囲の外の記録は含めない', () => {
    // Arrange
    const index = createRecordClusterIndex(RECORDS)
    const aroundTokyo = { west: 139, east: 140.5, south: 35, north: 36 }

    // Act
    const items = getRecordMapItems({ index, bounds: aroundTokyo, zoom: 10 })

    // Assert
    expect(items.map((item) => (item.type === 'record' ? item.record.id : 'cluster'))).toEqual([
      'tokyo',
    ])
  })
})
