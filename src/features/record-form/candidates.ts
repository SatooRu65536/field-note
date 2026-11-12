import type { NameCandidate, NameMemo } from '@/integrations/field-note-api/adminRecords'
import { normalizeKana } from '@/integrations/intl/normalizeKana'

// 名前の候補として一度に表示する上限
export const MAX_NAME_SUGGESTIONS = 8

/**
 * 入力した名前で始まる過去の名前を，ひらがな・カタカナの違いを無視して探す
 * @param candidates 記録の多い順に並んだ過去の名前
 * @param input 入力中の名前
 * @returns 候補の名前．入力が空の場合や，入力と同じ名前だけの場合は空
 */
export function filterNameSuggestions({
  candidates,
  input,
}: {
  candidates: readonly NameCandidate[]
  input: string
}): readonly string[] {
  const prefix = normalizeKana(input)
  if (prefix === '') return []
  return candidates
    .map(({ name }) => name)
    .filter((name) => name !== input.trim() && normalizeKana(name).startsWith(prefix))
    .slice(0, MAX_NAME_SUGGESTIONS)
}

/**
 * 名前に保存済みのメモを，ひらがな・カタカナの違いを無視して探す
 * @param memos 保存済みの名前ごとのメモ
 * @param name 記録の名前
 * @returns メモ．保存済みのメモがない場合は空文字
 */
export function findSavedNameMemo({
  memos,
  name,
}: {
  memos: readonly NameMemo[]
  name: string
}): string {
  const nameKey = normalizeKana(name)
  return memos.find((memo) => memo.nameKey === nameKey)?.memo ?? ''
}

/**
 * 過去の同じ名前の記録から，カテゴリを推定する
 * @param candidates 過去の名前と，その名前で最も多く使われたカテゴリ
 * @param name 入力中の名前．ひらがな・カタカナの違いは無視する
 * @returns カテゴリの ID．同じ名前の記録がない場合は null
 */
export function inferCategoryId({
  candidates,
  name,
}: {
  candidates: readonly NameCandidate[]
  name: string
}): string | null {
  return findSameNameCandidate({ candidates, name })?.categoryId ?? null
}

/**
 * 過去の同じ名前の記録から，タグを推定する
 * @param candidates 過去の名前と，その名前の記録に付けられたタグ
 * @param name 入力中の名前．ひらがな・カタカナの違いは無視する
 * @returns 使われた回数の多い順のタグ．同じ名前の記録がない場合は null
 */
export function inferTags({
  candidates,
  name,
}: {
  candidates: readonly NameCandidate[]
  name: string
}): readonly string[] | null {
  return findSameNameCandidate({ candidates, name })?.tags ?? null
}

/**
 * ひらがな・カタカナの違いを無視して，同じ名前の過去の記録を探す
 * @param candidates 過去の名前
 * @param name 入力中の名前
 * @returns 同じ名前の候補．ない場合や名前が空の場合は undefined
 */
function findSameNameCandidate({
  candidates,
  name,
}: {
  candidates: readonly NameCandidate[]
  name: string
}): NameCandidate | undefined {
  const nameKey = normalizeKana(name)
  if (nameKey === '') return undefined
  return candidates.find((candidate) => normalizeKana(candidate.name) === nameKey)
}
