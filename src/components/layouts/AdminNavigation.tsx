import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

const LINK_STYLES = css({
  fontSize: 'sm',
  textDecoration: 'none',
  color: 'muted',
  _hover: { color: 'primary' },
})

const ACTIVE_PROPS = { className: css({ color: 'primary', fontWeight: 'bold' }) }

export function AdminNavigation() {
  return (
    <nav className={css({ display: 'flex', gap: '4' })}>
      <Link
        to="/admin/records"
        className={LINK_STYLES}
        activeProps={ACTIVE_PROPS}
        activeOptions={{ exact: true }}
      >
        記録一覧
      </Link>
      <Link to="/admin/records/new" className={LINK_STYLES} activeProps={ACTIVE_PROPS}>
        記録を追加
      </Link>
      <Link to="/admin/categories" className={LINK_STYLES} activeProps={ACTIVE_PROPS}>
        カテゴリ
      </Link>
    </nav>
  )
}
