import { and, eq, inArray, max } from 'drizzle-orm'
import type { BatchItem } from 'drizzle-orm/batch'

import { MAX_PHOTO_COUNT } from '@/constants/photos'
import type { Database } from '@/server/lib/db/client'
import { categories, recordPhotos, records, recordTags } from '@/server/lib/db/schema'
import { deletePhotos, putPhoto } from '@/server/lib/photo-storage/photoStorage'

import type { RecordCommandResult, RecordInput, RecordUpdateInput } from './types'

interface UploadedPhoto {
  readonly id: string
  readonly objectKey: string
  readonly contentType: string
}

function createPhotoObjectKey({
  recordId,
  photoId,
}: {
  recordId: string
  photoId: string
}): string {
  return `records/${recordId}/${photoId}`
}

async function uploadPhotos({
  recordId,
  photos,
}: {
  recordId: string
  photos: readonly File[]
}): Promise<readonly UploadedPhoto[]> {
  return Promise.all(
    photos.map(async (file) => {
      const id = crypto.randomUUID()
      const objectKey = createPhotoObjectKey({ recordId, photoId: id })
      await putPhoto({ objectKey, file })
      return { id, objectKey, contentType: file.type }
    }),
  )
}

async function existsCategory({
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

function createTagRows({
  recordId,
  tags,
}: {
  recordId: string
  tags: readonly string[]
}): { recordId: string; tag: string }[] {
  return tags.map((tag) => ({ recordId, tag }))
}

function createPhotoRows({
  recordId,
  photos,
  firstSortOrder,
}: {
  recordId: string
  photos: readonly UploadedPhoto[]
  firstSortOrder: number
}): (typeof recordPhotos.$inferInsert)[] {
  return photos.map((photo, index) => ({
    id: photo.id,
    recordId,
    objectKey: photo.objectKey,
    contentType: photo.contentType,
    sortOrder: firstSortOrder + index,
  }))
}

// D1 の batch はトランザクションとして実行されるため，記録と写真・タグの更新をまとめて反映する
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
 * 記録を写真・タグとともに登録する
 * @param db Drizzle のクライアント
 * @param input 登録する内容
 * @returns 登録した記録の ID．カテゴリが存在しない場合はエラー
 */
export async function createRecord({
  db,
  input,
}: {
  db: Database
  input: RecordInput
}): Promise<RecordCommandResult> {
  if (!(await existsCategory({ db, categoryId: input.categoryId }))) {
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
          description: input.description,
          isPublic: input.isPublic,
        }),
        ...(tagRows.length > 0 ? [db.insert(recordTags).values(tagRows)] : []),
        ...(photoRows.length > 0 ? [db.insert(recordPhotos).values(photoRows)] : []),
      ],
    })
  } catch (error) {
    // 記録が保存されなかった場合，参照されない写真が R2 に残らないよう削除する
    await deletePhotos(uploadedPhotos.map(({ objectKey }) => objectKey))
    throw error
  }

  return { ok: true, recordId }
}

/**
 * 記録を更新し，写真の追加・削除とタグの置き換えを行う
 * @param db Drizzle のクライアント
 * @param recordId 更新する記録の ID
 * @param input 更新後の内容
 * @returns 更新した記録の ID．記録・カテゴリが存在しない場合や写真の枚数が上限を超える場合はエラー
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
  if (!(await existsCategory({ db, categoryId: input.categoryId }))) {
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
            description: input.description,
            isPublic: input.isPublic,
            updatedAt: new Date(),
          })
          .where(eq(records.id, recordId)),
        db.delete(recordTags).where(eq(recordTags.recordId, recordId)),
        ...(tagRows.length > 0 ? [db.insert(recordTags).values(tagRows)] : []),
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
        ...(photoRows.length > 0 ? [db.insert(recordPhotos).values(photoRows)] : []),
      ],
    })
  } catch (error) {
    await deletePhotos(uploadedPhotos.map(({ objectKey }) => objectKey))
    throw error
  }

  await deletePhotos(removedPhotos.map(({ objectKey }) => objectKey))
  return { ok: true, recordId }
}

/**
 * 記録を写真・タグとともに削除する
 * @param db Drizzle のクライアント
 * @param recordId 削除する記録の ID
 * @returns 削除した記録の ID．記録が存在しない場合はエラー
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

  // 写真・タグは外部キーの ON DELETE CASCADE で削除される
  const deleted = await db
    .delete(records)
    .where(eq(records.id, recordId))
    .returning({ id: records.id })
  if (deleted.length === 0) return { ok: false, error: '記録が存在しません' }

  await deletePhotos(photos.map(({ objectKey }) => objectKey))
  return { ok: true, recordId }
}
