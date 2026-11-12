import { css, cx } from 'styled-system/css'

import type { Category } from '@/integrations/field-note-api/categories'

interface CategoryFilterProps {
  readonly categories: readonly Category[]
  readonly selectedCategoryIds: readonly string[]
  readonly onCategoryToggled: (categoryId: string) => void
}

const chipStyles = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  h: '9',
  px: '3',
  borderRadius: 'full',
  bg: 'white',
  boxShadow: 'floating',
  fontSize: 'sm',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  borderWidth: '2px',
  borderColor: 'transparent',
})

const selectedChipStyles = css({ borderColor: 'primary', fontWeight: 'bold' })

export function CategoryFilter({
  categories,
  selectedCategoryIds,
  onCategoryToggled,
}: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="カテゴリで絞り込む"
      className={css({
        position: 'absolute',
        top: '4',
        left: '4',
        right: '20',
        zIndex: 1,
        display: 'flex',
        gap: '2',
        overflowX: 'auto',
        pb: '2',
      })}
    >
      {categories.map((category) => {
        const isSelected = selectedCategoryIds.includes(category.id)
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isSelected}
            className={cx(chipStyles, isSelected && selectedChipStyles)}
            onClick={() => onCategoryToggled(category.id)}
          >
            <span
              aria-hidden="true"
              className={css({ w: '2.5', h: '2.5', borderRadius: 'full' })}
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
