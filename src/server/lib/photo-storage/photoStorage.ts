import { env } from 'cloudflare:workers'

/**
 * 写真を R2 に保存する
 * @param objectKey 保存先のオブジェクトキー
 * @param file 保存する写真
 */
export async function putPhoto({
  objectKey,
  file,
}: {
  objectKey: string
  file: File
}): Promise<void> {
  await env.PHOTOS.put(objectKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  })
}

/**
 * R2 から写真を取得する
 * @param objectKey 取得するオブジェクトキー
 * @returns 写真のオブジェクト．存在しない場合は null
 */
export async function getPhoto(objectKey: string): Promise<R2ObjectBody | null> {
  return env.PHOTOS.get(objectKey)
}

/**
 * R2 から写真を削除する
 * @param objectKeys 削除するオブジェクトキー
 */
export async function deletePhotos(objectKeys: readonly string[]): Promise<void> {
  if (objectKeys.length === 0) return
  await env.PHOTOS.delete([...objectKeys])
}
