import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { publicRecordsInBoundsQueryOptions } from '@/integrations/field-note-api/records'
import type { Bounds, RecordSummary } from '@/integrations/field-note-api/records'

/**
 * 範囲内の公開記録を取得する
 * @param bounds 取得する範囲．null の場合は取得しない
 * @param categoryIds 絞り込むカテゴリ．空の場合は全カテゴリ
 * @returns 記録の一覧．地図の移動中は直前の結果を返す
 */
export function usePublicRecordsInBounds({
  bounds,
  categoryIds,
}: {
  bounds: Bounds | null
  categoryIds: readonly string[]
}): readonly RecordSummary[] {
  const { data } = useQuery({
    ...publicRecordsInBoundsQueryOptions({ bounds, categoryIds }),
    placeholderData: keepPreviousData,
  })
  return data ?? []
}
