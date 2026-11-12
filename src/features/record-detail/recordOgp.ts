import { SITE_NAME, SITE_OGP_IMAGE_PATH } from '@/constants/site'
import { formatDiscoveredAt } from '@/integrations/field-note-api/discoveredAt'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'
import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordDetail } from '@/integrations/field-note-api/records'

// SNS のカードで省略されにくい，説明に含めるメモの上限文字数
const MAX_MEMO_EXCERPT_LENGTH = 80

export interface RecordOgp {
  readonly title: string
  readonly description: string
  readonly imagePath: string
}

/**
 * 記録を共有するときのタイトル・説明・画像を作成する
 * @param record 記録
 * @returns タイトルは記録名とサイト名，説明は発見日とメモの冒頭，画像は1枚目の写真．写真がない場合はサイトの共有用の画像
 */
export function createRecordOgp(
  record: Pick<RecordDetail, 'name' | 'discoveredAt' | 'memo' | 'photoIds'>,
): RecordOgp {
  const discovered = record.discoveredAt
    ? `${formatDiscoveredAt(record.discoveredAt)} に発見`
    : formatDiscoveredAt(record.discoveredAt)
  const memo = record.memo.replace(/\s+/g, ' ').trim()
  const excerpt =
    memo.length > MAX_MEMO_EXCERPT_LENGTH ? `${memo.slice(0, MAX_MEMO_EXCERPT_LENGTH)}…` : memo
  const [firstPhotoId] = record.photoIds

  return {
    title: `${formatRecordName(record.name)} | ${SITE_NAME}`,
    description: excerpt === '' ? discovered : `${discovered}．${excerpt}`,
    imagePath: firstPhotoId ? createPhotoUrl(firstPhotoId) : SITE_OGP_IMAGE_PATH,
  }
}
