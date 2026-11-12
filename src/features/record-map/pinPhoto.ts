import type { RecordSummary } from '@/integrations/field-note-api/records'

/**
 * 地図のピンに表示する写真を選ぶ
 * @param record 記録
 * @returns 記録の写真．写真のない未発見の記録は同じ名前の記録の写真．どちらもない場合は null
 */
export function selectPinPhotoId(
  record: Pick<RecordSummary, 'thumbnailPhotoId' | 'referencePhotoId'>,
): string | null {
  return record.thumbnailPhotoId ?? record.referencePhotoId
}
