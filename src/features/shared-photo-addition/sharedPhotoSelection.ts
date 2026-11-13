import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
  MAX_TOTAL_PHOTO_BYTES,
} from '@/constants/photos'

const ACCEPTED_PHOTO_TYPE_LIST: readonly string[] = ACCEPTED_PHOTO_TYPES

export interface SharedPhotoSelection {
  // 記録に追加できる写真
  readonly photos: readonly File[]
  // 対応していない形式のため追加しない写真の数
  readonly unsupportedCount: number
  // 上限サイズを超えるため追加しない写真の数
  readonly oversizedCount: number
  // 一度に追加できる枚数・合計サイズを超えるため追加しない写真の数
  readonly overLimitCount: number
}

/**
 * 共有された写真から，一度に記録に追加できる写真を共有された順に選ぶ
 * @param files 共有された写真
 * @returns 対応する形式で上限サイズ以下の写真を，上限の枚数・合計サイズに収まるまで選んだ結果
 */
export function selectSharedPhotos(files: readonly File[]): SharedPhotoSelection {
  const supported = files.filter((file) => ACCEPTED_PHOTO_TYPE_LIST.includes(file.type))
  const candidates = supported.filter((file) => file.size <= MAX_PHOTO_BYTES)
  // サーバーは上限を超える写真をまとめて拒否するため，上限に収まる分だけを送る
  const { photos } = candidates.reduce<{ photos: readonly File[]; totalBytes: number }>(
    (selected, file) => {
      const totalBytes = selected.totalBytes + file.size
      if (selected.photos.length >= MAX_PHOTO_COUNT || totalBytes > MAX_TOTAL_PHOTO_BYTES) {
        return selected
      }
      return { photos: [...selected.photos, file], totalBytes }
    },
    { photos: [], totalBytes: 0 },
  )
  return {
    photos,
    unsupportedCount: files.length - supported.length,
    oversizedCount: supported.length - candidates.length,
    overLimitCount: candidates.length - photos.length,
  }
}
