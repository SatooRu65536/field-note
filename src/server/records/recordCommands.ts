import { and, count, eq, inArray, max } from 'drizzle-orm'
import type { BatchItem } from 'drizzle-orm/batch'

import { MAX_PHOTO_COUNT } from '@/constants/photos'
import type { Database } from '@/server/lib/db/client'
import { categories, recordPhotos, records, recordTags } from '@/server/lib/db/schema'
import { deletePhotos, putPhoto } from '@/server/lib/photo-storage/photoStorage'
import { createSaveNameMemoQuery } from '@/server/names/nameMemoRepository'

import type { RecordCommandResult, RecordInput, RecordUpdateInput } from './types'

interface RecordToCreate {
  readonly recordId: string
  readonly name: string | null
  readonly photos: readonly UploadedPhoto[]
}

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
 * 記録に写真を追加するときの，最初の写真の表示順を求める
 * @param db Drizzle のクライアント
 * @param recordId 記録の ID
 * @returns 登録済みの写真より後ろになる表示順．写真がない場合は 0
 */
async function findNextPhotoSortOrder({
  db,
  recordId,
}: {
  db: Database
  recordId: string
}): Promise<number> {
  const [result] = await db
    .select({ value: max(recordPhotos.sortOrder) })
    .from(recordPhotos)
    .where(eq(recordPhotos.recordId, recordId))
  return (result?.value ?? -1) + 1
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
 * 記録を写真・タグとともに登録し，名前ごとのメモを保存する．追加の名前がある場合は，名前だけが異なる記録をまとめて登録する
 * @param db Drizzle のクライアント
 * @param input 登録する内容
 * @returns 最初に登録した記録の ID．カテゴリが存在しない場合はエラー
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

  // 名前だけが異なる記録をまとめて登録する．名前が分からない記録は1件だけ登録する
  const names = input.name === null ? [null] : [input.name, ...input.additionalNames]
  // 1件の記録を削除しても他の記録の写真が消えないよう，写真は記録ごとに保存する
  const recordsToCreate = await names.reduce<Promise<readonly RecordToCreate[]>>(
    async (previous, name) => {
      const created = await previous
      const recordId = crypto.randomUUID()
      const photos = await uploadPhotos({ recordId, photos: input.photos }).catch(
        async (error: unknown) => {
          await deletePhotosQuietly(created.flatMap(({ photos }) => photos.map(({ objectKey }) => objectKey)))
          throw error
        },
      )
      return [...created, { recordId, name, photos }]
    },
    Promise.resolve([]),
  )

  try {
    await runInBatch({
      db,
      queries: [
        ...recordsToCreate.flatMap(({ recordId, name, photos }) => {
          const tagRows = createTagRows({ recordId, tags: input.tags })
          const photoRows = createPhotoRows({ recordId, photos, firstSortOrder: 0 })
          return [
            db.insert(records).values({
              id: recordId,
              name,
              categoryId: input.categoryId,
              latitude: input.latitude,
              longitude: input.longitude,
              // 未発見の記録は発見した日を使わないが，列が NOT NULL のため登録した日時を入れておく
              discoveredAt: input.discoveredAt ?? new Date(),
              isDiscovered: input.discoveredAt !== null,
              memo: input.memo,
              // 記録はすべて一般公開する
              isPublic: true,
            }),
            ...(tagRows.length > 0 ? [db.insert(recordTags).values([...tagRows])] : []),
            ...(photoRows.length > 0 ? [db.insert(recordPhotos).values([...photoRows])] : []),
          ]
        }),
        ...createNameMemoQueries({ db, input }),
      ],
    })
  } catch (error) {
    // 記録が保存されなかった場合，参照されない写真が R2 に残らないよう削除する
    await deletePhotosQuietly(
      recordsToCreate.flatMap(({ photos }) => photos.map(({ objectKey }) => objectKey)),
    )
    throw error
  }

  const [first] = recordsToCreate
  return first ? { ok: true, recordId: first.recordId } : { ok: false, error: '記録がありません' }
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

  const firstSortOrder = await findNextPhotoSortOrder({ db, recordId })
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
            discoveredAt: input.discoveredAt ?? new Date(),
            isDiscovered: input.discoveredAt !== null,
            memo: input.memo,
            // 記録はすべて一般公開する
          isPublic: true,
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
 * 登録済みの記録に，記録の内容を変えずに写真だけを追加する
 * @param db Drizzle のクライアント
 * @param recordId 写真を追加する記録の ID
 * @param photos 追加する写真
 * @returns 写真を追加した記録の ID．記録が存在しない場合や写真の枚数が上限を超える場合はエラー
 * @throws D1・R2 への保存に失敗した場合
 */
export async function addRecordPhotos({
  db,
  recordId,
  photos,
}: {
  db: Database
  recordId: string
  photos: readonly File[]
}): Promise<RecordCommandResult> {
  const [record] = await db
    .select({ id: records.id })
    .from(records)
    .where(eq(records.id, recordId))
  if (!record) return { ok: false, error: '記録が存在しません' }

  const [photoCount] = await db
    .select({ value: count() })
    .from(recordPhotos)
    .where(eq(recordPhotos.recordId, recordId))
  const remainingCount = MAX_PHOTO_COUNT - (photoCount?.value ?? 0)
  if (photos.length > remainingCount) {
    return {
      ok: false,
      error: `写真は ${MAX_PHOTO_COUNT} 枚までです．この記録にはあと ${Math.max(remainingCount, 0)} 枚追加できます`,
    }
  }

  const firstSortOrder = await findNextPhotoSortOrder({ db, recordId })
  const uploadedPhotos = await uploadPhotos({ recordId, photos })
  const photoRows = createPhotoRows({ recordId, photos: uploadedPhotos, firstSortOrder })

  try {
    await runInBatch({
      db,
      queries: [
        ...(photoRows.length > 0 ? [db.insert(recordPhotos).values([...photoRows])] : []),
        // 写真の追加も記録の更新として扱い，更新日時を進める
        db.update(records).set({ updatedAt: new Date() }).where(eq(records.id, recordId)),
      ],
    })
  } catch (error) {
    await deletePhotosQuietly(uploadedPhotos.map(({ objectKey }) => objectKey))
    throw error
  }
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
