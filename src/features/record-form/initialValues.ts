import type { RecordDetail } from '@/integrations/field-note-api/records'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

import { toDateInputValue } from './dateInput'
import type { RecordFormValues } from './types'

/**
 * 新規登録フォームの初期値を作成する
 * @param now 発見日の初期値にする現在日時
 * @param location 発見場所の初期値．指定しない場合は null
 * @returns フォームの初期値
 */
export function createNewRecordFormValues({
  now,
  location,
}: {
  now: Date
  location: Coordinates | null
}): RecordFormValues {
  return {
    name: '',
    isNameUnknown: false,
    categoryId: '',
    location,
    discoveredAt: toDateInputValue(now),
    isUndiscovered: false,
    memo: '',
    tags: [],
    nameMemo: null,
    existingPhotoIds: [],
    removedPhotoIds: [],
    newPhotos: [],
  }
}

/**
 * 登録済みの記録から編集フォームの初期値を作成する
 * @param record 編集する記録
 * @param now 未発見の記録の，発見日の入力欄の初期値にする現在日時
 * @returns フォームの初期値
 */
export function createEditRecordFormValues({
  record,
  now,
}: {
  record: RecordDetail
  now: Date
}): RecordFormValues {
  return {
    name: record.name ?? '',
    isNameUnknown: record.name === null,
    categoryId: record.categoryId,
    location: { latitude: record.latitude, longitude: record.longitude },
    // 未発見の記録を発見済みに変えるときのため，発見日の入力欄には今日を入れておく
    discoveredAt: toDateInputValue(record.discoveredAt ?? now),
    isUndiscovered: record.discoveredAt === null,
    memo: record.memo,
    tags: record.tags,
    nameMemo: null,
    existingPhotoIds: record.photoIds,
    removedPhotoIds: [],
    newPhotos: [],
  }
}
