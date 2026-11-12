import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

import { AppHeader } from './AppHeader'

interface PageLayoutProps {
  readonly navigation?: ReactNode
  readonly children: ReactNode
}

export function PageLayout({ navigation, children }: PageLayoutProps) {
  return (
    <div className={css({ minH: '100vh', bg: '#fafafa' })}>
      <AppHeader navigation={navigation} />
      <main className={css({ maxW: '960px', mx: 'auto', px: '4', py: '6' })}>
        {children}
      </main>
    </div>
  )
}
