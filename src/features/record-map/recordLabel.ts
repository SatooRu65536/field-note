import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordSummary } from '@/integrations/field-note-api/records'

/**
 * 地図のピンを読み上げるときの名前を作成する
 * @param record 記録
 * @returns 記録の名前．まだ発見していない記録は「（未発見）」を付ける
 */
export function createRecordLabel(record: Pick<RecordSummary, 'name' | 'discoveredAt'>): string {
  const name = formatRecordName(record.name)
  return record.discoveredAt ? name : `${name}（未発見）`
}
