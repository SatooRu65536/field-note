/**
 * 数値を2桁にゼロ埋めする
 * @param value 数値
 * @returns 2桁以上の文字列
 */
function padZero(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * 日付を input[type=date] の値に変換する
 * @param date 日付
 * @returns ブラウザのタイムゾーンでの「YYYY-MM-DD」
 */
export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`
}

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * input[type=date] の値を日付に変換する
 * @param value 「YYYY-MM-DD」形式の値
 * @returns ブラウザのタイムゾーンでのその日の0時．形式が不正な場合や存在しない日付の場合は null
 */
export function parseDateInputValue(value: string): Date | null {
  const match = DATE_INPUT_PATTERN.exec(value)
  if (!match) return null

  const [year, month, day] = match.slice(1).map(Number)
  if (year === undefined || month === undefined || day === undefined) return null

  const date = new Date(year, month - 1, day)
  // 2月30日のような値は Date が翌月に繰り上げるため，元の値と一致するか確かめる
  return toDateInputValue(date) === value ? date : null
}
