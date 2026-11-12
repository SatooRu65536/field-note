// 1件の記録に付けられるタグの上限数
export const MAX_TAG_COUNT = 20

// タグ1つあたりの上限文字数
export const MAX_TAG_LENGTH = 30

/**
 * 入力されたタグを保存する形式に揃える
 * @param tags 入力されたタグ
 * @returns 前後の空白と先頭の # を除き，空のタグと重複を取り除いたタグ
 */
export function normalizeTags(tags: readonly string[]): readonly string[] {
  const normalized = tags
    .map((tag) => tag.trim().replace(/^#+/, '').trim())
    .filter((tag) => tag !== '')
  return [...new Set(normalized)]
}
