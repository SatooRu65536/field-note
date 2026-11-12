import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

import * as schema from './schema'

export type Database = DrizzleD1Database<typeof schema>

/**
 * D1 のバインディングから Drizzle のクライアントを作成する
 * @returns Drizzle のクライアント
 */
export function createDatabase(): Database {
  return drizzle(env.DB, { schema })
}
