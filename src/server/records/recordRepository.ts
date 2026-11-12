import { and, asc, between, count, desc, eq, inArray, isNotNull, or, sql } from 'drizzle-orm'

import { normalizeKana, toKatakana } from '@/integrations/intl/normalizeKana'
import type { Database } from '@/server/lib/db/client'
import { recordPhotos, records, recordTags } from '@/server/lib/db/schema'
import { findNameMemo } from '@/server/names/nameMemoRepository'

import { createContainsPattern } from './likePattern'
import { mergeNameCandidates } from './nameCandidates'
import type { NameCandidate } from './nameCandidates'
import type { Bounds, RecordDetail, RecordSummary } from './types'

// 地図に一度に表示するピンの上限．表示範囲が広すぎる場合に応答が肥大化するのを防ぐ
const MAX_RECORDS_IN_BOUNDS = 500

// 一覧のサムネイルに使う，表示順が最初の写真の ID
// Drizzle は1つのテーブルからの select で列名をテーブル名なしで出力し，サブクエリ内では写真のテーブルの列と区別できなくなるため，テーブル名付きで書く
const THUMBNAIL_PHOTO_ID = sql<string | null>`(
  select "record_photos"."id" from "record_photos"
  where "record_photos"."record_id" = "records"."id"
  order by "record_photos"."sort_order" limit 1
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

// 検索結果として一度に返す記録の上限
const MAX_SEARCH_RESULTS = 200

/**
 * 名前またはタグに検索語を含む記録を，ひらがな・カタカナの違いを無視して発見日時の新しい順に取得する
 * @param db Drizzle のクライアント
 * @param query 検索語
 * @param categoryIds 絞り込むカテゴリ．空の場合は全カテゴリ
 * @param includePrivate 非公開の記録を含める場合は true
 * @returns 記録の一覧．検索語が空の場合は空
 */
export async function searchRecords({
  db,
  query,
  categoryIds,
  includePrivate,
}: {
  db: Database
  query: string
  categoryIds: readonly string[]
  includePrivate: boolean
}): Promise<readonly RecordSummary[]> {
  const hiragana = normalizeKana(query)
  if (hiragana === '') return []
  // SQLite ではひらがなとカタカナを同一視できないため，両方の表記で検索する
  const patterns = [...new Set([hiragana, toKatakana(hiragana)])].map(createContainsPattern)
  const matchesName = patterns.map((pattern) => sql`"records"."name" like ${pattern} escape '\\'`)
  const matchesTag = patterns.map(
    (pattern) => sql`"record_tags"."tag" like ${pattern} escape '\\'`,
  )
  // サブクエリ内で records と record_tags の列を区別するため，テーブル名付きで書く
  const hasMatchingTag = sql`exists (
    select 1 from "record_tags"
    where "record_tags"."record_id" = "records"."id" and (${sql.join(matchesTag, sql` or `)})
  )`

  const conditions = [
    or(...matchesName, hasMatchingTag),
    categoryIds.length > 0 ? inArray(records.categoryId, [...categoryIds]) : undefined,
    includePrivate ? undefined : eq(records.isPublic, true),
  ]

  return db
    .select(SUMMARY_COLUMNS)
    .from(records)
    .where(and(...conditions))
    .orderBy(desc(records.discoveredAt))
    .limit(MAX_SEARCH_RESULTS)
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
 * 記録を写真・タグ・名前ごとのメモとともに取得する
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

  const [photos, tags, nameMemo] = await Promise.all([
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
    record.name ? findNameMemo({ db, name: record.name }) : Promise.resolve(''),
  ])

  return {
    id: record.id,
    name: record.name,
    categoryId: record.categoryId,
    latitude: record.latitude,
    longitude: record.longitude,
    discoveredAt: record.discoveredAt,
    memo: record.memo,
    isPublic: record.isPublic,
    tags: tags.map(({ tag }) => tag),
    nameMemo,
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

/**
 * 過去の記録に使われた名前を，ひらがな・カタカナの違いをまとめて記録の多い順に取得する
 * @param db Drizzle のクライアント
 * @returns 名前と記録の件数，推定するカテゴリ
 */
export async function listNameCandidates(db: Database): Promise<readonly NameCandidate[]> {
  const rows = await db
    .select({ name: records.name, categoryId: records.categoryId, recordCount: count() })
    .from(records)
    .where(isNotNull(records.name))
    .groupBy(records.name, records.categoryId)
  return mergeNameCandidates(
    rows.flatMap(({ name, ...row }) => (name === null ? [] : [{ name, ...row }])),
  )
}

/**
 * 過去の記録に付けたタグを，使われた回数の多い順に取得する
 * @param db Drizzle のクライアント
 * @returns タグ
 */
export async function listTagCandidates(db: Database): Promise<readonly string[]> {
  const tags = await db
    .select({ tag: recordTags.tag })
    .from(recordTags)
    .groupBy(recordTags.tag)
    .orderBy(desc(count()), asc(recordTags.tag))
  return tags.map(({ tag }) => tag)
}
