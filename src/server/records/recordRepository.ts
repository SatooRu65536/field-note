import { and, asc, between, desc, eq, inArray, sql } from 'drizzle-orm'

import type { Database } from '@/server/lib/db/client'
import { recordPhotos, records, recordTags } from '@/server/lib/db/schema'

import type { Bounds, RecordDetail, RecordSummary } from './types'

// 地図に一度に表示するピンの上限．表示範囲が広すぎる場合に応答が肥大化するのを防ぐ
const MAX_RECORDS_IN_BOUNDS = 500

// 一覧のサムネイルに使う，表示順が最初の写真の ID
const THUMBNAIL_PHOTO_ID = sql<string | null>`(
  select ${recordPhotos.id} from ${recordPhotos}
  where ${recordPhotos.recordId} = ${records.id}
  order by ${recordPhotos.sortOrder} limit 1
)`

const SUMMARY_COLUMNS = {
  id: records.id,
  name: records.name,
  categoryId: records.categoryId,
  latitude: records.latitude,
  longitude: records.longitude,
  discoveredAt: records.discoveredAt,
  isPublic: records.isPublic,
  thumbnailPhotoId: THUMBNAIL_PHOTO_ID,
}

/**
 * 指定した範囲内の記録を発見日時の新しい順に取得する
 * @param db Drizzle のクライアント
 * @param bounds 取得する範囲
 * @param categoryIds 絞り込むカテゴリ．空の場合は全カテゴリ
 * @param includePrivate 非公開の記録を含める場合は true
 * @returns 記録の一覧
 */
export async function listRecordsInBounds({
  db,
  bounds,
  categoryIds,
  includePrivate,
}: {
  db: Database
  bounds: Bounds
  categoryIds: readonly string[]
  includePrivate: boolean
}): Promise<readonly RecordSummary[]> {
  // and() は undefined の条件を無視する
  const conditions = [
    between(records.latitude, bounds.south, bounds.north),
    between(records.longitude, bounds.west, bounds.east),
    categoryIds.length > 0
      ? inArray(records.categoryId, [...categoryIds])
      : undefined,
    includePrivate ? undefined : eq(records.isPublic, true),
  ]

  return db
    .select(SUMMARY_COLUMNS)
    .from(records)
    .where(and(...conditions))
    .orderBy(desc(records.discoveredAt))
    .limit(MAX_RECORDS_IN_BOUNDS)
}

/**
 * すべての記録を発見日時の新しい順に取得する
 * @param db Drizzle のクライアント
 * @returns 非公開を含む記録の一覧
 */
export async function listAllRecords(db: Database): Promise<readonly RecordSummary[]> {
  return db.select(SUMMARY_COLUMNS).from(records).orderBy(desc(records.discoveredAt))
}

/**
 * 記録を写真・タグとともに取得する
 * @param db Drizzle のクライアント
 * @param recordId 取得する記録の ID
 * @param includePrivate 非公開の記録も取得する場合は true
 * @returns 記録．存在しない場合や非公開で取得できない場合は null
 */
export async function findRecord({
  db,
  recordId,
  includePrivate,
}: {
  db: Database
  recordId: string
  includePrivate: boolean
}): Promise<RecordDetail | null> {
  const [record] = await db.select().from(records).where(eq(records.id, recordId))
  if (!record) return null
  if (!record.isPublic && !includePrivate) return null

  const [photos, tags] = await db.batch([
    db
      .select({ id: recordPhotos.id })
      .from(recordPhotos)
      .where(eq(recordPhotos.recordId, recordId))
      .orderBy(asc(recordPhotos.sortOrder)),
    db
      .select({ tag: recordTags.tag })
      .from(recordTags)
      .where(eq(recordTags.recordId, recordId))
      .orderBy(asc(recordTags.tag)),
  ])

  return {
    id: record.id,
    name: record.name,
    categoryId: record.categoryId,
    latitude: record.latitude,
    longitude: record.longitude,
    discoveredAt: record.discoveredAt,
    description: record.description,
    isPublic: record.isPublic,
    tags: tags.map(({ tag }) => tag),
    photoIds: photos.map(({ id }) => id),
    updatedAt: record.updatedAt,
  }
}

export interface PhotoLocation {
  readonly objectKey: string
  readonly contentType: string
  readonly isPublic: boolean
}

/**
 * 写真の保存先と，写真が属する記録の公開状態を取得する
 * @param db Drizzle のクライアント
 * @param photoId 写真の ID
 * @returns 写真の保存先．存在しない場合は null
 */
export async function findPhotoLocation({
  db,
  photoId,
}: {
  db: Database
  photoId: string
}): Promise<PhotoLocation | null> {
  const [photo] = await db
    .select({
      objectKey: recordPhotos.objectKey,
      contentType: recordPhotos.contentType,
      isPublic: records.isPublic,
    })
    .from(recordPhotos)
    .innerJoin(records, eq(recordPhotos.recordId, records.id))
    .where(eq(recordPhotos.id, photoId))
  return photo ?? null
}
