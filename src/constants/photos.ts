// 1件の記録に添付できる写真の上限枚数
export const MAX_PHOTO_COUNT = 10

// 写真1枚あたりの上限サイズ（10 MiB）
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

// 1回の保存で送る写真の合計の上限サイズ（50 MiB）．Workers のメモリ上限（128 MB）に余裕を持って収めるため
export const MAX_TOTAL_PHOTO_BYTES = 50 * 1024 * 1024

export const ACCEPTED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const
