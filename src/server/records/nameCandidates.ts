import { normalizeKana } from '@/integrations/intl/normalizeKana'

export interface NameCategoryCount {
  readonly name: string
  readonly categoryId: string
  readonly recordCount: number
}

export interface NameCandidate {
  readonly name: string
  // ひらがな・カタカナの違いを無視して同じ名前とみなした記録の件数
  readonly recordCount: number
  // 同じ名前の記録で最も多く使われたカテゴリ
  readonly categoryId: string
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
 * 値ごとに件数を合計し，最も件数の多い値を返す
 * @param rows 値と件数
 * @returns 最も件数の多い値．同数の場合は値の順で先のもの
 */
function findMostFrequent(
  rows: readonly { readonly value: string; readonly recordCount: number }[],
): string {
  const values = [...new Set(rows.map(({ value }) => value))]
  const totals = values.map((value) => ({
    name: value,
    recordCount: rows
      .filter((row) => row.value === value)
      .reduce((total, { recordCount }) => total + recordCount, 0),
  }))
  return [...totals].sort(compareByCount)[0]?.name ?? ''
}

/**
 * ひらがな・カタカナの違いだけの名前を1つにまとめ，記録の多い順に並べる
 * @param rows 名前とカテゴリの組ごとの記録の件数
 * @returns まとめた名前．表記と推定するカテゴリは，最も多く使われたものにする
 */
export function mergeNameCandidates(rows: readonly NameCategoryCount[]): readonly NameCandidate[] {
  const nameKeys = [...new Set(rows.map(({ name }) => normalizeKana(name)))]
  const merged = nameKeys.map((nameKey) => {
    const group = rows.filter(({ name }) => normalizeKana(name) === nameKey)
    return {
      name: findMostFrequent(group.map(({ name, recordCount }) => ({ value: name, recordCount }))),
      recordCount: group.reduce((total, { recordCount }) => total + recordCount, 0),
      categoryId: findMostFrequent(
        group.map(({ categoryId, recordCount }) => ({ value: categoryId, recordCount })),
      ),
    }
  })
  return [...merged].sort(compareByCount)
}
