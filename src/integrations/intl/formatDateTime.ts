// サーバー（UTC）とブラウザで表示がずれてハイドレーションに失敗しないよう，タイムゾーンを固定する
const TIME_ZONE = 'Asia/Tokyo'

const dateTimeFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

/**
 * 日時を日本時間の「年月日 時:分」で表す
 * @param date 日時
 * @returns 表示用の文字列
 */
export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date)
}

/**
 * 日付を日本時間の「年/月/日」で表す
 * @param date 日時
 * @returns 表示用の文字列
 */
export function formatDate(date: Date): string {
  return dateFormat.format(date)
}
