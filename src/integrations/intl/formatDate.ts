// サーバー（UTC）とブラウザで表示がずれてハイドレーションに失敗しないよう，タイムゾーンを固定する
const TIME_ZONE = 'Asia/Tokyo'

const DATE_FORMAT = new Intl.DateTimeFormat('ja-JP', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

/**
 * 日付を日本時間の「年/月/日」で表す
 * @param date 日時
 * @returns 表示用の文字列
 */
export function formatDate(date: Date): string {
  return DATE_FORMAT.format(date)
}
