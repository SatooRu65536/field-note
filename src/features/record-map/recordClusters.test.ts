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

// 名古屋駅付近で約 3m 離れ，最大まで拡大しても重なる2件と，東京駅付近の1件
const RECORDS = [
  createRecord({ id: 'nagoya-1', latitude: 35.17090, longitude: 136.88150 }),
  createRecord({ id: 'nagoya-2', latitude: 35.17092, longitude: 136.88152 }),
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

  it('最大まで拡大しても重なる記録は，広げて表示する記録としてまとめる', () => {
    // Arrange
    const index = createRecordClusterIndex(RECORDS)

    // Act
    const items = getRecordMapItems({ index, bounds: JAPAN, zoom: CLUSTER_MAX_ZOOM })

    // Assert
    const spider = items.find((item) => item.type === 'spider')
    expect(spider?.type === 'spider' && spider.records.map(({ id }) => id).sort()).toEqual([
      'nagoya-1',
      'nagoya-2',
    ])
    expect(items.flatMap((item) => (item.type === 'record' ? [item.record.id] : []))).toEqual([
      'tokyo',
    ])
  })

  it('最大まで拡大すれば分かれる記録は，広げずに1件ずつ表示する', () => {
    // Arrange
    const records = [
      createRecord({ id: 'a', latitude: 35.17, longitude: 136.88 }),
      createRecord({ id: 'b', latitude: 35.171, longitude: 136.881 }),
    ]
    const index = createRecordClusterIndex(records)

    // Act
    const items = getRecordMapItems({ index, bounds: JAPAN, zoom: CLUSTER_MAX_ZOOM })

    // Assert
    expect(items.map((item) => item.type)).toEqual(['record', 'record'])
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
