import { getCookie, getRequestHeader } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'

import { verifyAccessToken } from './verifyAccessToken'

/**
 * 処理中のリクエストが Cloudflare Access で認証された管理者によるものか判定する
 * @returns 管理者のリクエストの場合に true．開発サーバーでは常に true
 */
export async function isAdminRequest(): Promise<boolean> {
  // ローカルの開発サーバーには Cloudflare Access を経由せずにアクセスするため，検証を省く
  if (import.meta.env.DEV) return true

  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN
  const audience = env.CF_ACCESS_AUD
  if (!teamDomain || !audience) {
    console.error('CF_ACCESS_TEAM_DOMAIN または CF_ACCESS_AUD が設定されていません')
    return false
  }

  // サーバー関数・写真の URL は Access の保護対象のパス外のため，ヘッダーがない場合は Cookie を検証する
  const token =
    getRequestHeader('cf-access-jwt-assertion') ?? getCookie('CF_Authorization')
  if (!token) return false

  return verifyAccessToken({ token, teamDomain, audience })
}
