import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { createDatabase } from '@/server/lib/db/client'
import { createRecord, deleteRecord, updateRecord } from '@/server/records/recordCommands'
import { findRecord, listAllRecords } from '@/server/records/recordRepository'
import type { RecordCommandResult } from '@/server/records/types'

import { adminMiddleware } from './adminMiddleware'
import { parseRecordFormData } from './recordFormData'
import type { RecordPayloadParseResult } from './recordFormData'
import { QUERY_KEYS } from './queryKeys'

export type { RecordCommandResult }

function validateFormData(data: unknown): RecordPayloadParseResult {
  if (!(data instanceof FormData)) return { ok: false, error: '入力内容が不正です' }
  return parseRecordFormData(data)
}

const getAdminRecords = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => listAllRecords(createDatabase()))

const getAdminRecord = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .validator(z.object({ recordId: z.string().min(1) }))
  .handler(async ({ data }) =>
    findRecord({ db: createDatabase(), recordId: data.recordId, includePrivate: true }),
  )

export const createAdminRecord = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(validateFormData)
  .handler(async ({ data }): Promise<RecordCommandResult> => {
    if (!data.ok) return data
    return createRecord({ db: createDatabase(), input: data.value })
  })

export const updateAdminRecord = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(validateFormData)
  .handler(async ({ data }): Promise<RecordCommandResult> => {
    if (!data.ok) return data
    const { recordId } = data.value
    if (!recordId) return { ok: false, error: '更新する記録が指定されていません' }
    return updateRecord({ db: createDatabase(), recordId, input: data.value })
  })

export const deleteAdminRecord = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(z.object({ recordId: z.string().min(1) }))
  .handler(async ({ data }) =>
    deleteRecord({ db: createDatabase(), recordId: data.recordId }),
  )

/**
 * 非公開を含むすべての記録を取得するクエリの設定を作成する
 * @returns クエリの設定
 */
export function adminRecordsQueryOptions() {
  return queryOptions({
    queryKey: [...QUERY_KEYS.adminRecords, 'list'],
    queryFn: () => getAdminRecords(),
  })
}

/**
 * 非公開を含む記録を1件取得するクエリの設定を作成する
 * @param recordId 記録の ID
 * @returns クエリの設定．記録が存在しない場合，データは null
 */
export function adminRecordQueryOptions(recordId: string) {
  return queryOptions({
    queryKey: [...QUERY_KEYS.adminRecords, 'detail', recordId],
    queryFn: () => getAdminRecord({ data: { recordId } }),
  })
}
