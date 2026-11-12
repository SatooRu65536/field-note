import { asc } from 'drizzle-orm'

import type { Database } from '@/server/lib/db/client'
import { categories } from '@/server/lib/db/schema'

export interface Category {
  readonly id: string
  readonly name: string
  readonly color: string
}

/**
 * カテゴリを表示順に取得する
 * @param db Drizzle のクライアント
 * @returns カテゴリの一覧
 */
export async function listCategories(db: Database): Promise<readonly Category[]> {
  return db
    .select({ id: categories.id, name: categories.name, color: categories.color })
    .from(categories)
    .orderBy(asc(categories.sortOrder))
}
