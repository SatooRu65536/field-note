/// <reference types="@cloudflare/workers-types" />

declare namespace Cloudflare {
  interface Env {
    readonly DB: D1Database
    readonly PHOTOS: R2Bucket
    // Cloudflare Access のチームドメイン（例：https://<team>.cloudflareaccess.com）
    readonly CF_ACCESS_TEAM_DOMAIN?: string
    // 管理画面を保護する Cloudflare Access アプリケーションの AUD タグ
    readonly CF_ACCESS_AUD?: string
  }
}
