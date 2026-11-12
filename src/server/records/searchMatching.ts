import { normalizeKana } from '@/integrations/intl/normalizeKana'

/**
 * 記録の名前またはタグが検索語を含むか，ひらがな・カタカナ，全角・半角，大文字・小文字の違いを無視して判定する
 * @param name 記録の名前．名前が分からない記録は null
 * @param tags 記録のタグ
 * @param query 検索語
 * @returns 名前またはタグのいずれかが検索語を含む場合に true．検索語が空の場合は false
 */
export function matchesSearchQuery({
  name,
  tags,
  query,
}: {
  name: string | null
  tags: readonly string[]
  query: string
}): boolean {
  const normalizedQuery = normalizeKana(query)
  if (normalizedQuery === '') return false
  return [name ?? '', ...tags].some((text) => normalizeKana(text).includes(normalizedQuery))
}
