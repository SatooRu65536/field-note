import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

import { buttonRecipe } from './styles'

interface NotFoundMessageProps {
  readonly title: string
  readonly description: string
}

export function NotFoundMessage({ title, description }: NotFoundMessageProps) {
  return (
    <section
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4',
        py: '16',
        textAlign: 'center',
      })}
    >
      <p
        aria-hidden="true"
        className={css({ fontSize: '6xl', fontWeight: 'bold', color: 'accent', lineHeight: '1' })}
      >
        404
      </p>
      <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>{title}</h1>
      <p className={css({ color: 'muted' })}>{description}</p>
      <Link to="/" className={buttonRecipe()}>
        地図に戻る
      </Link>
    </section>
  )
}
