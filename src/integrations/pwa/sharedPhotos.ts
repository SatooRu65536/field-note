import { queryOptions } from '@tanstack/react-query'

import { sortSharedPhotoUrls } from './sharedPhotoUrls'

// public/sw.js と同じ値にすること
const SHARED_PHOTO_CACHE_NAME = 'shared-photos'
const FILE_NAME_HEADER = 'X-File-Name'

// 共有されたファイルの名前が分からない場合に使う名前
const FALLBACK_FILE_NAME = 'photo'

/**
 * public/sw.js が Cache Storage に保存した，他のアプリから共有された写真を読み込む
 * @returns 共有された順の写真．共有された写真がない場合は空
 */
async function loadSharedPhotos(): Promise<readonly File[]> {
  if (!('caches' in window)) return []
  // 共有された写真がない場合，has で確かめずに open すると空のキャッシュが作られる
  if (!(await caches.has(SHARED_PHOTO_CACHE_NAME))) return []

  const cache = await caches.open(SHARED_PHOTO_CACHE_NAME)
  const requests = await cache.keys()
  const urls = sortSharedPhotoUrls(requests.map(({ url }) => url))
  const photos = await Promise.all(
    urls.map(async (url) => {
      const response = await cache.match(url)
      if (!response) return []
      const blob = await response.blob()
      const name = decodeURIComponent(response.headers.get(FILE_NAME_HEADER) ?? '')
      return [new File([blob], name || FALLBACK_FILE_NAME, { type: blob.type })]
    }),
  )
  return photos.flat()
}

/**
 * 共有された写真を Cache Storage から削除する
 */
export async function clearSharedPhotos(): Promise<void> {
  if (!('caches' in window)) return
  await caches.delete(SHARED_PHOTO_CACHE_NAME)
}

/**
 * 他のアプリから共有された写真を読み込むクエリの設定を作成する
 * @returns クエリの設定
 */
export function sharedPhotosQueryOptions() {
  return queryOptions({
    queryKey: ['sharedPhotos'],
    queryFn: loadSharedPhotos,
    // 別の共有で開き直したときに前回の写真を表示しないよう，画面を離れたら破棄する
    gcTime: 0,
    // 写真は画面を開いている間に変わらないため，追加中にアプリを切り替えても読み直さない
    staleTime: Infinity,
  })
}
