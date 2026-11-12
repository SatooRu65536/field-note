import { createRemoteJWKSet, jwtVerify } from 'jose'

type RemoteJwkSet = ReturnType<typeof createRemoteJWKSet>

// 公開鍵の取得結果を Worker のインスタンス内で使い回すため，チームドメインごとに保持する
const jwkSets = new Map<string, RemoteJwkSet>()

function getJwkSet(teamDomain: string): RemoteJwkSet {
  const cached = jwkSets.get(teamDomain)
  if (cached) return cached

  const jwkSet = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', teamDomain))
  jwkSets.set(teamDomain, jwkSet)
  return jwkSet
}

/**
 * Cloudflare Access が発行した JWT を検証する
 * @param token Cf-Access-Jwt-Assertion ヘッダーまたは CF_Authorization Cookie の値
 * @param teamDomain Cloudflare Access のチームドメイン
 * @param audience Cloudflare Access アプリケーションの AUD タグ
 * @returns 署名・発行者・AUD・有効期限がすべて正しい場合に true
 */
export async function verifyAccessToken({
  token,
  teamDomain,
  audience,
}: {
  token: string
  teamDomain: string
  audience: string
}): Promise<boolean> {
  try {
    await jwtVerify(token, getJwkSet(teamDomain), {
      issuer: teamDomain,
      audience,
    })
    return true
  } catch (error) {
    console.warn('Cloudflare Access の JWT の検証に失敗しました', error)
    return false
  }
}
