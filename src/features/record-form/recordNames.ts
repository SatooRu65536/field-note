// 複数の記録をまとめて登録するときの，名前の区切り文字
const NAME_SEPARATOR_PATTERN = /[,，、]/

/**
 * 入力された名前を区切り文字で分け，まとめて登録する記録の名前にする
 * @param input 名前の入力値．「，」「,」「、」で区切ると複数の名前になる
 * @returns 前後の空白を除き，空の名前と重複を取り除いた名前
 */
export function splitRecordNames(input: string): readonly string[] {
  const names = input
    .split(NAME_SEPARATOR_PATTERN)
    .map((name) => name.trim())
    .filter((name) => name !== '')
  return [...new Set(names)]
}

/**
 * 入力中の最後の名前を取り出す
 * @param input 名前の入力値
 * @returns 最後の区切り文字より後ろの文字列
 */
export function getLastName(input: string): string {
  return input.split(NAME_SEPARATOR_PATTERN).at(-1) ?? ''
}

/**
 * 入力中の最後の名前を，選んだ候補に置き換える
 * @param input 名前の入力値
 * @param name 選んだ候補の名前
 * @returns 最後の区切り文字より後ろを候補に置き換えた入力値
 */
export function replaceLastName({ input, name }: { input: string; name: string }): string {
  const lastName = getLastName(input)
  return `${input.slice(0, input.length - lastName.length)}${name}`
}
