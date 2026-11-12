/**
 * 文字列を含むかを LIKE で調べるためのパターンを作成する．ESCAPE '\' と組み合わせて使う
 * @param text 検索する文字列
 * @returns % と _ と \ をエスケープし，前後を % で囲んだパターン
 */
export function createContainsPattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`
}
