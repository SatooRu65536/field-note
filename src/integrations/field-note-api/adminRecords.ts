import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { createDatabase } from '@/server/lib/db/client'
import {
  addRecordPhotos,
  createRecord,
  deleteRecord,
  updateRecord,
} from '@/server/records/recordCommands'
import {
  findRecord,
  listAllRecords,
  listNameCandidates,
  listTagCandidates,
} from '@/server/records/recordRepository'
import { listNameMemos } from '@/server/names/nameMemoRepository'
import type { NameMemo } from '@/server/names/nameMemoRepository'
import type { NameCandidate } from '@/server/records/nameCandidates'
import type { RecordCommandResult } from '@/server/records/types'

import { adminMiddleware } from './adminMiddleware'
import { parseRecordFormData, parseRecordPhotosFormData } from './recordFormData'
import type { RecordPayloadParseResult, RecordPhotosPayloadParseResult } from './recordFormData'
import { QUERY_KEYS } from './queryKeys'

export type { NameCandidate, NameMemo, RecordCommandResult }

/**
 * サーバー関数の入力が FormData であることを確かめ，記録の登録・更新内容に変換する
 * @param data サーバー関数の入力
 * @returns 登録・更新内容．入力が不正な場合はエラーメッセージ
 */
function validateFormData(data: unknown): RecordPayloadParseResult {
  if (!(data instanceof FormData)) return { ok: false, error: '入力内容が不正です' }
  return parseRecordFormData(data)
}

/**
 * サーバー関数の入力が FormData であることを確かめ，記録に写真を追加する内容に変換する
 * @param data サーバー関数の入力
 * @returns 写真を追加する記録と写真．入力が不正な場合はエラーメッセージ
 */
function validatePhotosFormData(data: unknown): RecordPhotosPayloadParseResult {
  if (!(data instanceof FormData)) return { ok: false, error: '入力内容が不正です' }
  return parseRecordPhotosFormData(data)
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

const getAdminNameCandidates = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    const db = createDatabase()
    // 記録を削除・改名しても名前ごとのメモは残るため，名前とは別にすべてのメモを返す
    const [names, memos] = await Promise.all([listNameCandidates(db), listNameMemos(db)])
    return { names, memos }
  })

const getAdminTagCandidates = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => listTagCandidates(createDatabase()))

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
    if (data.value.additionalNames.length > 0) {
      return { ok: false, error: '記録の編集では名前を1つだけ指定してください' }
    }
    return updateRecord({ db: createDatabase(), recordId, input: data.value })
  })

export const addAdminRecordPhotos = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(validatePhotosFormData)
  .handler(async ({ data }): Promise<RecordCommandResult> => {
    if (!data.ok) return data
    return addRecordPhotos({ db: createDatabase(), ...data.value })
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

/**
 * 過去の記録に使われた名前と，保存済みの名前ごとのメモを取得するクエリの設定を作成する
 * @returns クエリの設定
 */
export function nameCandidatesQueryOptions() {
  return queryOptions({
    queryKey: QUERY_KEYS.nameCandidates,
    queryFn: () => getAdminNameCandidates(),
  })
}

/**
 * 過去の記録に付けたタグを取得するクエリの設定を作成する
 * @returns クエリの設定
 */
export function tagCandidatesQueryOptions() {
  return queryOptions({
    queryKey: QUERY_KEYS.tagCandidates,
    queryFn: () => getAdminTagCandidates(),
  })
}
