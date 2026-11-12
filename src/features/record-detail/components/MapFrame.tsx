import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

interface MapFrameProps {
  readonly children?: ReactNode
}

export function MapFrame({ children }: MapFrameProps) {
  return (
    <div
      className={css({
        position: 'relative',
        h: '280px',
        borderRadius: 'lg',
        overflow: 'hidden',
        borderWidth: '1px',
        borderColor: 'border',
        bg: 'map-background',
      })}
    >
      {children}
    </div>
  )
}
