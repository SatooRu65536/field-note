import Supercluster from 'supercluster'

import type { Bounds, RecordSummary } from '@/integrations/field-note-api/records'

// これより拡大した地図では，近い記録もまとめずに1件ずつ表示する
export const CLUSTER_MAX_ZOOM = 16

// ピンの大きさに合わせ，重なって見える距離の記録をまとめる
const CLUSTER_RADIUS_PIXELS = 50

interface RecordProperties {
  readonly record: RecordSummary
}

export type RecordClusterIndex = Supercluster<RecordProperties>

export type RecordMapItem =
  | { readonly type: 'record'; readonly record: RecordSummary }
  | {
      readonly type: 'cluster'
      readonly clusterId: number
      readonly latitude: number
      readonly longitude: number
      readonly recordCount: number
      // まとまりを押したときに，中の記録が分かれて見えるズームレベル
      readonly expansionZoom: number
    }

/**
 * 記録を，近いもの同士をまとめるための索引に登録する
 * @param records 地図に表示する記録
 * @returns まとめるための索引
 */
export function createRecordClusterIndex(records: readonly RecordSummary[]): RecordClusterIndex {
  const index = new Supercluster<RecordProperties>({
    radius: CLUSTER_RADIUS_PIXELS,
    maxZoom: CLUSTER_MAX_ZOOM,
  })
  return index.load(
    records.map((record) => ({
      type: 'Feature',
      // GeoJSON のため経度・緯度の順
      geometry: { type: 'Point', coordinates: [record.longitude, record.latitude] },
      properties: { record },
    })),
  )
}

/**
 * 表示範囲とズームレベルに応じて，近い記録をまとめた地図の表示内容を作成する
 * @param index createRecordClusterIndex で作成した索引
 * @param bounds 地図の表示範囲
 * @param zoom 地図のズームレベル
 * @returns 1件ずつ表示する記録と，まとめて表示する記録のまとまり
 */
export function getRecordMapItems({
  index,
  bounds,
  zoom,
}: {
  index: RecordClusterIndex
  bounds: Bounds
  zoom: number
}): readonly RecordMapItem[] {
  return index
    .getClusters([bounds.west, bounds.south, bounds.east, bounds.north], Math.floor(zoom))
    .map((feature): RecordMapItem => {
      const [longitude = 0, latitude = 0] = feature.geometry.coordinates
      if (!('cluster' in feature.properties)) {
        return { type: 'record', record: feature.properties.record }
      }
      const clusterId = feature.properties.cluster_id
      return {
        type: 'cluster',
        clusterId,
        latitude,
        longitude,
        recordCount: feature.properties.point_count,
        expansionZoom: index.getClusterExpansionZoom(clusterId),
      }
    })
}
