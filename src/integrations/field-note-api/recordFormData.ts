import { z } from 'zod'

import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
  MAX_TOTAL_PHOTO_BYTES,
} from '@/constants/photos'

import { MAX_TAG_COUNT, MAX_TAG_LENGTH, normalizeTags } from './tags'

export const MAX_NAME_LENGTH = 100

// まとめて登録できる記録の上限数
export const MAX_RECORD_NAMES = 20

export const MAX_MEMO_LENGTH = 5000

export const MAX_NAME_MEMO_LENGTH = 5000

export interface RecordPayload {
  readonly recordId?: string
  // 名前が分からない場合は null
  readonly name: string | null
  // 名前だけが異なる記録をまとめて登録するときの，2件目以降の名前
  readonly additionalNames: readonly string[]
  readonly categoryId: string
  readonly latitude: number
  readonly longitude: number
  readonly discoveredAt: Date
  readonly memo: string
  readonly tags: readonly string[]
  // 名前ごとのメモ．null の場合は変更しない
  readonly nameMemo: string | null
  readonly photos: readonly File[]
  readonly removedPhotoIds: readonly string[]
}

export type RecordPayloadParseResult =
  | { readonly ok: true; readonly value: RecordPayload }
  | { readonly ok: false; readonly error: string }

/**
 * 記録の登録・更新内容をサーバー関数に送る FormData に変換する
 * @param payload 登録・更新内容
 * @returns FormData
 */
export function createRecordFormData(payload: RecordPayload): FormData {
  const formData = new FormData()
  if (payload.recordId) formData.set('recordId', payload.recordId)
  formData.set('name', payload.name ?? '')
  payload.additionalNames.forEach((name) => formData.append('additionalNames', name))
  formData.set('categoryId', payload.categoryId)
  formData.set('latitude', String(payload.latitude))
  formData.set('longitude', String(payload.longitude))
  formData.set('discoveredAt', payload.discoveredAt.toISOString())
  formData.set('memo', payload.memo)
  if (payload.nameMemo !== null) formData.set('nameMemo', payload.nameMemo)
  payload.tags.forEach((tag) => formData.append('tags', tag))
  payload.photos.forEach((photo) => formData.append('photos', photo))
  payload.removedPhotoIds.forEach((id) => formData.append('removedPhotoIds', id))
  return formData
}

// 正規化前のタグの上限数．正規化後の上限 MAX_TAG_COUNT とは別に，過大な入力を早めに拒否する
const MAX_RAW_TAG_COUNT = 100

const COORDINATE_SCHEMA = z.string().trim().min(1, '発見場所を指定してください').pipe(z.coerce.number())

const FIELDS_SCHEMA = z.object({
  recordId: z.string().min(1).optional(),
  name: z
    .string()
    .trim()
    .max(MAX_NAME_LENGTH, `名前は ${MAX_NAME_LENGTH} 文字以内で入力してください`)
    .transform((name) => (name === '' ? null : name)),
  additionalNames: z
    .array(
      z
        .string()
        .trim()
        .min(1, '名前を入力してください')
        .max(MAX_NAME_LENGTH, `名前は ${MAX_NAME_LENGTH} 文字以内で入力してください`),
    )
    .max(MAX_RECORD_NAMES - 1, `まとめて登録できる記録は ${MAX_RECORD_NAMES} 件までです`),
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  latitude: COORDINATE_SCHEMA.pipe(
    z.number().min(-90, '緯度は -90 から 90 の範囲で指定してください').max(90, '緯度は -90 から 90 の範囲で指定してください'),
  ),
  longitude: COORDINATE_SCHEMA.pipe(
    z.number().min(-180, '経度は -180 から 180 の範囲で指定してください').max(180, '経度は -180 から 180 の範囲で指定してください'),
  ),
  discoveredAt: z.iso
    .datetime({ offset: true, message: '発見日時が不正です' })
    .transform((value) => new Date(value)),
  memo: z.string().max(MAX_MEMO_LENGTH, `メモは ${MAX_MEMO_LENGTH} 文字以内で入力してください`),
  nameMemo: z
    .string()
    .trim()
    .max(MAX_NAME_MEMO_LENGTH, `名前のメモは ${MAX_NAME_MEMO_LENGTH} 文字以内で入力してください`)
    .nullable(),
  tags: z
    .array(z.string())
    .max(MAX_RAW_TAG_COUNT, `タグは ${MAX_TAG_COUNT} 個までです`)
    // 先頭の # や空白を除いた後の文字数で検証する
    .transform(normalizeTags)
    .pipe(
      z
        .array(
          z.string().max(MAX_TAG_LENGTH, `タグは ${MAX_TAG_LENGTH} 文字以内で入力してください`),
        )
        .max(MAX_TAG_COUNT, `タグは ${MAX_TAG_COUNT} 個までです`),
    ),
  removedPhotoIds: z.array(z.string().min(1)).max(MAX_PHOTO_COUNT),
})

