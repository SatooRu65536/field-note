/**
 * 写真を表示する URL を作成する
 * @param photoId 写真の ID
 * @returns 写真の URL
 */
export function createPhotoUrl(photoId: string): string {
  return `/photos/${encodeURIComponent(photoId)}`
}
