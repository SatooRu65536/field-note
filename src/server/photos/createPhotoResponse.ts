import { isAdminRequest } from '@/server/lib/cloudflare-access/isAdminRequest'
import { createDatabase } from '@/server/lib/db/client'
import { getPhoto } from '@/server/lib/photo-storage/photoStorage'
import { findPhotoLocation } from '@/server/records/recordRepository'

/**
 * 写真を返すレスポンスを作成する
 * @param photoId 写真の ID
 * @returns 写真のレスポンス．写真が存在しない場合や，非公開の記録の写真を管理者以外が要求した場合は 404
 */
export async function createPhotoResponse(photoId: string): Promise<Response> {
  const location = await findPhotoLocation({ db: createDatabase(), photoId })
  // 非公開の記録の存在を知られないよう，権限がない場合も 404 を返す
  if (!location || (!location.isPublic && !(await isAdminRequest()))) {
    return new Response('Not Found', { status: 404 })
  }

  const object = await getPhoto(location.objectKey)
  if (!object) return new Response('Not Found', { status: 404 })

  return new Response(object.body, {
    headers: {
      'Content-Type': location.contentType,
      ETag: object.httpEtag,
      // 非公開の写真は共有キャッシュに残さない．公開の写真も非公開に切り替わりうるため期間を短くする
      'Cache-Control': location.isPublic
        ? 'public, max-age=300'
        : 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
