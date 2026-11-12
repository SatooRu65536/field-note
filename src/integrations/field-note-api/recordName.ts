/**
 * 記録の名前を表示用に変換する
 * @param name 記録の名前
 * @returns 名前．名前が分からない記録の場合は「名前不明」
 */
export function formatRecordName(name: string | null): string {
  return name ?? '名前不明'
}
