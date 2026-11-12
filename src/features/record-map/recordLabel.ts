import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordSummary } from '@/integrations/field-note-api/records'

/**
 * 地図のピンを読み上げるときの名前を作成する
 * @param record 記録
 * @returns 記録の名前．実際には確認していない記録は「（未確認）」を付ける
 */
export function createRecordLabel(record: Pick<RecordSummary, 'name' | 'isConfirmed'>): string {
  const name = formatRecordName(record.name)
  return record.isConfirmed ? name : `${name}（未確認）`
}
