import type { Category } from '@/integrations/field-note-api/categories'

export interface CategoryCount {
  readonly category: Category
  readonly count: number
}

/**
 * カテゴリごとの記録の件数を数える
 * @param categories 表示順に並んだカテゴリ
 * @param records 数える記録
 * @returns カテゴリの表示順に並んだ件数．記録がないカテゴリは 0 件
 */
export function countRecordsByCategory({
  categories,
  records,
}: {
  categories: readonly Category[]
  records: readonly { readonly categoryId: string }[]
}): readonly CategoryCount[] {
  return categories.map((category) => ({
    category,
    count: records.filter(({ categoryId }) => categoryId === category.id).length,
  }))
}
