import { and, eq, inArray, max } from 'drizzle-orm'
import type { BatchItem } from 'drizzle-orm/batch'

import { MAX_PHOTO_COUNT } from '@/constants/photos'
import type { Database } from '@/server/lib/db/client'
import { categories, recordPhotos, records, recordTags } from '@/server/lib/db/schema'
import { deletePhotos, putPhoto } from '@/server/lib/photo-storage/photoStorage'
import { createSaveNameMemoQuery } from '@/server/names/nameMemoRepository'

import type { RecordCommandResult, RecordInput, RecordUpdateInput } from './types'

interface UploadedPhoto {
  readonly id: string
  readonly objectKey: string
  readonly contentType: string
}

/**
 * 写真を保存する R2 のオブジェクトキーを作成する
 * @param recordId 写真が属する記録の ID
 * @param photoId 写真の ID
 * @returns オブジェクトキー
 */
function createPhotoObjectKey({
  recordId,
  photoId,
}: {
  recordId: string
  photoId: string
}): string {
  return `records/${recordId}/${photoId}`
}

/**
 * 削除後の後片付けとして R2 の写真を削除する．失敗しても例外を投げずログに残す
 * @param objectKeys 削除するオブジェクトキー
 */
async function deletePhotosQuietly(objectKeys: readonly string[]): Promise<void> {
  try {
    await deletePhotos(objectKeys)
  } catch (error) {
    console.error('R2 の写真の削除に失敗しました', { objectKeys, error })
  }
}

/**
 * 写真を1枚ずつ R2 に保存する
 * @param recordId 写真が属する記録の ID
 * @param photos 保存する写真
 * @returns 保存した写真
 * @throws R2 への保存に失敗した場合．それまでに保存した写真は削除してから投げる
 */
async function uploadPhotos({
  recordId,
  photos,
}: {
  recordId: string
  photos: readonly File[]
}): Promise<readonly UploadedPhoto[]> {
  // Workers のメモリ上限（128 MB）に収まるよう，写真のバイト列を同時に複数読み込まない
  return photos.reduce<Promise<readonly UploadedPhoto[]>>(async (previous, file) => {
    const uploaded = await previous
    const id = crypto.randomUUID()
    const objectKey = createPhotoObjectKey({ recordId, photoId: id })
    try {
      await putPhoto({ objectKey, file })
    } catch (error) {
      await deletePhotosQuietly(uploaded.map((photo) => photo.objectKey))
      throw error
    }
    return [...uploaded, { id, objectKey, contentType: file.type }]
  }, Promise.resolve([]))
}

/**
 * カテゴリが存在するか確かめる
 * @param db Drizzle のクライアント
 * @param categoryId カテゴリの ID
 * @returns 存在する場合に true
 */
async function hasCategory({
  db,
  categoryId,
}: {
  db: Database
  categoryId: string
}): Promise<boolean> {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
  return category !== undefined
}

/**
 * 記録に付けるタグの行を作成する
 * @param recordId 記録の ID
 * @param tags タグ
 * @returns record_tags に挿入する行
 */
function createTagRows({
  recordId,
  tags,
}: {
  recordId: string
  tags: readonly string[]
}): readonly { readonly recordId: string; readonly tag: string }[] {
  return tags.map((tag) => ({ recordId, tag }))
}

/**
 * 名前ごとのメモを保存するクエリを作成する
 * @param db Drizzle のクライアント
 * @param input 登録・更新する内容
 * @returns クエリ．名前が分からない記録や，メモを変更しない場合は空
 */
function createNameMemoQueries({
  db,
  input,
}: {
  db: Database
  input: RecordInput
}): readonly BatchItem<'sqlite'>[] {
  if (input.name === null || input.nameMemo === null) return []
  return [createSaveNameMemoQuery({ db, name: input.name, memo: input.nameMemo })]
}

/**
 * 保存した写真の行を，指定した表示順から連番で作成する
 * @param recordId 記録の ID
 * @param photos 保存した写真
 * @param firstSortOrder 最初の写真の表示順
 * @returns record_photos に挿入する行
 */
function createPhotoRows({
  recordId,
  photos,
  firstSortOrder,
}: {
  recordId: string
  photos: readonly UploadedPhoto[]
  firstSortOrder: number
}): readonly (typeof recordPhotos.$inferInsert)[] {
  return photos.map((photo, index) => ({
    id: photo.id,
    recordId,
    objectKey: photo.objectKey,
    contentType: photo.contentType,
    sortOrder: firstSortOrder + index,
  }))
}

/**
 * クエリをまとめて1つのトランザクションとして実行する．クエリが空の場合は何もしない
 * @param db Drizzle のクライアント
 * @param queries 実行するクエリ
 * @throws いずれかのクエリが失敗した場合．すべての変更は取り消される
 */
async function runInBatch({
  db,
  queries,
}: {
  db: Database
  queries: readonly BatchItem<'sqlite'>[]
}): Promise<void> {
  const [first, ...rest] = queries
  if (!first) return
  await db.batch([first, ...rest])
}

/**
 * 記録を写真・タグとともに登録し，名前ごとのメモを保存する
 * @param db Drizzle のクライアント
 * @param input 登録する内容
 * @returns 登録した記録の ID．カテゴリが存在しない場合はエラー
 * @throws D1・R2 への保存に失敗した場合
 */
