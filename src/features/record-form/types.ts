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
  // input[type=datetime-local] の値
  readonly discoveredAt: string
  readonly memo: string
  // 実際に確認した記録は true．伝聞や痕跡だけの記録は false
  readonly isConfirmed: boolean
  readonly tags: readonly string[]
  // 名前ごとのメモ．編集していない場合は null とし，保存済みのメモを変更しない
  readonly nameMemo: string | null
  readonly existingPhotoIds: readonly string[]
  readonly removedPhotoIds: readonly string[]
  readonly newPhotos: readonly NewPhoto[]
}
