import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

const createIdColumn = () =>
  text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAtColumn = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());
const updatedAtColumn = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

export const categories = sqliteTable("categories", {
  id: createIdColumn(),
  name: text().notNull(),
  // 地図のピンなどで使う表示色（#rrggbb）
  color: text().notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const records = sqliteTable(
  "records",
  {
    id: createIdColumn(),
    // 名前が分からない自然物は null として登録する
    name: text(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    latitude: real().notNull(),
    longitude: real().notNull(),
    // 発見した日．時刻は使わない．列を NULL 可にするにはテーブルを作り直す必要があるため，未発見かどうかは isDiscovered で表す
    discoveredAt: integer("discovered_at", { mode: "timestamp_ms" }).notNull(),
    memo: text().notNull().default(""),
    isPublic: integer("is_public", { mode: "boolean" })
      .notNull()
      .default(false),
    // まだ発見していない記録は false にする．このとき discoveredAt は使わない
    isDiscovered: integer("is_discovered", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("records_location_index").on(table.latitude, table.longitude),
  ],
);

export const recordPhotos = sqliteTable(
  "record_photos",
  {
    id: createIdColumn(),
    recordId: text("record_id")
      .notNull()
      .references(() => records.id, { onDelete: "cascade" }),
    // R2 のオブジェクトキー
    objectKey: text("object_key").notNull(),
    contentType: text("content_type").notNull(),
    sortOrder: integer("sort_order").notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [index("record_photos_record_id_index").on(table.recordId)],
);

export const recordTags = sqliteTable(
  "record_tags",
  {
    recordId: text("record_id")
      .notNull()
      .references(() => records.id, { onDelete: "cascade" }),
    tag: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.recordId, table.tag] }),
    index("record_tags_tag_index").on(table.tag),
  ],
);

// 名前ごとのメモ．同じ名前の記録すべてで共有する
export const nameMemos = sqliteTable("name_memos", {
  // ひらがな・カタカナの違いを無視して同じ名前とみなすため，normalizeKana で揃えた名前をキーにする
  nameKey: text("name_key").primaryKey(),
  memo: text().notNull(),
  updatedAt: updatedAtColumn(),
});
