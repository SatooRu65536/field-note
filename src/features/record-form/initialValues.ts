import type { RecordDetail } from '@/integrations/field-note-api/records'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

import { toDateTimeLocalValue } from './dateTimeLocal'
import type { RecordFormValues } from './types'

/**
 * 新規登録フォームの初期値を作成する
 * @param now 発見日時の初期値にする現在日時
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
    discoveredAt: toDateTimeLocalValue(now),
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
    existingPhotoIds: record.photoIds,
    removedPhotoIds: [],
    newPhotos: [],
  }
}
