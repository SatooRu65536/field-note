import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

import { AppHeader } from './AppHeader'

interface MapLayoutProps {
  readonly children: ReactNode
}

export function MapLayout({ children }: MapLayoutProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', h: '100dvh' })}>
      <AppHeader />
      <main className={css({ position: 'relative', flex: '1', minH: '0' })}>
        {children}
      </main>
    </div>
  )
}
