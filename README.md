# Field Note

現実世界で発見した自然物を，写真・発見場所・発見日時とともに地図上に記録・共有する Web アプリ．
本ドキュメントは，開発環境の構築とデプロイを行う開発者を対象とする．
機能の企画は [docs/proposal.md](docs/proposal.md) を参照すること．

## 構成

| 分類 | 技術 |
| --- | --- |
| フレームワーク | TanStack Start（SSR・サーバー関数） |
| データ取得 | TanStack Query |
| スタイル | Panda CSS |
| 地図 | MapLibre GL JS，react-map-gl，CARTO のベースマップ |
| データベース | Cloudflare D1（Drizzle ORM） |
| 写真の保存 | Cloudflare R2 |
| 管理画面の保護 | Cloudflare Access |
| ホスティング | Cloudflare Workers |

画面は SSR し，データの取得・更新は TanStack Start のサーバー関数で行う．
写真は `/photos/$photoId` から配信し，非公開の記録の写真は管理者にのみ返す．

```text
画面（routes → features） → integrations/field-note-api（サーバー関数） → server/ → D1・R2
```

## 開発環境の構築

```bash
pnpm install
pnpm run db:migrate:local
pnpm run dev
```

- `pnpm install` の `prepare` で，Panda CSS のコード（`styled-system/`）を生成する
- `pnpm run db:migrate:local` で，ローカルの D1 にテーブルと初期カテゴリを作成する
- 開発サーバーでは，管理者の認証を省略する

### 環境変数

| 変数名 | 設定先 | 説明 |
| --- | --- | --- |
| `CF_ACCESS_TEAM_DOMAIN` | Workers のシークレット | Cloudflare Access のチームドメイン（例：`https://<team>.cloudflareaccess.com`） |
| `CF_ACCESS_AUD` | Workers のシークレット | 管理画面を保護する Cloudflare Access アプリケーションの AUD タグ |

### 地図タイル

地図タイルは，CARTO のベースマップ（Positron のラベルなし版）を使う．
スタイルの URL は [src/integrations/maplibre/mapStyle.ts](src/integrations/maplibre/mapStyle.ts) で指定している．
利用条件は CARTO の規約を確認すること．

### 地名検索

管理者は，地図の検索欄で国土地理院の地名検索 API（キー不要）を使って地名を検索できる．
処理は [src/integrations/gsi/placeSearch.ts](src/integrations/gsi/placeSearch.ts) にある．
検索結果には出典として「地名検索：国土地理院」を表示している．

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `pnpm run dev` | 開発サーバーを起動する |
| `pnpm run build` | 本番用にビルドする |
| `pnpm run generate-routes` | `src/routeTree.gen.ts` を生成する |
| `pnpm run typecheck` | 型検査を行う |
| `pnpm run test` | テストを実行する |
| `pnpm run db:generate` | スキーマの変更からマイグレーションを生成する |
| `pnpm run db:migrate:local` | ローカルの D1 にマイグレーションを適用する |
| `pnpm run db:migrate:remote` | 本番の D1 にマイグレーションを適用する |
| `pnpm run deploy` | ビルドして Cloudflare Workers にデプロイする |

## デプロイ

1. D1 のデータベースと R2 のバケットを作成する

   ```bash
   pnpm exec wrangler d1 create field-note
   pnpm exec wrangler r2 bucket create field-note-photos
   ```

2. 作成したデータベースの ID を [wrangler.jsonc](wrangler.jsonc) の `database_id` に設定する
3. 本番の D1 にマイグレーションを適用する

   ```bash
   pnpm run db:migrate:remote
   ```

4. Cloudflare Access で，`/admin` 以下のパスを保護するアプリケーションを作成する
5. `CF_ACCESS_TEAM_DOMAIN`・`CF_ACCESS_AUD` を Workers のシークレットに設定する

   ```bash
   pnpm exec wrangler secret put CF_ACCESS_TEAM_DOMAIN
   pnpm exec wrangler secret put CF_ACCESS_AUD
   ```

   - ダッシュボードで設定した変数は，`wrangler.jsonc` に `vars` がない場合，次のデプロイで削除される（`node_modules/wrangler/config-schema.json` の `keep_vars` の説明）．シークレットは削除されない

6. デプロイする

   ```bash
   pnpm run deploy
   ```

管理者向けのサーバー関数と写真の配信は `/admin` 以外のパスで動くため，Access の保護対象のパス外となる．
そのため，サーバー側で `Cf-Access-Jwt-Assertion` ヘッダーまたは `CF_Authorization` Cookie の JWT を検証する．
管理画面の操作が拒否される場合は，`CF_Authorization` Cookie が `/admin` 以外のパスにも送られているか確認すること．
