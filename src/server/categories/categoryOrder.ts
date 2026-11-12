/**
 * 並び替え後のカテゴリの ID が，登録済みのカテゴリの ID をちょうど1回ずつ含むか判定する
 * @param currentIds 登録済みのカテゴリの ID
 * @param orderedIds 並び替え後のカテゴリの ID
 * @returns 過不足と重複がない場合に true
 */
export function isSameCategorySet({
  currentIds,
  orderedIds,
}: {
  currentIds: readonly string[]
  orderedIds: readonly string[]
}): boolean {
  if (currentIds.length !== orderedIds.length) return false
  if (new Set(orderedIds).size !== orderedIds.length) return false
  return orderedIds.every((id) => currentIds.includes(id))
}
