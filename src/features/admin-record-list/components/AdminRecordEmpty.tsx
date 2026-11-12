import { css } from 'styled-system/css'

export function AdminRecordEmpty() {
  return <p className={css({ color: 'muted' })}>まだ記録がありません</p>
}
