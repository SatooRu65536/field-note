import { createMiddleware } from '@tanstack/react-start'

import { isAdminRequest } from '@/server/lib/cloudflare-access/isAdminRequest'

// 管理者向けのサーバー関数に付与し，Cloudflare Access で認証されていないリクエストを拒否する
export const adminMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    if (!(await isAdminRequest())) {
      throw new Error('管理者として認証されていません')
    }
    return next()
  },
)
