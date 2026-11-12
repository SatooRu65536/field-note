import { MAX_ZOOM, MIN_ZOOM } from '@/integrations/maplibre/constants'

import type { MapView } from './mapViewStorage'

export interface MapSearch {
  readonly lat?: number
  readonly lng?: number
  readonly zoom?: number
  // 選択した状態で開く記録の ID
  readonly record?: string
}

// URL を短く保ちつつ，1m 程度の精度を残す小数点以下の桁数
const COORDINATE_FRACTION_DIGITS = 5
const ZOOM_FRACTION_DIGITS = 2

/**
 * 検索パラメータの値を，範囲内の数値として読み取る
 * @param value 検索パラメータの値
 * @param min 最小値
 * @param max 最大値
 * @returns 数値．空・数値でない・範囲外の場合は undefined
 */
function parseNumberInRange({
  value,
  min,
  max,
}: {
  value: unknown
  min: number
  max: number
}): number | undefined {
  if (typeof value !== 'number' && (typeof value !== 'string' || value.trim() === '')) {
    return undefined
  }
  const number = Number(value)
  return Number.isFinite(number) && number >= min && number <= max ? number : undefined
}

/**
 * 地図画面の URL の検索パラメータを検証する
 * @param search URL の検索パラメータ
 * @returns 表示位置と選択する記録．表示位置は緯度・経度・ズームがすべて有効な場合のみ含める
 */
export function parseMapSearch(search: Record<string, unknown>): MapSearch {
  const lat = parseNumberInRange({ value: search.lat, min: -90, max: 90 })
  const lng = parseNumberInRange({ value: search.lng, min: -180, max: 180 })
  const zoom = parseNumberInRange({ value: search.zoom, min: MIN_ZOOM, max: MAX_ZOOM })
  const record =
    typeof search.record === 'string' && search.record !== '' ? search.record : undefined
  const hasView = lat !== undefined && lng !== undefined && zoom !== undefined
  return {
    ...(hasView ? { lat, lng, zoom } : {}),
    ...(record ? { record } : {}),
  }
}

/**
 * 検索パラメータから地図の表示位置を取り出す
 * @param search 検証済みの検索パラメータ
 * @returns 表示位置．指定がない場合は null
 */
export function toMapView(search: MapSearch): MapView | null {
  if (search.lat === undefined || search.lng === undefined || search.zoom === undefined) {
    return null
  }
  return { latitude: search.lat, longitude: search.lng, zoom: search.zoom }
}

/**
 * 表示位置と選択中の記録を共有する URL を作成する
 * @param origin アプリのオリジン
 * @param view 地図の表示位置
 * @param recordId 選択中の記録の ID．選択していない場合は null
 * @returns 地図画面の URL
 */
export function createMapShareUrl({
  origin,
  view,
  recordId,
}: {
  origin: string
  view: MapView
  recordId: string | null
}): string {
  const url = new URL('/', origin)
  url.searchParams.set('lat', view.latitude.toFixed(COORDINATE_FRACTION_DIGITS))
  url.searchParams.set('lng', view.longitude.toFixed(COORDINATE_FRACTION_DIGITS))
  url.searchParams.set('zoom', view.zoom.toFixed(ZOOM_FRACTION_DIGITS))
  if (recordId) url.searchParams.set('record', recordId)
  return url.toString()
}
