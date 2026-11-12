// カタカナ（ァ〜ヶ）とひらがな（ぁ〜ゖ）の Unicode のコードポイントの差
const KATAKANA_TO_HIRAGANA_OFFSET = 0x60

/**
 * ひらがな・カタカナ，全角・半角，大文字・小文字の違いを無視して比較できる形に変換する
 * @param text 変換する文字列
 * @returns 前後の空白を除き，カタカナをひらがなに，英字を小文字に揃えた文字列
 */
export function normalizeKana(text: string): string {
  return (
    text
      // 半角カタカナ・全角英数字を揃える
      .normalize('NFKC')
      .trim()
      .toLowerCase()
      .replace(/[ァ-ヶ]/g, (character) =>
        String.fromCharCode(character.charCodeAt(0) - KATAKANA_TO_HIRAGANA_OFFSET),
      )
  )
}
