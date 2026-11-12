---
description: ディレクトリ構成ルール
---

# ディレクトリ構成ルール

field-note のソースコードの配置先を定めるルール．
実装者（人・エージェント）が，ファイルの追加・移動の際に参照することを目的とする．

## 全体

本アプリは，ルート直下の `src/` に TanStack Start の単一アプリとして構成すること．
API は Hono で実装し，TanStack Start のサーバールートにマウントすること．

`src/` 配下は次の構成とすること．

```text
src/
├── routes/                    # 画面・サーバールート（TanStack Router のファイルベースルーティング）
├── features/<feature-name>/   # 特定の機能・画面ドメインに閉じた画面側の実装
├── components/
│   ├── ui/                    # ドメイン知識を持たない UI プリミティブ
│   └── layouts/               # アプリ全体のレイアウト（ヘッダー・サイドバー等）
├── integrations/
│   ├── field-note-api/        # 画面から API へのリクエスト
│   └── <library>/             # ライブラリの設定（例：tanstack-query/，maplibre/）
├── server/                    # Hono による API の実装
├── constants/                 # 画面・API の双方で使う定数
├── middlewares/               # start.ts に登録する，特定の feature に属さないリクエストミドルウェア
├── routeTree.gen.ts           # pnpm run generate-routes で生成するルート定義
├── *.d.ts                     # 型宣言（例：cloudflare-workers.d.ts）
├── router.tsx
├── start.ts
└── styles.css
```

リクエストの流れは次の通り．

```text
画面（routes → features） → integrations/field-note-api → routes/api/$.ts → server/（Hono） → D1・R2
```

## 画面

### routes

- 画面は `src/routes/` 配下に，TanStack Router のファイルベースルーティングで配置すること
- URL のセグメントごとにフォルダを分けること（例：`routes/records/$recordId.tsx`，`routes/admin/records/new.tsx`）
  - `records.new.tsx` のようなドット区切りのファイル名を使わないこと
  - 同じセグメント配下に入れ子にしない画面がある場合，`<segment>.tsx` ではなく `<segment>/index.tsx` とすること（例：`routes/admin/records/index.tsx` と `routes/admin/records/new.tsx`）
    - `<segment>.tsx`・`<segment>/route.tsx` はレイアウトルートになり，同じフォルダの画面が子ルートになるため
- ルートファイルを追加・移動した場合，`pnpm run generate-routes` を実行し，`routeTree.gen.ts` と `createFileRoute` のパスを更新すること
  - `routeTree.gen.ts` は生成ファイルのため，手で編集しないこと
