import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

/**
 * 入力された緯度・経度の文字列を座標に変換する
 * @param latitude 緯度の入力値
 * @param longitude 経度の入力値
 * @returns 座標．空欄・数値でない・範囲外の場合は null
 */
export function parseCoordinates({
  latitude,
  longitude,
}: {
  latitude: string
  longitude: string
}): Coordinates | null {
  if (latitude.trim() === '' || longitude.trim() === '') return null
  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)
  if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) return null
  if (Math.abs(parsedLatitude) > 90 || Math.abs(parsedLongitude) > 180) return null
  return { latitude: parsedLatitude, longitude: parsedLongitude }
}
