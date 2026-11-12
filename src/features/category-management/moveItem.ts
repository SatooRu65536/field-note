/**
 * 配列の要素を前後に移動する
 * @param items 並び替える配列
 * @param index 移動する要素の位置
 * @param offset 移動する量．負の数は前へ，正の数は後ろへ移動する
 * @returns 移動した新しい配列．移動先が範囲外の場合は元と同じ並び
 */
export function moveItem<T>({
  items,
  index,
  offset,
}: {
  items: readonly T[]
  index: number
  offset: number
}): readonly T[] {
  const targetIndex = index + offset
  const item = items[index]
  if (item === undefined || targetIndex < 0 || targetIndex >= items.length) return items
  const rest = items.filter((_, itemIndex) => itemIndex !== index)
  return [...rest.slice(0, targetIndex), item, ...rest.slice(targetIndex)]
}
