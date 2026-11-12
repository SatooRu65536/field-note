---
paths:
  - 'src/server/lib/db/**'
  - 'drizzle/**'
---

# DB スキーマ定義ルール

D1 のテーブルを定義する [schema.ts](../../src/server/lib/db/schema.ts) と，そこから生成するマイグレーション（`drizzle/`）の書き方を定めるルール．
テーブル・列を追加・変更する実装者（人・エージェント）が参照することを目的とする．

## テーブル

- テーブルは `sqliteTable` で定義し，定義した箇所で named export すること
- テーブル名・変数名は複数形とし，テーブル名は `snake_case`，変数名は `camelCase` とすること
  - テーブルの変数は [naming.md](./naming.md) の定数（`SCREAMING_SNAKE_CASE`）の対象外とする

| 対象 | 例 |
| --- | --- |
| テーブル名 | `record_photos` |
| 変数名 | `recordPhotos` |

- テーブルが何を表すかが名前から分からない場合，テーブルの定義の直前に行コメントで説明すること（例：`nameMemos`）

## 列

### 名前

- プロパティ名は `camelCase`，列名は `snake_case` とすること
- 列名がプロパティ名と異なる場合のみ，列名を第1引数で指定すること

```ts
name: text().notNull(),
sortOrder: integer('sort_order').notNull(),
```

### 型

値の種類ごとに，次の列の型を使うこと．

| 値 | 定義 | 例 |
| --- | --- | --- |
| 文字列・ID | `text()` | `name`，`categoryId` |
| 整数 | `integer()` | `sortOrder` |
| 小数 | `real()` | `latitude` |
| 真偽値 | `integer({ mode: 'boolean' })` | `isPublic` |
| 日時・日付 | `integer({ mode: 'timestamp_ms' })` | `createdAt`，`discoveredAt` |

- 真偽値の列のプロパティ名は `is` / `has` / `can` / `should` で始めること（[naming.md](./naming.md) を参照）
- 時刻を使わない日付も `timestamp_ms` で保存すること（例：`discoveredAt`）
- 値の集合が決まっている列は，その値の集合を `src/constants/` に定義すること

### NULL

- 列は原則として `.notNull()` を付けること
- NULL を許す列は，NULL が意味を持つ場合に限り，その意味を行コメントで説明すること（例：名前が分からない自然物の `name`）
- 後から NULL の可否を変えるとテーブルの作り直しになるため，列を追加する時点で NULL の可否を決めること
  - 作り直しを避けるため，NULL の代わりに別の真偽値の列で状態を表してもよい（例：`discoveredAt` と `isDiscovered`）
- 既存のテーブルに `.notNull()` の列を追加する場合，既存の行に入れる値として `.default()` を付けること（例：`0007_add_record_confirmation.sql` の `is_confirmed`）

### 既定値

- 固定の既定値は `.default()` で指定すること（例：`memo` の `''`，`isPublic` の `false`）
- 実行時に決まる値（ID・日時）は，SQL の式ではなく `$defaultFn()`・`$onUpdateFn()` でアプリ側で生成すること
  - `$onUpdateFn()` は Drizzle の更新時（`onConflictDoUpdate` を含む）に値を設定するため，更新処理で `updatedAt` を指定しなくてよい

### 共通の列

ID・作成日時・更新日時の列は，[schema.ts](../../src/server/lib/db/schema.ts) 冒頭の関数で定義し，各テーブルで再利用すること．

| 列 | 関数 | 内容 |
| --- | --- | --- |
| `id` | `createIdColumn()` | 主キー．既定値は `crypto.randomUUID()` |
| `createdAt` | `createdAtColumn()` | 既定値は挿入時の日時 |
| `updatedAt` | `updatedAtColumn()` | 既定値は挿入時の日時．更新時に更新日時を設定する |

