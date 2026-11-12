import { css, cx } from 'styled-system/css'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  readonly icon: ReactNode
  readonly 'aria-label': string
}

export function IconButton({ icon, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '11',
          h: '11',
          borderRadius: 'full',
          bg: 'white',
          color: 'primary',
          boxShadow: 'floating',
          cursor: 'pointer',
          _disabled: { color: 'muted', cursor: 'default' },
        }),
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
