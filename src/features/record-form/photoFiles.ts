import { ACCEPTED_PHOTO_TYPES } from '@/constants/photos'

const ACCEPTED_PHOTO_TYPE_LIST: readonly string[] = ACCEPTED_PHOTO_TYPES

export interface PhotoFileSelection {
  // 追加する写真
  readonly files: readonly File[]
  // 対応していない形式のため追加しなかったファイルの数
  readonly unsupportedCount: number
  // 上限の枚数を超えたため追加しなかった写真の数
  readonly overLimitCount: number
}

/**
 * 選択・ドロップされたファイルから，追加する写真を選ぶ
 * @param files 選択・ドロップされたファイル
 * @param remainingCount あと何枚追加できるか
 * @returns 対応する形式の写真を上限の枚数まで選んだ結果
 */
export function selectPhotoFiles({
  files,
  remainingCount,
}: {
  files: readonly File[]
  remainingCount: number
}): PhotoFileSelection {
  const photos = files.filter((file) => ACCEPTED_PHOTO_TYPE_LIST.includes(file.type))
  const accepted = photos.slice(0, Math.max(remainingCount, 0))
  return {
    files: accepted,
    unsupportedCount: files.length - photos.length,
    overLimitCount: photos.length - accepted.length,
  }
}