export async function createRecord({
  db,
  input,
}: {
  db: Database
  input: RecordInput
}): Promise<RecordCommandResult> {
  if (!(await hasCategory({ db, categoryId: input.categoryId }))) {
    return { ok: false, error: 'カテゴリが存在しません' }
  }

  const recordId = crypto.randomUUID()
  const uploadedPhotos = await uploadPhotos({ recordId, photos: input.photos })
  const tagRows = createTagRows({ recordId, tags: input.tags })
  const photoRows = createPhotoRows({ recordId, photos: uploadedPhotos, firstSortOrder: 0 })

  try {
    await runInBatch({
      db,
      queries: [
        db.insert(records).values({
          id: recordId,
          name: input.name,
          categoryId: input.categoryId,
          latitude: input.latitude,
          longitude: input.longitude,
          discoveredAt: input.discoveredAt,
          memo: input.memo,
          isPublic: input.isPublic,
        }),
        ...(tagRows.length > 0 ? [db.insert(recordTags).values([...tagRows])] : []),
        ...createNameMemoQueries({ db, input }),
        ...(photoRows.length > 0 ? [db.insert(recordPhotos).values([...photoRows])] : []),
      ],
    })
  } catch (error) {
    // 記録が保存されなかった場合，参照されない写真が R2 に残らないよう削除する
    await deletePhotosQuietly(uploadedPhotos.map(({ objectKey }) => objectKey))
    throw error
  }

  return { ok: true, recordId }
}

/**
 * 記録を更新し，写真の追加・削除，タグの置き換え，名前ごとのメモの保存を行う
 * @param db Drizzle のクライアント
 * @param recordId 更新する記録の ID
 * @param input 更新後の内容
 * @returns 更新した記録の ID．記録・カテゴリが存在しない場合や写真の枚数が上限を超える場合はエラー
 * @throws D1・R2 への保存に失敗した場合
 */
export async function updateRecord({
  db,
  recordId,
  input,
}: {
  db: Database
  recordId: string
  input: RecordUpdateInput
}): Promise<RecordCommandResult> {
  const [record] = await db
    .select({ id: records.id })
    .from(records)
    .where(eq(records.id, recordId))
  if (!record) return { ok: false, error: '記録が存在しません' }
  if (!(await hasCategory({ db, categoryId: input.categoryId }))) {
    return { ok: false, error: 'カテゴリが存在しません' }
  }

  const currentPhotos = await db
    .select({ id: recordPhotos.id, objectKey: recordPhotos.objectKey })
    .from(recordPhotos)
    .where(eq(recordPhotos.recordId, recordId))
  const removedPhotos = currentPhotos.filter(({ id }) => input.removedPhotoIds.includes(id))
  const photoCount = currentPhotos.length - removedPhotos.length + input.photos.length
  if (photoCount > MAX_PHOTO_COUNT) {
    return { ok: false, error: `写真は ${MAX_PHOTO_COUNT} 枚までです` }
  }

  const [sortOrderResult] = await db
    .select({ value: max(recordPhotos.sortOrder) })
    .from(recordPhotos)
    .where(eq(recordPhotos.recordId, recordId))
  const firstSortOrder = (sortOrderResult?.value ?? -1) + 1

  const uploadedPhotos = await uploadPhotos({ recordId, photos: input.photos })
  const tagRows = createTagRows({ recordId, tags: input.tags })
  const photoRows = createPhotoRows({ recordId, photos: uploadedPhotos, firstSortOrder })
  const removedPhotoIds = removedPhotos.map(({ id }) => id)

  try {
    await runInBatch({
      db,
      queries: [
        db
          .update(records)
          .set({
            name: input.name,
            categoryId: input.categoryId,
            latitude: input.latitude,
            longitude: input.longitude,
            discoveredAt: input.discoveredAt,
            memo: input.memo,
            isPublic: input.isPublic,
            updatedAt: new Date(),
          })
          .where(eq(records.id, recordId)),
        db.delete(recordTags).where(eq(recordTags.recordId, recordId)),
        ...(tagRows.length > 0 ? [db.insert(recordTags).values([...tagRows])] : []),
        ...createNameMemoQueries({ db, input }),
        ...(removedPhotoIds.length > 0
          ? [
              db
                .delete(recordPhotos)
                .where(
                  and(
                    eq(recordPhotos.recordId, recordId),
                    inArray(recordPhotos.id, removedPhotoIds),
                  ),
                ),
            ]
          : []),
        ...(photoRows.length > 0 ? [db.insert(recordPhotos).values([...photoRows])] : []),
      ],
    })
  } catch (error) {
    await deletePhotosQuietly(uploadedPhotos.map(({ objectKey }) => objectKey))
    throw error
  }

  // 記録の更新は確定しているため，写真の削除に失敗しても保存は成功として扱う
  await deletePhotosQuietly(removedPhotos.map(({ objectKey }) => objectKey))
  return { ok: true, recordId }
}

/**
 * 記録を写真・タグとともに削除する
 * @param db Drizzle のクライアント
 * @param recordId 削除する記録の ID
 * @returns 削除した記録の ID．記録が存在しない場合はエラー
 * @throws D1 からの削除に失敗した場合
 */
export async function deleteRecord({
  db,
  recordId,
}: {
  db: Database
  recordId: string
}): Promise<RecordCommandResult> {
  const photos = await db
    .select({ objectKey: recordPhotos.objectKey })
    .from(recordPhotos)
    .where(eq(recordPhotos.recordId, recordId))

  // 写真・タグの行は外部キーの ON DELETE CASCADE で削除される
  const deleted = await db
    .delete(records)
    .where(eq(records.id, recordId))
    .returning({ id: records.id })
  if (deleted.length === 0) return { ok: false, error: '記録が存在しません' }

  // 記録の削除は確定しているため，写真の削除に失敗しても削除は成功として扱う
  await deletePhotosQuietly(photos.map(({ objectKey }) => objectKey))
  return { ok: true, recordId }
}
