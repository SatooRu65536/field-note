import { z } from 'zod'

import { MAX_ZOOM, MIN_ZOOM } from '@/integrations/maplibre/constants'

const STORAGE_KEY = 'field-note:record-map-view'

export interface MapView {
  readonly latitude: number
  readonly longitude: number
  readonly zoom: number
}

const MAP_VIEW_SCHEMA = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  zoom: z.number().min(MIN_ZOOM).max(MAX_ZOOM),
})

/**
 * 保存した文字列を，地図の表示位置として検証する
 * @param value 保存した文字列
 * @returns 表示位置．保存していない場合や形式が不正な場合は null
 */
export function parseMapView(value: string | null): MapView | null {
  if (value === null) return null
  try {
    const result = MAP_VIEW_SCHEMA.safeParse(JSON.parse(value))
    return result.success ? result.data : null
  } catch {
    // 保存した値が壊れている場合は，保存していないものとして初期表示に戻す
    return null
  }
}

/**
 * 前回の地図の表示位置を読み込む
 * @returns 表示位置．保存していない場合や読み込めない場合は null
 */
export function loadMapView(): MapView | null {
  if (typeof localStorage === 'undefined') return null
  return parseMapView(localStorage.getItem(STORAGE_KEY))
}

/**
 * 地図の表示位置を保存する
 * @param view 表示位置
 */
export function saveMapView(view: MapView): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(view))
  } catch (error) {
    // プライベートブラウズなどで保存できなくても，地図は使えるため処理を続ける
    console.warn('地図の表示位置を保存できませんでした', error)
  }
}
