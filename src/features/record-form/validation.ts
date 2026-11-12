import type { RecordPayload } from '@/integrations/field-note-api/recordFormData'

import { parseDateTimeLocalValue } from './dateTimeLocal'
import { splitRecordNames } from './recordNames'
import type { RecordFormValues } from './types'

export type RecordFormValidationResult =
  | { readonly ok: true; readonly value: RecordPayload }
  | { readonly ok: false; readonly error: string }

/**
 * フォームの入力内容を検証し，サーバー関数に送る内容に変換する
 * @param values フォームの入力内容
 * @param recordId 編集する記録の ID．新規登録の場合は undefined とし，区切り文字で区切った名前ごとに記録を登録する
 * @returns 送信する内容．入力に不備がある場合はエラーメッセージ
 */
export function validateRecordFormValues({
  values,
  recordId,
}: {
  values: RecordFormValues
  recordId: string | undefined
}): RecordFormValidationResult {
  // 編集では1件の記録を扱うため，区切り文字も名前の一部とみなす
  const names = recordId === undefined ? splitRecordNames(values.name) : [values.name.trim()].filter((name) => name !== '')
  const [name, ...additionalNames] = names
  if (!values.isNameUnknown && name === undefined) {
    return { ok: false, error: '名前を入力するか，「名前が分からない」を選択してください' }
  }
  if (values.categoryId === '') {
    return { ok: false, error: 'カテゴリを選択してください' }
  }
  if (!values.location) {
    return { ok: false, error: '発見場所を指定してください' }
  }
  const discoveredAt = parseDateTimeLocalValue(values.discoveredAt)
  if (!discoveredAt) {
    return { ok: false, error: '発見日時を入力してください' }
  }

  return {
    ok: true,
    value: {
      recordId,
      name: values.isNameUnknown ? null : (name ?? null),
      additionalNames: values.isNameUnknown ? [] : additionalNames,
      categoryId: values.categoryId,
      latitude: values.location.latitude,
      longitude: values.location.longitude,
      discoveredAt,
      memo: values.memo.trim(),
      isConfirmed: values.isConfirmed,
      tags: values.tags,
      // 名前が分からない記録や，複数の名前をまとめて登録する場合は，名前ごとのメモを保存しない
      nameMemo: values.isNameUnknown || additionalNames.length > 0 ? null : values.nameMemo,
      photos: values.newPhotos.map(({ file }) => file),
      removedPhotoIds: values.removedPhotoIds,
    },
  }
}