- `createdAtColumn()`・`updatedAtColumn()` は列名を関数の中で固定しているため，プロパティ名は `createdAt`・`updatedAt` とすること
- 挿入前に ID が必要な場合（例：子テーブルの行や R2 のオブジェクトキーに使う）は，`crypto.randomUUID()` で生成して明示的に渡すこと

## 主キー

- 主キーは `createIdColumn()` の UUID とすること
  - マイグレーションで投入する初期データは，読める文字列の ID を指定してよい（例：`categories` の `plant`・`fish`）
- ただし，次の場合は `createIdColumn()` を使わなくてよい
  - 自然キーで一意に決まる場合（例：`nameMemos` の `nameKey`）．キーの作り方を行コメントで説明すること
  - 他のテーブルの行に従属する値の集合の場合（例：`recordTags`）．`primaryKey({ columns: [...] })` で複合主キーとすること

## 外部キー

- 外部キーは `.references(() => table.id)` で指定すること
- 親の行とともに削除してよい子の行（例：写真・タグ）は `{ onDelete: 'cascade' }` を指定すること
- 親の行を削除しても残すべき参照（例：記録からカテゴリーへの参照）には `onDelete` を指定しないこと

## インデックス

- インデックスは `sqliteTable` の第3引数で配列として定義すること
- インデックス名は `<テーブル名>_<対象>_index` とすること
  - 対象が1列の場合は列名（例：`record_photos_record_id_index`），複数の列の場合は列の組が表す概念の名前（例：緯度・経度の `records_location_index`）とすること
- 親の行から子の行を検索する外部キーの列には，その列で始まる主キー・インデックスがない場合，インデックスを付けること（例：`record_photos.record_id`）

## コメント

- 列の意味・制約・値の使い方が型と名前から分からない場合，その列の直前に行コメントを書くこと（[comment.md](./comment.md) を参照）
  - 例：色の書式（`#rrggbb`），他の列との関係（`isDiscovered` が `false` のとき `discoveredAt` を使わないこと）

## マイグレーション

スキーマを変更した後，次の流れでマイグレーションを作成・適用すること．

```text
schema.ts の変更 → pnpm run db:generate → 生成した SQL の確認 → pnpm run db:migrate:local
```

```bash
pnpm run db:generate --name <変更内容>
pnpm run db:migrate:local
```

- `--name` には変更内容を `snake_case` の英語で指定すること（例：`rename_is_confirmed_to_is_discovered`）
- データの投入・更新など，スキーマの差分から生成できない変更は `--custom` で空のマイグレーションを作成し，SQL を手で書くこと（例：`0001_seed_categories.sql`，`0006_add_fish_category.sql`）
- リモートの D1（`pnpm run db:migrate:remote`）に適用したマイグレーションは編集しないこと
- `drizzle/meta/` は drizzle-kit が管理するため，手で編集しないこと

### テーブルの作り直し

列の型・NULL の可否・既定値の変更などでは，drizzle-kit がテーブルを作り直す SQL（`__new_<テーブル名>` を作成して `DROP TABLE`）を生成する．
D1 では `PRAGMA foreign_keys=OFF` が効かないため（`0009_use_runtime_timestamp_defaults.sql` の先頭のコメントを参照），作り直すテーブルを参照する子テーブルの行が `ON DELETE cascade` で消える．

- テーブルを作り直す SQL が生成された場合，作り直すテーブルを参照する子テーブルがないか確認すること
- 子テーブルがある場合，生成した SQL を次の順に書き換えること（例：`0009_use_runtime_timestamp_defaults.sql`）
  1. 子テーブルの行を `__backup_<テーブル名>` に退避する
  2. 子テーブルを削除する
  3. 親テーブルを作り直す
  4. 子テーブルを作り直し，退避した行を戻して `__backup_<テーブル名>` を削除する
  5. 子テーブルのインデックスを作り直す
- 書き換えた理由を SQL の先頭にコメントで書くこと
