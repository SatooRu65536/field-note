import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

interface MapLayoutProps {
  readonly children: ReactNode
}

// 地図を画面いっぱいに表示するため，ヘッダーを置かない
export function MapLayout({ children }: MapLayoutProps) {
  return (
    <main className={css({ position: 'relative', h: '100dvh', overflow: 'hidden' })}>
      <h1 className={css({ srOnly: true })}>Field Note</h1>
      {children}
    </main>
  )
}
