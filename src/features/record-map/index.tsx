import { ClientOnly } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { lazy, Suspense, useState } from 'react'
import { MapProvider } from 'react-map-gl/maplibre'

import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import type { RecordSummary } from '@/integrations/field-note-api/records'

import { CategoryFilter } from './components/CategoryFilter'
import { RecordMapPlaceholder } from './components/RecordMapPlaceholder'
import { RecordPreviewCard } from './components/RecordPreviewCard'
import { useCurrentPosition } from './hooks/useCurrentPosition'

// MapLibre はブラウザでのみ動作するため，サーバーでは読み込まない
const RecordMapCanvas = lazy(() =>
  import('./components/RecordMapCanvas').then((module) => ({
    default: module.RecordMapCanvas,
  })),
)

export function RecordMap() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  const [categoryIds, setCategoryIds] = useState<readonly string[]>([])
  const [selectedRecord, setSelectedRecord] = useState<RecordSummary | null>(null)
  const { currentPosition, refreshCurrentPosition } = useCurrentPosition()

  function handleCategoryToggle(categoryId: string): void {
    setCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
    setSelectedRecord(null)
  }

  return (
    <MapProvider>
      <ClientOnly fallback={<RecordMapPlaceholder />}>
        <Suspense fallback={<RecordMapPlaceholder />}>
          <RecordMapCanvas
            categories={categories}
            categoryIds={categoryIds}
            selectedRecordId={selectedRecord?.id ?? null}
            currentPosition={currentPosition}
            onRecordSelected={setSelectedRecord}
            onCurrentPositionRequested={refreshCurrentPosition}
          />
        </Suspense>
      </ClientOnly>
      <CategoryFilter
        categories={categories}
        selectedCategoryIds={categoryIds}
        onCategoryToggled={handleCategoryToggle}
      />
      {selectedRecord && (
        <RecordPreviewCard
          record={selectedRecord}
          category={categories.find(({ id }) => id === selectedRecord.categoryId)}
          onClosed={() => setSelectedRecord(null)}
        />
      )}
    </MapProvider>
  )
}
