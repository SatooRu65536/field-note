import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: text().primaryKey(),
  name: text().notNull(),
  // 地図のピンなどで使う表示色（#rrggbb）
  color: text().notNull(),
  sortOrder: integer('sort_order').notNull(),
})

export const records = sqliteTable(
  'records',
  {
    id: text().primaryKey(),
    // 名前が分からない自然物は null として登録する
    name: text(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    latitude: real().notNull(),
    longitude: real().notNull(),
    discoveredAt: integer('discovered_at', { mode: 'timestamp_ms' }).notNull(),
    memo: text().notNull().default(''),
    isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index('records_location_index').on(table.latitude, table.longitude),
  ],
)

export const recordPhotos = sqliteTable(
  'record_photos',
  {
    id: text().primaryKey(),
    recordId: text('record_id')
      .notNull()
      .references(() => records.id, { onDelete: 'cascade' }),
    // R2 のオブジェクトキー
    objectKey: text('object_key').notNull(),
    contentType: text('content_type').notNull(),
    sortOrder: integer('sort_order').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index('record_photos_record_id_index').on(table.recordId)],
)

export const recordTags = sqliteTable(
  'record_tags',
  {
    recordId: text('record_id')
      .notNull()
      .references(() => records.id, { onDelete: 'cascade' }),
    tag: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.recordId, table.tag] }),
    index('record_tags_tag_index').on(table.tag),
  ],
)

// 名前ごとのメモ．同じ名前の記録すべてで共有する
export const nameMemos = sqliteTable('name_memos', {
  // ひらがな・カタカナの違いを無視して同じ名前とみなすため，normalizeKana で揃えた名前をキーにする
  nameKey: text('name_key').primaryKey(),
  memo: text().notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})
