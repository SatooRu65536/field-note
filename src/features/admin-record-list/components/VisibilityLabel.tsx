import { css, cx } from 'styled-system/css'

interface VisibilityLabelProps {
  readonly isPublic: boolean
}

const baseStyles = css({
  px: '2',
  py: '0.5',
  borderRadius: 'full',
  fontSize: 'xs',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
})

export function VisibilityLabel({ isPublic }: VisibilityLabelProps) {
  return (
    <span
      className={cx(
        baseStyles,
        isPublic
          ? css({ bg: 'accent-muted', color: 'accent' })
          : css({ bg: 'primary-muted', color: 'muted' }),
      )}
    >
      {isPublic ? '公開' : '非公開'}
    </span>
  )
}
