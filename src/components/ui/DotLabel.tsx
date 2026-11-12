import { css } from 'styled-system/css'

interface DotLabelProps {
  readonly name: string
  readonly color: string
}

export function DotLabel({ name, color }: DotLabelProps) {
  return (
    <span
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1.5',
        px: '2',
        py: '0.5',
        borderRadius: 'full',
        borderWidth: '1px',
        borderColor: 'border',
        bg: 'white',
        fontSize: 'xs',
        whiteSpace: 'nowrap',
      })}
    >
      <span
        aria-hidden="true"
        className={css({ w: '2', h: '2', borderRadius: 'full' })}
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  )
}
