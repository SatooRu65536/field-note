import { normalizeKana } from '@/integrations/intl/normalizeKana'

export interface NameCategoryCount {
  readonly name: string
  readonly categoryId: string
  readonly recordCount: number
}

export interface NameTagCount {
  readonly name: string
  readonly tag: string
  readonly recordCount: number
}

export interface NameCandidate {
  readonly name: string
  // ひらがな・カタカナの違いを無視して同じ名前とみなした記録の件数
  readonly recordCount: number
  // 同じ名前の記録で最も多く使われたカテゴリ
  readonly categoryId: string
  // 同じ名前の記録の半数以上に付けられたタグ．使われた回数の多い順
  readonly tags: readonly string[]
}

/**
 * 件数の多い順，同数の場合は名前の順に並べるための比較関数
 * @param a 比較する値
 * @param b 比較する値
 * @returns a を先に並べる場合は負の数
 */
function compareByCount(
  a: { readonly name: string; readonly recordCount: number },
  b: { readonly name: string; readonly recordCount: number },
): number {
  return b.recordCount - a.recordCount || a.name.localeCompare(b.name, 'ja')
}

/**
 * 値ごとに件数を合計し，件数の多い順に並べる
 * @param rows 値と件数
 * @returns 値．同数の場合は値の順
 */
function sortByFrequency(
  rows: readonly { readonly value: string; readonly recordCount: number }[],
): readonly string[] {
  const values = [...new Set(rows.map(({ value }) => value))]
  const totals = values.map((value) => ({
    name: value,
    recordCount: rows
      .filter((row) => row.value === value)
      .reduce((total, { recordCount }) => total + recordCount, 0),
  }))
  return [...totals].sort(compareByCount).map(({ name }) => name)
}

/**
 * ひらがな・カタカナの違いだけの名前を1つにまとめ，記録の多い順に並べる
 * @param rows 名前とカテゴリの組ごとの記録の件数
 * @param tagRows 名前とタグの組ごとの記録の件数
 * @returns まとめた名前．表記と推定するカテゴリは最も多く使われたものにし，タグは半数以上の記録に付けられたものを使われた回数の多い順に並べる
 */
export function mergeNameCandidates({
  rows,
  tagRows,
}: {
  rows: readonly NameCategoryCount[]
  tagRows: readonly NameTagCount[]
}): readonly NameCandidate[] {
  const nameKeys = [...new Set(rows.map(({ name }) => normalizeKana(name)))]
  const merged = nameKeys.map((nameKey) => {
    const group = rows.filter(({ name }) => normalizeKana(name) === nameKey)
    return {
      name: findMostFrequent(group.map(({ name, recordCount }) => ({ value: name, recordCount }))),
      recordCount: group.reduce((total, { recordCount }) => total + recordCount, 0),
      categoryId: findMostFrequent(
        group.map(({ categoryId, recordCount }) => ({ value: categoryId, recordCount })),
      ),
      tags: selectFrequentTags({
        tagRows: tagRows.filter(({ name }) => normalizeKana(name) === nameKey),
        recordCount: group.reduce((total, { recordCount }) => total + recordCount, 0),
      }),
    }
  })
  return [...merged].sort(compareByCount)
}

/**
 * 値ごとに件数を合計し，最も件数の多い値を返す
 * @param rows 値と件数
 * @returns 最も件数の多い値．同数の場合は値の順で先のもの
 */
function findMostFrequent(
  rows: readonly { readonly value: string; readonly recordCount: number }[],
): string {
  return sortByFrequency(rows)[0] ?? ''
}

/**
 * 同じ名前の記録の半数以上に付けられたタグを，使われた回数の多い順に選ぶ
 * @param tagRows 同じ名前の記録のタグごとの件数
 * @param recordCount 同じ名前の記録の件数
 * @returns タグ
 */
function selectFrequentTags({
  tagRows,
  recordCount,
}: {
  tagRows: readonly NameTagCount[]
  recordCount: number
}): readonly string[] {
  const rows = tagRows.map(({ tag, recordCount: count }) => ({ value: tag, recordCount: count }))
  // 一度だけ付けたタグまで推定すると推定が多すぎるため，半数以上の記録に付けられたタグに絞る
  return sortByFrequency(rows).filter((tag) => {
    const tagCount = rows
      .filter(({ value }) => value === tag)
      .reduce((total, { recordCount: count }) => total + count, 0)
    return tagCount * 2 >= recordCount
  })
}
