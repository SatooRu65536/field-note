import type { RecordSummary } from '@/integrations/field-note-api/records'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

const EARTH_RADIUS_METERS = 6371000

/**
 * 2地点間の距離を求める
 * @param from 出発地点
 * @param to 到着地点
 * @returns 球面上の距離（メートル）
 */
export function calculateDistanceMeters({
  from,
  to,
}: {
  from: Coordinates
  to: Coordinates
}): number {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180
  const latitudeDelta = toRadians(to.latitude - from.latitude)
  const longitudeDelta = toRadians(to.longitude - from.longitude)
  // 近い地点どうしでも誤差が小さいハーバサインの公式を使う
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine))
}

/**
 * 指定した地点から最も近い記録を探す
 * @param records 探す対象の記録
 * @param center 基準の地点
 * @returns 最も近い記録．記録がない場合は null
 */
export function findNearestRecord({
  records,
  center,
}: {
  records: readonly RecordSummary[]
  center: Coordinates
}): RecordSummary | null {
  return records.reduce<{ record: RecordSummary; distance: number } | null>((nearest, record) => {
    const distance = calculateDistanceMeters({ from: center, to: record })
    return nearest === null || distance < nearest.distance ? { record, distance } : nearest
  }, null)?.record ?? null
}