const ACCEPTED_PHOTO_TYPE_LIST: readonly string[] = ACCEPTED_PHOTO_TYPES

const PHOTOS_SCHEMA = z
  .array(
    z
      .instanceof(File)
      .refine((file) => ACCEPTED_PHOTO_TYPE_LIST.includes(file.type), {
        message: '写真は JPEG・PNG・WebP・AVIF のいずれかを選択してください',
      })
      .refine((file) => file.size <= MAX_PHOTO_BYTES, {
        message: `写真は1枚あたり ${MAX_PHOTO_BYTES / 1024 / 1024} MB 以下にしてください`,
      }),
  )
  .max(MAX_PHOTO_COUNT, `写真は ${MAX_PHOTO_COUNT} 枚までです`)
  .refine(
    (files) => files.reduce((total, file) => total + file.size, 0) <= MAX_TOTAL_PHOTO_BYTES,
    { message: `一度に保存できる写真は合計 ${MAX_TOTAL_PHOTO_BYTES / 1024 / 1024} MB までです` },
  )

/**
 * FormData から文字列の値を取り出す
 * @param formData 取り出し元の FormData
 * @param key 項目名
 * @returns 値．項目がない場合やファイルの場合は undefined
 */
function getOptionalString({
  formData,
  key,
}: {
  formData: FormData
  key: string
}): string | undefined {
  const value = formData.get(key)
  return typeof value === 'string' ? value : undefined
}

/**
 * サーバー関数が受け取った FormData を検証し，記録の登録・更新内容に変換する
 * @param formData createRecordFormData で作成した FormData
 * @returns 登録・更新内容．検証に失敗した場合は最初のエラーメッセージ
 */
export function parseRecordFormData(formData: FormData): RecordPayloadParseResult {
  const fields = FIELDS_SCHEMA.safeParse({
    recordId: getOptionalString({ formData, key: 'recordId' }),
    name: getOptionalString({ formData, key: 'name' }) ?? '',
    additionalNames: formData.getAll('additionalNames'),
    categoryId: getOptionalString({ formData, key: 'categoryId' }) ?? '',
    latitude: getOptionalString({ formData, key: 'latitude' }) ?? '',
    longitude: getOptionalString({ formData, key: 'longitude' }) ?? '',
    discoveredAt: getOptionalString({ formData, key: 'discoveredAt' }) ?? '',
    memo: getOptionalString({ formData, key: 'memo' }) ?? '',
    nameMemo: getOptionalString({ formData, key: 'nameMemo' }) ?? null,
    tags: formData.getAll('tags'),
    removedPhotoIds: formData.getAll('removedPhotoIds'),
  })
  if (!fields.success) {
    return { ok: false, error: fields.error.issues[0]?.message ?? '入力内容が不正です' }
  }

  // ファイルを選択していない input からは空の File が送られるため除外する
  const files = formData
    .getAll('photos')
    .filter((value) => !(value instanceof File && value.size === 0))
  const photos = PHOTOS_SCHEMA.safeParse(files)
  if (!photos.success) {
    return { ok: false, error: photos.error.issues[0]?.message ?? '写真が不正です' }
  }

  return { ok: true, value: { ...fields.data, photos: photos.data } }
}
