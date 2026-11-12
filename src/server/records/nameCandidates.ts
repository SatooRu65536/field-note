import { normalizeKana } from '@/integrations/intl/normalizeKana'

export interface NameCandidate {
  readonly name: string
  // ひらがな・カタカナの違いを無視して同じ名前とみなした記録の件数
  readonly recordCount: number
}

/**
 * ひらがな・カタカナの違いだけの名前を1つにまとめ，記録の多い順に並べる
 * @param names 記録の名前ごとの件数
 * @returns まとめた名前．表記は最も多く使われたものにする
 */
export function mergeNameCandidates(names: readonly NameCandidate[]): readonly NameCandidate[] {
  const nameKeys = [...new Set(names.map(({ name }) => normalizeKana(name)))]
  const merged = nameKeys.map((nameKey) => {
    const group = names.filter(({ name }) => normalizeKana(name) === nameKey)
    const [representative] = [...group].sort(compareCandidates)
    return {
      name: representative?.name ?? nameKey,
      recordCount: group.reduce((total, { recordCount }) => total + recordCount, 0),
    }
  })
  return [...merged].sort(compareCandidates)
}

/**
 * 記録の多い順，同数の場合は名前の順に並べるための比較関数
 * @param a 比較する名前
 * @param b 比較する名前
 * @returns a を先に並べる場合は負の数
 */
function compareCandidates(a: NameCandidate, b: NameCandidate): number {
  return b.recordCount - a.recordCount || a.name.localeCompare(b.name, 'ja')
}
