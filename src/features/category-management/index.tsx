import { useSuspenseQuery } from '@tanstack/react-query'

import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'

import { CategoryManagementView } from './components/CategoryManagementView'
import { useCategoryCommands } from './hooks/useCategoryCommands'
import { moveItem } from './moveItem'

export function CategoryManagement() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  const { run, isRunning, error } = useCategoryCommands()

  function handleCategoryMove({ index, offset }: { index: number; offset: number }): void {
    const reordered = moveItem({ items: categories, index, offset })
    run({ type: 'reorder', categoryIds: reordered.map(({ id }) => id) })
  }

  return (
    <CategoryManagementView
      categories={categories}
      isRunning={isRunning}
      error={error}
      onCategoryAdded={({ name, color }) => run({ type: 'create', name, color })}
      onCategoryUpdated={(category) => run({ type: 'update', ...category })}
      onCategoryMoved={handleCategoryMove}
    />
  )
}
