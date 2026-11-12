/**
 * 数値を2桁にゼロ埋めする
 * @param value 数値
 * @returns 2桁以上の文字列
 */
function padZero(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * 日時を input[type=datetime-local] の値に変換する
 * @param date 日時
 * @returns ブラウザのタイムゾーンでの「YYYY-MM-DDTHH:mm」
 */
export function toDateTimeLocalValue(date: Date): string {
  return [
    `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`,
    `${padZero(date.getHours())}:${padZero(date.getMinutes())}`,
  ].join('T')
}

const DATE_TIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

/**
 * input[type=datetime-local] の値を日時に変換する
 * @param value 「YYYY-MM-DDTHH:mm」形式の値
 * @returns ブラウザのタイムゾーンで解釈した日時．形式が不正な場合や存在しない日時の場合は null
 */
export function parseDateTimeLocalValue(value: string): Date | null {
  const match = DATE_TIME_LOCAL_PATTERN.exec(value)
  if (!match) return null

  const [year, month, day, hours, minutes] = match.slice(1).map(Number)
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    hours === undefined ||
    minutes === undefined
  ) {
    return null
  }

  const date = new Date(year, month - 1, day, hours, minutes)
  // 2月30日のような値は Date が翌月に繰り上げるため，元の値と一致するか確かめる
  return toDateTimeLocalValue(date) === value ? date : null
}
