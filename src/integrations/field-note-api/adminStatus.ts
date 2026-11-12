import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { isAdminRequest } from '@/server/lib/cloudflare-access/isAdminRequest'

import { QUERY_KEYS } from './queryKeys'

// 一般ユーザー向けの画面で管理者向けの操作を出し分けるため，ミドルウェアで拒否せず判定結果を返す
const getIsAdmin = createServerFn({ method: 'GET' }).handler(async () => isAdminRequest())

/**
 * 閲覧中の利用者が Cloudflare Access で認証された管理者か判定するクエリの設定を作成する
 * @returns クエリの設定．管理者の場合，データは true
 */
export function adminStatusQueryOptions() {
  return queryOptions({
    queryKey: QUERY_KEYS.adminStatus,
    queryFn: () => getIsAdmin(),
    staleTime: Infinity,
  })
}
