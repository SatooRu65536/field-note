import { css } from 'styled-system/css'

interface UncertainCornerMarkProps {
  readonly color: string
}

// 写真や丸の右上に重ねて，不確かなものであることを示す「?」
export function UncertainCornerMark({ color }: UncertainCornerMarkProps) {
  return (
    <span
      className={css({
        position: 'absolute',
        top: '-1',
        right: '-1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        w: '4',
        h: '4',
        borderRadius: 'full',
        bg: 'white',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        fontSize: '10px',
        fontWeight: 'bold',
        lineHeight: '1',
      })}
      style={{ borderColor: color, color }}
    >
      ?
    </span>
  )
}
