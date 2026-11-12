import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

interface AppHeaderProps {
  readonly navigation?: ReactNode
}

export function AppHeader({ navigation }: AppHeaderProps) {
  return (
    <header
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4',
        h: '14',
        px: '4',
        bg: 'white',
        borderBottomWidth: '1px',
        borderColor: 'border',
      })}
    >
      <Link
        to="/"
        className={css({ fontWeight: 'bold', fontSize: 'lg', textDecoration: 'none' })}
      >
        Field Note
      </Link>
      {navigation}
    </header>
  )
}
