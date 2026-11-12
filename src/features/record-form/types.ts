import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

export interface NewPhoto {
  readonly id: string
  readonly file: File
  // 選択した写真のプレビューに使う Object URL
  readonly previewUrl: string
}

export interface RecordFormValues {
  readonly name: string
  readonly isNameUnknown: boolean
  readonly categoryId: string
  readonly location: Coordinates | null
  // input[type=date] の値
  readonly discoveredAt: string
  // まだ発見していない場合は true とし，発見日を使わない
  readonly isUndiscovered: boolean
  readonly memo: string
  readonly tags: readonly string[]
  // 名前ごとのメモ．編集していない場合は null とし，保存済みのメモを変更しない
  readonly nameMemo: string | null
  readonly existingPhotoIds: readonly string[]
  readonly removedPhotoIds: readonly string[]
  readonly newPhotos: readonly NewPhoto[]
}
