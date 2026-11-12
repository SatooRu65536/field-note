import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

export interface NewRecordSearch {
  // 地図で指定した発見場所．指定がない場合は省略する
  readonly latitude?: number
  readonly longitude?: number
}

/**
 * 記録の追加画面の URL の検索パラメータを検証する
 * @param search URL の検索パラメータ
 * @returns 発見場所．緯度・経度の両方が有効な数値の場合のみ含める
 */
export function parseNewRecordSearch(search: Record<string, unknown>): NewRecordSearch {
  const latitude = Number(search.latitude)
  const longitude = Number(search.longitude)
  if (search.latitude === undefined || search.longitude === undefined) return {}
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return {}
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return {}
  return { latitude, longitude }
}

/**
 * 検索パラメータから発見場所の座標を取り出す
 * @param search 検証済みの検索パラメータ
 * @returns 座標．指定がない場合は null
 */
export function toInitialLocation(search: NewRecordSearch): Coordinates | null {
  if (search.latitude === undefined || search.longitude === undefined) return null
  return { latitude: search.latitude, longitude: search.longitude }
}
