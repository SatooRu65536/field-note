import type { RecordDetail } from '@/integrations/field-note-api/records'

import { toDateTimeLocalValue } from './dateTimeLocal'
import type { RecordFormValues } from './types'

/**
 * 新規登録フォームの初期値を作成する
 * @param now 発見日時の初期値にする現在日時
 * @returns フォームの初期値
 */
export function createNewRecordFormValues(now: Date): RecordFormValues {
  return {
    name: '',
    isNameUnknown: false,
    categoryId: '',
    location: null,
    discoveredAt: toDateTimeLocalValue(now),
    memo: '',
    tags: [],
    nameMemo: null,
    isPublic: false,
    existingPhotoIds: [],
    removedPhotoIds: [],
    newPhotos: [],
  }
}

/**
 * 登録済みの記録から編集フォームの初期値を作成する
 * @param record 編集する記録
 * @returns フォームの初期値
 */
export function createEditRecordFormValues(record: RecordDetail): RecordFormValues {
  return {
    name: record.name ?? '',
    isNameUnknown: record.name === null,
    categoryId: record.categoryId,
    location: { latitude: record.latitude, longitude: record.longitude },
    discoveredAt: toDateTimeLocalValue(record.discoveredAt),
    memo: record.memo,
    tags: record.tags,
    nameMemo: null,
    isPublic: record.isPublic,
    existingPhotoIds: record.photoIds,
    removedPhotoIds: [],
    newPhotos: [],
  }
}
