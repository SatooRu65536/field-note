import { eq } from 'drizzle-orm'
import type { BatchItem } from 'drizzle-orm/batch'

import { normalizeKana } from '@/integrations/intl/normalizeKana'
import type { Database } from '@/server/lib/db/client'
import { nameMemos } from '@/server/lib/db/schema'

/**
 * 名前ごとのメモを取得する
 * @param db Drizzle のクライアント
 * @param name 記録の名前．ひらがな・カタカナの違いは無視する
 * @returns メモ．メモがない場合は空文字
 */
export async function findNameMemo({
  db,
  name,
}: {
  db: Database
  name: string
}): Promise<string> {
  const [nameMemo] = await db
    .select({ memo: nameMemos.memo })
    .from(nameMemos)
    .where(eq(nameMemos.nameKey, normalizeKana(name)))
  return nameMemo?.memo ?? ''
}

export interface NameMemo {
  // normalizeKana で揃えた名前
  readonly nameKey: string
  readonly memo: string
}

/**
 * 保存済みの名前ごとのメモをすべて取得する
 * @param db Drizzle のクライアント
 * @returns 名前ごとのメモ
 */
export async function listNameMemos(db: Database): Promise<readonly NameMemo[]> {
  return db.select({ nameKey: nameMemos.nameKey, memo: nameMemos.memo }).from(nameMemos)
}

/**
 * 名前ごとのメモを保存するクエリを作成する．メモが空の場合は削除するクエリを作成する
 * @param db Drizzle のクライアント
 * @param name 記録の名前
 * @param memo 保存するメモ
 * @returns 記録の保存とまとめて実行するためのクエリ
 */
export function createSaveNameMemoQuery({
  db,
  name,
  memo,
}: {
  db: Database
  name: string
  memo: string
}): BatchItem<'sqlite'> {
  const nameKey = normalizeKana(name)
  if (memo === '') return db.delete(nameMemos).where(eq(nameMemos.nameKey, nameKey))
  return db
    .insert(nameMemos)
    .values({ nameKey, memo })
    .onConflictDoUpdate({ target: nameMemos.nameKey, set: { memo } })
}
