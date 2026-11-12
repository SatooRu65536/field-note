import type { Bounds } from '@/integrations/field-note-api/records'

// 表示範囲ぴったりだと地図の端でピンが急に消えるため，範囲の外側にも余白を持たせる
const BOUNDS_PADDING_RATIO = 0.5

function clamp({ value, min, max }: { value: number; min: number; max: number }): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 地図の表示範囲に余白を加え，緯度経度として有効な範囲に収める
 * @param bounds 地図の表示範囲
 * @returns 余白を加えた範囲
 */
export function toPaddedBounds(bounds: Bounds): Bounds {
  const longitudePadding = (bounds.east - bounds.west) * BOUNDS_PADDING_RATIO
  const latitudePadding = (bounds.north - bounds.south) * BOUNDS_PADDING_RATIO

  return {
    west: clamp({ value: bounds.west - longitudePadding, min: -180, max: 180 }),
    east: clamp({ value: bounds.east + longitudePadding, min: -180, max: 180 }),
    south: clamp({ value: bounds.south - latitudePadding, min: -90, max: 90 }),
    north: clamp({ value: bounds.north + latitudePadding, min: -90, max: 90 }),
  }
}
