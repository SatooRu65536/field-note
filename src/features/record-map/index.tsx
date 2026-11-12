import { keepPreviousData, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { ClientOnly, useNavigate } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import { MapProvider } from 'react-map-gl/maplibre'

import { adminStatusQueryOptions } from '@/integrations/field-note-api/adminStatus'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import { publicRecordSearchQueryOptions } from '@/integrations/field-note-api/records'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

import { CategoryFilter } from './components/CategoryFilter'
import { RecordMapPlaceholder } from './components/RecordMapPlaceholder'
import { RecordPreviewCard } from './components/RecordPreviewCard'
import { RecordSearchBox } from './components/RecordSearchBox'
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
  const { data: isAdmin = false } = useQuery(adminStatusQueryOptions())
  const [searchQuery, setSearchQuery] = useState('')
  const { data: searchResults } = useQuery({
    ...publicRecordSearchQueryOptions({ query: searchQuery, categoryIds }),
    enabled: searchQuery !== '',
    // カテゴリの切り替え中に結果が空に見えないよう，前の結果を表示し続ける
    placeholderData: keepPreviousData,
  })
  const visibleSearchResults = searchQuery === '' ? null : (searchResults ?? [])
  const navigate = useNavigate()

  async function handleLocationRightClick({ latitude, longitude }: Coordinates): Promise<void> {
    await navigate({ to: '/admin/records/new', search: { latitude, longitude } })
  }

  function handleSearch({
    query,
    nearestRecord,
  }: {
    query: string
    nearestRecord: RecordSummary | null
  }): void {
    setSearchQuery(query)
    setSelectedRecord(nearestRecord)
  }

  function handleSearchClear(): void {
    setSearchQuery('')
    setSelectedRecord(null)
  }

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
            searchResults={visibleSearchResults}
            selectedRecordId={selectedRecord?.id ?? null}
            currentPosition={currentPosition}
            onRecordSelected={setSelectedRecord}
            onCurrentPositionRequested={refreshCurrentPosition}
            // 管理者のみ，右クリックした地点を発見場所にして記録を追加できる
            onLocationRightClicked={isAdmin ? handleLocationRightClick : null}
          />
        </Suspense>
      </ClientOnly>
      <RecordSearchBox
        categoryIds={categoryIds}
        resultCount={visibleSearchResults?.length ?? null}
        onSearched={handleSearch}
        onCleared={handleSearchClear}
      />
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
