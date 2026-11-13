import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import { normalizeKana } from '@/integrations/intl/normalizeKana'

/**
 * 表示する名前に検索語を含む記録に絞り込む．名前が分からない記録は「名前不明」で探せる
 * @param records 記録
 * @param query 検索語．ひらがな・カタカナ，全角・半角，大文字・小文字の違いは無視する
 * @returns 表示する名前に検索語を含む記録．検索語が空の場合はすべての記録
 */
export function filterRecordsByName({
  records,
  query,
}: {
  records: readonly RecordSummary[]
  query: string
}): readonly RecordSummary[] {
  const normalizedQuery = normalizeKana(query)
  if (normalizedQuery === '') return records
  return records.filter(({ name }) =>
    normalizeKana(formatRecordName(name)).includes(normalizedQuery),
  )
}
