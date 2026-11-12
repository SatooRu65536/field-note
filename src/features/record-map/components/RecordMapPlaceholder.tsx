import { css } from 'styled-system/css'

export function RecordMapPlaceholder() {
  return (
    <div
      className={css({
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: '#fcfcfc',
        color: 'muted',
        fontSize: 'sm',
      })}
    >
      地図を読み込んでいます
    </div>
  )
}
