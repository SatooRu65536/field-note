import { eq, max } from 'drizzle-orm'

import type { Database } from '@/server/lib/db/client'
import { categories } from '@/server/lib/db/schema'

import { isSameCategorySet } from './categoryOrder'

export type CategoryCommandResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string }

/**
 * カテゴリを並び順の最後に追加する
 * @param db Drizzle のクライアント
 * @param name カテゴリの名前
 * @param color 地図のピンなどに使う色
 * @returns 追加の結果
 */
export async function createCategory({
  db,
  name,
  color,
}: {
  db: Database
  name: string
  color: string
}): Promise<CategoryCommandResult> {
  const [sortOrder] = await db.select({ value: max(categories.sortOrder) }).from(categories)
  await db.insert(categories).values({
    name,
    color,
    sortOrder: (sortOrder?.value ?? 0) + 1,
  })
  return { ok: true }
}

/**
 * カテゴリの名前と色を変更する
 * @param db Drizzle のクライアント
 * @param categoryId 変更するカテゴリの ID
 * @param name 変更後の名前
 * @param color 変更後の色
 * @returns 変更の結果．カテゴリが存在しない場合はエラー
 */
export async function updateCategory({
  db,
  categoryId,
  name,
  color,
}: {
  db: Database
  categoryId: string
  name: string
  color: string
}): Promise<CategoryCommandResult> {
  const updated = await db
    .update(categories)
    .set({ name, color })
    .where(eq(categories.id, categoryId))
    .returning({ id: categories.id })
  if (updated.length === 0) return { ok: false, error: 'カテゴリが存在しません' }
  return { ok: true }
}

/**
 * カテゴリの並び順を，指定した ID の順に変更する
 * @param db Drizzle のクライアント
 * @param categoryIds 並び替え後のカテゴリの ID．登録済みのカテゴリをすべて含む
 * @returns 変更の結果．登録済みのカテゴリと過不足がある場合はエラー
 * @throws D1 の更新に失敗した場合
 */
export async function reorderCategories({
  db,
  categoryIds,
}: {
  db: Database
  categoryIds: readonly string[]
}): Promise<CategoryCommandResult> {
  const current = await db.select({ id: categories.id }).from(categories)
  if (!isSameCategorySet({ currentIds: current.map(({ id }) => id), orderedIds: categoryIds })) {
    return { ok: false, error: 'カテゴリが追加・変更されたため，画面を再読み込みしてください' }
  }

  const [first, ...rest] = categoryIds.map((id, index) =>
    db.update(categories).set({ sortOrder: index + 1 }).where(eq(categories.id, id)),
  )
  if (!first) return { ok: true }
  // D1 の batch はトランザクションとして実行されるため，並び順が途中までしか変わらないことはない
  await db.batch([first, ...rest])
  return { ok: true }
}
