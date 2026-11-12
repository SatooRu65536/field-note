import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { listCategories } from '@/server/categories/categoryRepository'
import type { Category } from '@/server/categories/categoryRepository'
import { createDatabase } from '@/server/lib/db/client'

import { QUERY_KEYS } from './queryKeys'

export type { Category }

const getCategories = createServerFn({ method: 'GET' }).handler(async () =>
  listCategories(createDatabase()),
)

/**
 * カテゴリの一覧を取得するクエリの設定を作成する
 * @returns クエリの設定
 */
export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => getCategories(),
    // カテゴリはマイグレーションでのみ変わるため，再取得しない
    staleTime: Infinity,
  })
}
