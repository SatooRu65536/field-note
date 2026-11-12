import { css } from 'styled-system/css'

interface UncertainBadgeProps {
  readonly label: string
}

export function UncertainBadge({ label }: UncertainBadgeProps) {
  return (
    <span
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1',
        px: '2',
        py: '0.5',
        borderRadius: 'full',
        borderWidth: '1px',
        borderStyle: 'dashed',
        borderColor: 'muted',
        color: 'muted',
        fontSize: 'xs',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
      })}
    >
      ? {label}
    </span>
  )
}
