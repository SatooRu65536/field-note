// 1件の記録に添付できる写真の上限枚数
export const MAX_PHOTO_COUNT = 10

// 写真1枚あたりの上限サイズ（10 MiB）
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

export const ACCEPTED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export type AcceptedPhotoType = (typeof ACCEPTED_PHOTO_TYPES)[number]
