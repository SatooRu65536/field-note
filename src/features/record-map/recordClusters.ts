import Supercluster from 'supercluster'

import type { Bounds, RecordSummary } from '@/integrations/field-note-api/records'
import { MAX_ZOOM } from '@/integrations/maplibre/constants'

// 地図の最大ズームまでまとめ，最大まで拡大しても重なる記録を見分けられるようにする
export const CLUSTER_MAX_ZOOM = MAX_ZOOM

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
  | {
      // 最大まで拡大しても重なるため，中心から広げて表示する記録
      readonly type: 'spider'
      readonly clusterId: number
      readonly latitude: number
      readonly longitude: number
      readonly records: readonly RecordSummary[]
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
 * @returns 1件ずつ表示する記録，まとめて表示する記録のまとまり，最大まで拡大しても重なるため広げて表示する記録
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
      const expansionZoom = index.getClusterExpansionZoom(clusterId)
      // 最大まで拡大しても分かれないまとまりは，最大まで拡大したときだけ広げ，それまでは件数で表示する
      if (expansionZoom > CLUSTER_MAX_ZOOM && Math.floor(zoom) >= CLUSTER_MAX_ZOOM) {
        return {
          type: 'spider',
          clusterId,
          latitude,
          longitude,
          records: index.getLeaves(clusterId, Infinity).map(({ properties }) => properties.record),
        }
      }
      return {
        type: 'cluster',
        clusterId,
        latitude,
        longitude,
        recordCount: feature.properties.point_count,
        expansionZoom,
      }
    })
}