- ルートファイルは loader と，レイアウト・feature・共通コンポーネントの組み合わせのみを記述し，画面固有の実装は feature に配置すること
  - ルートファイルに見た目の CSS を書かないこと（[見た目の CSS](#見た目の-css) を参照）
- 画面を持たないルート（例：Hono をマウントする `routes/api/$.ts`）は，コンポーネントを持たない `.ts` ファイルとすること

#### 管理画面

- 投稿・編集・削除を行う管理画面は，`src/routes/admin/` 配下に配置すること
  - Cloudflare Access で `/admin` 以下のパスをまとめて保護するため
- 一般ユーザー向けの閲覧画面は，`src/routes/admin/` 以外に配置すること

### features

- 特定の機能・画面ドメインに閉じたコンポーネントや hook は `src/features/<feature-name>/` に配置すること
- feature ディレクトリ配下は次の構成とし，該当するものがある場合のみ配置すること

```text
features/<feature-name>/
├── index.tsx      # 公開 API
├── components/    # プレゼンテーション用コンポーネント
├── hooks/         # その feature だけで使う hook
└── *.ts           # 検証・変換・選択肢・型定義など（例：validation.ts，types.ts）
```

- feature 名は，`map` のような広い語ではなく，内容を具体的に表す名前とすること（例：`record-map`，`record-form`）
- 複数のルート・feature で再利用する，ドメイン知識を持たない UI プリミティブは feature に置かず `src/components/ui` に配置すること
- `src/features/<feature-name>/index.tsx` は，その feature の公開 API とすること
  - feature 外部（他の feature やルート）からは，`index.tsx` 以外のモジュール（`components/`・`hooks/` 配下や feature 直下の `*.ts`）を直接 import せず，必ずこの `index.tsx` を経由すること
  - feature が独自の hook を持つ場合，`index.tsx` はその hook を呼び出し，取得した値を `components/` 配下のプレゼンテーション用コンポーネントへ渡すこと
    - ただし，コンポーネントの内部の状態（例：地図の表示範囲）に応じて取得する hook は，そのコンポーネントから呼んでよい
      - 状態を `index.tsx` へ持ち上げると，状態が変わるたびに画面全体を描き直すため
- `src/features/` から `src/server/` を import しないこと

### コンポーネント

- 複数のルート・feature で使用する共通コンポーネントは `src/components` に配置すること
- `src/components` には hook を置かないこと
  - 複数のルート・feature で使う hook も，feature の `hooks/` に配置して `index.tsx` から公開すること
- コンポーネントと一緒に使う Context・スタイル定数（例：`ui/styles.ts`）は，`src/components` に置いてよい
- ボタンなどのプリミティブな UI 要素は `src/components/ui` に配置すること
- 複数のルート・feature で，ドメイン知識を持たない同じ見た目の UI が重複した場合，`src/components/ui` に切り出すこと
- ヘッダー・サイドバーなど，アプリ全体のレイアウトに関わるものは `src/components/layouts` に配置すること

### 見た目の CSS

- 見た目に関する CSS（Panda CSS の `css()` 等）は，必ず `src/components/` 配下か `src/features/<feature-name>/components/` 配下でのみ書くこと
  - ルートファイル・feature の `index.tsx`・hook などには書かないこと
  - ルートで余白や最大幅を指定したい場合も，コンポーネント（例：`src/components/layouts/PageLayout.tsx`）に切り出すこと

### integrations

- 画面から API へのリクエストは `src/integrations/field-note-api/` に，リソースごとのファイル（例：`records.ts`・`categories.ts`）として配置すること
  - リクエストの共通処理は `apiClient.ts` に配置し，各ファイルから使うこと
- ライブラリの設定・Provider は `src/integrations/<library>/` に配置すること

### middlewares

- `src/start.ts` の `requestMiddleware` に登録する，特定の feature に属さないミドルウェアは `src/middlewares/` に配置すること
- ミドルウェアから切り出した純粋関数は，同じディレクトリに配置してテストを追加すること

## API

`src/server/` 配下は次の構成とすること．

```text
src/server/
├── app.ts                     # Hono アプリ（各 feature のルートをマウント）
├── features/
│   ├── <resource>/            # 一般ユーザー向けのエンドポイント（/api/<resource>）
│   └── admin/<resource>/      # 管理者向けのエンドポイント（/api/admin/<resource>）
├── common/<domain>/           # 複数の feature で使うドメインの処理
└── lib/                       # ドメイン知識を持たない基盤（DB・R2・Cloudflare Access 等）
```

- `src/server/` は，`src/routes/api/$.ts` からのみ import すること
  - API の実装を画面側のバンドルに含めないため

### features

- 特定のリソースに閉じたルート・validator・ハンドラ・ドメインの処理は `src/server/features/<resource>/` に配置すること
- `<resource>` はルートをマウントするパス（例：`/api/records` → `records/`）と揃えること
- 管理者のみが実行できるエンドポイント（投稿・編集・削除・非公開記録の閲覧）は `src/server/features/admin/<resource>/` に配置し，`/api/admin/<resource>` にマウントすること
  - Cloudflare Access で `/api/admin` 以下のパスをまとめて保護するため
- feature ディレクトリ配下は次の構成とし，`validators.ts`・`domain/` は該当するものがある場合のみ配置すること

```text
features/<resource>/
├── routes.ts      # ルート
├── validators.ts  # validator
├── usecases/      # ハンドラ（1エンドポイント1ファイル）
└── domain/        # その feature だけで使う DB アクセス・純粋関数・ミドルウェア
```

- feature から他の feature を import しないこと
  - 複数の feature で使うもの（例：`records/` と `admin/records/` の双方で使う記録の取得処理）は `common/` または `lib/` に配置すること

#### routes.ts

- ルートはパス・ミドルウェア・ハンドラの組み合わせのみを記述し，具体的な実装を持たないこと
- ハンドラは `createHandlers` が返す配列のため，スプレッド構文で展開して渡すこと

```ts
.get('/', ...listRecords)
```

#### usecases

- 各エンドポイントのハンドラは `usecases/<handlerName>.ts` に，1エンドポイント1ファイルで配置すること
- ハンドラは hono の `createFactory<Env, Path>().createHandlers(validator, handler)` で定義すること
  - validator とハンドラを1組にまとめ，`c.req.valid()` の型を validator から推論させるため
  - validator がないハンドラも，ルートでの渡し方を揃えるため `createHandlers` で定義すること
- ルートに書いたミドルウェアは validator より前に実行されるため，検証の後に実行するミドルウェアは `createHandlers` の validator の後に含めること
- DB アクセスやドメインロジックはハンドラに直接書かず，`domain/` または `common/` に配置すること

#### validators.ts

- リクエストの検証は `@hono/standard-validator` の `sValidator` で行うこと
- validator は検証に失敗した場合のエラーレスポンスまで含めて定義すること

### common

- 複数の feature で使う DB アクセス・純粋関数・ミドルウェアは `src/server/common/<domain>/`（例：`records/`）に配置すること
- 1つの feature だけで使うものは，対象のドメインに関わらずその feature の `domain/` に配置すること
- `common/` から `features/` を import しないこと

### lib

- DB クライアント・R2 クライアント・Cloudflare Access の検証・エラーハンドラ・検証の補助関数など，ドメイン知識を持たない基盤は `src/server/lib/` に配置すること
- DB のスキーマ定義はテーブル構成を持つが，DB クライアントやマイグレーションと一体で扱うため `src/server/lib/db/` に配置すること
- `lib/` から `features/`・`common/` を import しないこと

## 定数

- DB の列の値集合（enum 設定・CHECK 制約に使う定数）は，画面で使わないものも含めて `src/constants/` に配置すること
- `src/constants/` からは，`src/` 配下の他のディレクトリを import しないこと
  - 画面・API の双方から参照するため
