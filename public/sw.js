// 他のアプリから共有された写真を受け取り，管理画面で記録に追加できるよう一時保存する Service Worker
// 共有の POST はサーバーに届けず，ここで Cache Storage に保存して /admin/share に移動する

// src/integrations/pwa/sharedPhotos.ts・sharedPhotoUrls.ts と同じ値にすること
const SHARED_PHOTO_CACHE_NAME = 'shared-photos'
const SHARED_PHOTO_PATH_PREFIX = '/shared-photos/'
const FILE_NAME_HEADER = 'X-File-Name'

const SHARE_TARGET_PATH = '/share-target'
const SHARED_PHOTO_PAGE_PATH = '/admin/share'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  // 共有以外のリクエストは respondWith を呼ばず，通常どおりネットワークに任せる
  if (event.request.method !== 'POST' || url.pathname !== SHARE_TARGET_PATH) return
  event.respondWith(saveSharedPhotos(event.request))
})

/**
 * 共有された写真を Cache Storage に保存し，写真を記録に追加する画面に移動させる
 * @param {Request} request 共有の POST リクエスト
 * @returns {Promise<Response>} 写真を記録に追加する画面へのリダイレクト
 */
async function saveSharedPhotos(request) {
  // 受け取りに失敗しても共有の画面をネットワークエラーにせず，管理画面で共有し直せるよう案内する
  try {
    await storeSharedPhotos(request)
  } catch (error) {
    console.error('共有された写真の保存に失敗しました', error)
    await caches.delete(SHARED_PHOTO_CACHE_NAME)
  }
  // POST の再送を避けるため，303 で GET に切り替える
  return Response.redirect(new URL(SHARED_PHOTO_PAGE_PATH, self.location.origin).href, 303)
}

/**
 * 共有された写真を Cache Storage に保存する．前回の共有の写真は消す
 * @param {Request} request 共有の POST リクエスト
 * @returns {Promise<void>}
 * @throws 共有の内容を読めない場合や，Cache Storage に保存できない場合
 */
async function storeSharedPhotos(request) {
  const formData = await request.formData()
  const files = formData.getAll('photos').filter((value) => value instanceof File)

  // 前回の共有の写真が残らないよう，保存し直す
  await caches.delete(SHARED_PHOTO_CACHE_NAME)
  const cache = await caches.open(SHARED_PHOTO_CACHE_NAME)
  await Promise.all(
    files.map((file, index) =>
      cache.put(
        // 共有された順に並べられるよう，連番をキーにする
        `${SHARED_PHOTO_PATH_PREFIX}${index}`,
        new Response(file, {
          headers: {
            'Content-Type': file.type,
            // ヘッダーには ASCII 以外の文字を入れられないため，ファイル名をエンコードする
            [FILE_NAME_HEADER]: encodeURIComponent(file.name),
          },
        }),
      ),
    ),
  )
}
