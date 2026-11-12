import { css } from 'styled-system/css'

import type { Category } from '@/integrations/field-note-api/categories'

import { CategoryAddForm } from './CategoryAddForm'
import { CategoryRow } from './CategoryRow'

interface CategoryManagementViewProps {
  readonly categories: readonly Category[]
  readonly isRunning: boolean
  readonly error: string | null
  readonly onCategoryAdded: (category: { name: string; color: string }) => void
  readonly onCategoryUpdated: (category: { categoryId: string; name: string; color: string }) => void
  readonly onCategoryMoved: (move: { index: number; offset: number }) => void
}

export function CategoryManagementView({
  categories,
  isRunning,
  error,
  onCategoryAdded,
  onCategoryUpdated,
  onCategoryMoved,
}: CategoryManagementViewProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>カテゴリ</h1>

      {error && (
        <p
          role="alert"
          className={css({ p: '3', borderRadius: 'md', bg: 'danger-muted', color: 'danger' })}
        >
          {error}
        </p>
      )}

      <ol className={css({ display: 'flex', flexDirection: 'column', gap: '2', listStyle: 'none' })}>
        {categories.map((category, index) => (
          <CategoryRow
            // 保存・並び替え後に入力欄を保存済みの値へ戻すため，内容が変わったら作り直す
            key={`${category.id}-${category.name}-${category.color}`}
            category={category}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
            isRunning={isRunning}
            onCategoryUpdated={({ name, color }) =>
              onCategoryUpdated({ categoryId: category.id, name, color })
            }
            onCategoryMoved={(offset) => onCategoryMoved({ index, offset })}
          />
        ))}
      </ol>

      <CategoryAddForm isRunning={isRunning} onCategoryAdded={onCategoryAdded} />
    </div>
  )
}
