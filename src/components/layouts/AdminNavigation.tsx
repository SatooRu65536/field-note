import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

const linkStyles = css({
  fontSize: 'sm',
  textDecoration: 'none',
  color: 'muted',
  _hover: { color: 'primary' },
})

const activeProps = { className: css({ color: 'primary', fontWeight: 'bold' }) }

export function AdminNavigation() {
  return (
    <nav className={css({ display: 'flex', gap: '4' })}>
      <Link
        to="/admin/records"
        className={linkStyles}
        activeProps={activeProps}
        activeOptions={{ exact: true }}
      >
        記録一覧
      </Link>
      <Link to="/admin/records/new" className={linkStyles} activeProps={activeProps}>
        記録を追加
      </Link>
    </nav>
  )
}
