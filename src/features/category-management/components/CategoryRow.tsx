import { useState } from 'react'
import { css } from 'styled-system/css'

import { Button } from '@/components/ui/Button'
import { INPUT_STYLES } from '@/components/ui/styles'
import type { Category } from '@/integrations/field-note-api/categories'
import { MAX_CATEGORY_NAME_LENGTH } from '@/integrations/field-note-api/adminCategories'

interface CategoryRowProps {
  readonly category: Category
  readonly isFirst: boolean
  readonly isLast: boolean
  readonly isRunning: boolean
  readonly onCategoryUpdated: (category: { name: string; color: string }) => void
  readonly onCategoryMoved: (offset: number) => void
}

export function CategoryRow({
  category,
  isFirst,
  isLast,
  isRunning,
  onCategoryUpdated,
  onCategoryMoved,
}: CategoryRowProps) {
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color)
  const isChanged = name.trim() !== category.name || color !== category.color

  return (
    <li
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        p: '3',
        bg: 'white',
        borderRadius: 'lg',
        borderWidth: '1px',
        borderColor: 'border',
      })}
    >
      <input
        type="color"
        aria-label={`「${category.name}」の色`}
        value={color}
        onChange={(event) => setColor(event.target.value)}
        className={css({ w: '10', h: '10', flexShrink: 0, cursor: 'pointer' })}
      />
      <input
        type="text"
        aria-label={`「${category.name}」の名前`}
        value={name}
        maxLength={MAX_CATEGORY_NAME_LENGTH}
        onChange={(event) => setName(event.target.value)}
        className={INPUT_STYLES}
      />
      <Button
        size="sm"
        disabled={isRunning || !isChanged || name.trim() === ''}
        onClick={() => onCategoryUpdated({ name: name.trim(), color })}
      >
        保存
      </Button>
      <Button
        variant="secondary"
        size="sm"
        aria-label={`「${category.name}」を上へ移動`}
        disabled={isRunning || isFirst}
        onClick={() => onCategoryMoved(-1)}
      >
        ↑
      </Button>
      <Button
        variant="secondary"
        size="sm"
        aria-label={`「${category.name}」を下へ移動`}
        disabled={isRunning || isLast}
        onClick={() => onCategoryMoved(1)}
      >
        ↓
      </Button>
    </li>
  )
}
