import type { RecordDetail, RecordSummary } from '@/integrations/field-note-api/records'

/**
 * 記録の詳細を，地図のカードに表示する一覧用の形に変換する
 * @param record 記録の詳細
 * @returns 一覧用の記録．サムネイルは最初の写真にする
 */
export function toRecordSummary(record: RecordDetail): RecordSummary {
  return {
    id: record.id,
    name: record.name,
    categoryId: record.categoryId,
    latitude: record.latitude,
    longitude: record.longitude,
    discoveredAt: record.discoveredAt,
    isPublic: record.isPublic,
    thumbnailPhotoId: record.photoIds[0] ?? null,
  }
}
