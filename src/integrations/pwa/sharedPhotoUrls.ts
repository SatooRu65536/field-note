// public/sw.js と同じ値にすること
export const SHARED_PHOTO_PATH_PREFIX = '/shared-photos/'

/**
 * 共有された写真のキャッシュの URL を，共有された順に並べる
 * @param urls キャッシュのキーの URL
 * @returns 共有された順に並べた URL．共有された写真のものでない URL は除く
 */
export function sortSharedPhotoUrls(urls: readonly string[]): readonly string[] {
  const indexedUrls = urls.flatMap((url) => {
    const { pathname } = new URL(url)
    if (!pathname.startsWith(SHARED_PHOTO_PATH_PREFIX)) return []
    const indexText = pathname.slice(SHARED_PHOTO_PATH_PREFIX.length)
    // Number('') は 0 になるため，数字だけからなることを確かめてから変換する
    if (!/^\d+$/.test(indexText)) return []
    return [{ url, index: Number(indexText) }]
  })
  return [...indexedUrls].sort((a, b) => a.index - b.index).map(({ url }) => url)
}
