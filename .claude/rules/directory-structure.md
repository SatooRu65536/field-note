---
description: ディレクトリ構成ルール
---

# ディレクトリ構成ルール

field-note のソースコードの配置先を定めるルール．
実装者（人・エージェント）が，ファイルの追加・移動の際に参照することを目的とする．

## 全体

本アプリは，ルート直下の `src/` に TanStack Start の単一アプリとして構成すること．
画面は SSR し，データの取得・更新は TanStack Start のサーバー関数（`createServerFn`）で行うこと．
HTTP の API は設けないこと．
ただし，サーバー関数で返せないレスポンス（例：画像）は，サーバールートで返してよい（[routes](#routes) を参照）．

`src/` 配下は次の構成とすること．

```text
src/
├── routes/                    # 画面・サーバールート（TanStack Router のファイルベースルーティング）
├── features/<feature-name>/   # 特定の機能・画面ドメインに閉じた画面側の実装
├── components/
│   ├── ui/                    # ドメイン知識を持たない UI プリミティブ
│   └── layouts/               # アプリ全体のレイアウト（ヘッダー・サイドバー等）
├── integrations/
│   ├── field-note-api/        # サーバー関数と，そのクエリの設定
│   └── <library>/             # ライブラリ・ブラウザ API の設定（例：tanstack-query/，maplibre/，geolocation/）
├── server/                    # サーバーでのみ動く処理（DB・R2 へのアクセス等）
├── constants/                 # 画面・サーバーの双方で使う定数
├── middlewares/               # start.ts に登録する，特定の feature に属さないリクエストミドルウェア
├── routeTree.gen.ts           # pnpm run generate-routes で生成するルート定義
├── *.d.ts                     # 型宣言（例：cloudflare-workers.d.ts）
├── router.tsx
├── start.ts
└── styles.css
```

リクエストの流れは次の通り．

```text
画面（routes → features） → integrations/field-note-api（サーバー関数） → server/ → D1・R2
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
- 画面を持たないサーバールート（例：写真を配信する `routes/photos/$photoId.ts`）は，コンポーネントを持たない `.ts` ファイルとすること
  - サーバールートは，サーバー関数で返せないレスポンス（例：画像）に限って使うこと

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

- サーバー関数と，それを呼ぶクエリの設定（`queryOptions`）は `src/integrations/field-note-api/` に，リソースごとのファイル（例：`records.ts`・`categories.ts`）として配置すること
  - サーバー関数の書き方は [サーバー関数](#サーバー関数) を参照すること
- 次のものも `src/integrations/field-note-api/` に配置すること
  - サーバー関数の共通のミドルウェア（例：`adminMiddleware.ts`）
  - サーバー関数の入出力の変換・検証（例：`recordFormData.ts`，`tags.ts`）
  - クエリキー（`queryKeys.ts`）
  - サーバー関数が返す値・URL を画面で扱うための純粋関数（例：`recordName.ts`，`photos.ts`）
- ライブラリ・ブラウザ API（例：Geolocation API，Intl）の設定・Provider・薄いラッパーは `src/integrations/<library>/` に配置すること

### middlewares

- `src/start.ts` の `requestMiddleware` に登録する，特定の feature に属さないミドルウェアは `src/middlewares/` に配置すること
- ミドルウェアから切り出した純粋関数は，同じディレクトリに配置してテストを追加すること

## サーバー

`src/server/` 配下は次の構成とすること．

```text
src/server/
├── <domain>/                  # ドメインごとの DB アクセス・ドメインの処理（例：records/，categories/，photos/）
└── lib/                       # ドメイン知識を持たない基盤（DB・R2・Cloudflare Access 等）
```

- `src/server/` は，次の箇所からのみ import すること
  - `src/integrations/field-note-api/` のサーバー関数のハンドラ・ミドルウェアの `.server()`
  - サーバールートのハンドラ
  - これらは TanStack Start のコンパイラが画面側のバンドルから取り除くため

### サーバー関数

サーバー関数は `src/integrations/field-note-api/` に配置する（[integrations](#integrations) を参照）．

- サーバー関数は `createServerFn` で定義し，入力を `.validator()` で実行時に検証すること
  - 検証に失敗しうる入力（例：フォームの入力）は，Result 型（`{ ok: true, value } | { ok: false, error }`）に変換してハンドラに渡し，エラーメッセージを画面に返すこと
- サーバー関数のハンドラは，`src/server/` の処理を呼び出す組み合わせのみを記述し，DB アクセスやドメインロジックを直接書かないこと
- 管理者のみが実行できるサーバー関数（投稿・編集・削除・非公開記録の閲覧）には，`adminMiddleware` を付与すること
  - サーバー関数は `/admin` 以外のパスで動き，Cloudflare Access の保護の対象外となるため，Cloudflare Access の JWT をサーバー側で検証する

### ドメイン

- 記録の取得・登録などの DB アクセス・純粋関数は `src/server/<domain>/`（例：`records/`）に配置すること
- `<domain>/` から他の `<domain>/` を import してよいが，循環させないこと

### lib

- DB クライアント・R2 クライアント・Cloudflare Access の検証など，ドメイン知識を持たない基盤は `src/server/lib/` に配置すること
- DB のスキーマ定義はテーブル構成を持つが，DB クライアントやマイグレーションと一体で扱うため `src/server/lib/db/` に配置すること
- `lib/` から `<domain>/` を import しないこと

## 定数

- 画面・サーバーの双方で使う定数（例：写真の上限枚数）は `src/constants/` に配置すること
- DB の列の値集合（enum 設定・CHECK 制約に使う定数）は，画面で使わないものも含めて `src/constants/` に配置すること
- `src/constants/` からは，`src/` 配下の他のディレクトリを import しないこと
  - 画面・サーバーの双方から参照するため
