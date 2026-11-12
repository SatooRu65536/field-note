import { css } from 'styled-system/css'

import type { CategoryCount } from '../categoryCounts'

interface CategoryCountListProps {
  readonly totalCount: number
  readonly categoryCounts: readonly CategoryCount[]
}

const ITEM_STYLES = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  minW: '28',
  p: '3',
  borderRadius: 'lg',
  bg: 'white',
  borderWidth: '1px',
  borderColor: 'border',
})

export function CategoryCountList({ totalCount, categoryCounts }: CategoryCountListProps) {
  return (
    <ul
      aria-label="カテゴリ別の登録件数"
      className={css({ display: 'flex', flexWrap: 'wrap', gap: '3', listStyle: 'none' })}
    >
      <li className={ITEM_STYLES}>
        <span className={css({ fontSize: 'sm', color: 'muted' })}>すべて</span>
        <span className={css({ fontSize: '2xl', fontWeight: 'bold' })}>{totalCount}</span>
      </li>
      {categoryCounts.map(({ category, count }) => (
        <li key={category.id} className={ITEM_STYLES}>
          <span className={css({ display: 'flex', alignItems: 'center', gap: '1.5', fontSize: 'sm', color: 'muted' })}>
            <span
              aria-hidden="true"
              className={css({ w: '2', h: '2', borderRadius: 'full' })}
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </span>
          <span className={css({ fontSize: '2xl', fontWeight: 'bold' })}>{count}</span>
        </li>
      ))}
    </ul>
  )
}
