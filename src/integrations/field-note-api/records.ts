import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { createDatabase } from '@/server/lib/db/client'
import { findRecord, listRecordsInBounds } from '@/server/records/recordRepository'
import type { Bounds, RecordDetail, RecordSummary } from '@/server/records/types'

import { QUERY_KEYS } from './queryKeys'

export type { Bounds, RecordDetail, RecordSummary }

const boundsSchema = z.object({
  west: z.number().min(-180).max(180),
  east: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  north: z.number().min(-90).max(90),
})

const getPublicRecordsInBounds = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      bounds: boundsSchema,
      categoryIds: z.array(z.string()).max(50),
    }),
  )
  .handler(async ({ data }) =>
    listRecordsInBounds({
      db: createDatabase(),
      bounds: data.bounds,
      categoryIds: data.categoryIds,
      includePrivate: false,
    }),
  )

const getPublicRecord = createServerFn({ method: 'GET' })
  .validator(z.object({ recordId: z.string().min(1) }))
  .handler(async ({ data }) =>
    findRecord({ db: createDatabase(), recordId: data.recordId, includePrivate: false }),
  )

/**
 * 範囲内の公開記録を取得するクエリの設定を作成する
 * @param bounds 取得する範囲．null の場合は取得しない
 * @param categoryIds 絞り込むカテゴリ．空の場合は全カテゴリ
 * @returns クエリの設定
 */
export function publicRecordsInBoundsQueryOptions({
  bounds,
  categoryIds,
}: {
  bounds: Bounds | null
  categoryIds: readonly string[]
}) {
  return queryOptions({
    queryKey: [...QUERY_KEYS.publicRecords, 'bounds', bounds, categoryIds],
    queryFn: () => {
      // enabled: false の間は呼ばれない
      if (!bounds) return []
      return getPublicRecordsInBounds({ data: { bounds, categoryIds: [...categoryIds] } })
    },
    enabled: bounds !== null,
  })
}

/**
 * 公開記録を1件取得するクエリの設定を作成する
 * @param recordId 記録の ID
 * @returns クエリの設定．記録が存在しない・非公開の場合，データは null
 */
export function publicRecordQueryOptions(recordId: string) {
  return queryOptions({
    queryKey: [...QUERY_KEYS.publicRecords, 'detail', recordId],
    queryFn: () => getPublicRecord({ data: { recordId } }),
  })
}
