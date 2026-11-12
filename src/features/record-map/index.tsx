import { keepPreviousData, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { ClientOnly, useNavigate } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import { MapProvider } from 'react-map-gl/maplibre'

import { adminStatusQueryOptions } from '@/integrations/field-note-api/adminStatus'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import {
  publicRecordQueryOptions,
  publicRecordSearchQueryOptions,
} from '@/integrations/field-note-api/records'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

import { CategoryFilter } from './components/CategoryFilter'
import { RecordMapPlaceholder } from './components/RecordMapPlaceholder'
import { RecordPreviewCard } from './components/RecordPreviewCard'
import { RecordSearchBox } from './components/RecordSearchBox'
import { useCurrentPosition } from './hooks/useCurrentPosition'
import { toMapView } from './mapUrl'
import type { MapSearch } from './mapUrl'
import { toRecordSummary } from './recordSummary'

export { parseMapSearch } from './mapUrl'
export type { MapSearch }

// MapLibre はブラウザでのみ動作するため，サーバーでは読み込まない
const RecordMapCanvas = lazy(() =>
  import('./components/RecordMapCanvas').then((module) => ({
    default: module.RecordMapCanvas,
  })),
)

interface RecordMapProps {
  // 共有された URL の表示位置と記録
  readonly search: MapSearch
}

export function RecordMap({ search }: RecordMapProps) {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  const [categoryIds, setCategoryIds] = useState<readonly string[]>([])
  const [selectedRecord, setSelectedRecord] = useState<RecordSummary | null>(null)
  // 共有された URL の記録は，利用者が他の記録を選ぶか閉じるまで選択した状態にする
  const [isSharedRecordDismissed, setIsSharedRecordDismissed] = useState(false)
  const { data: sharedRecord } = useQuery({
    ...publicRecordQueryOptions(search.record ?? ''),
    enabled: search.record !== undefined,
  })
  const displayedRecord =
    selectedRecord ??
    (!isSharedRecordDismissed && sharedRecord ? toRecordSummary(sharedRecord) : null)
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

  function selectRecord(record: RecordSummary | null): void {
    setIsSharedRecordDismissed(true)
    setSelectedRecord(record)
  }

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
    selectRecord(nearestRecord)
  }

  function handleSearchClear(): void {
    setSearchQuery('')
    selectRecord(null)
  }

  function handleCategoryToggle(categoryId: string): void {
    setCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
    selectRecord(null)
  }

  return (
    <MapProvider>
      <ClientOnly fallback={<RecordMapPlaceholder />}>
        <Suspense fallback={<RecordMapPlaceholder />}>
          <RecordMapCanvas
            initialView={toMapView(search)}
            categories={categories}
            categoryIds={categoryIds}
            searchResults={visibleSearchResults}
            selectedRecordId={displayedRecord?.id ?? null}
            currentPosition={currentPosition}
            onRecordSelected={selectRecord}
            onCurrentPositionRequested={refreshCurrentPosition}
            // 管理者のみ，右クリックした地点を発見場所にして記録を追加できる
            onLocationRightClicked={isAdmin ? handleLocationRightClick : null}
          />
        </Suspense>
      </ClientOnly>
      <RecordSearchBox
        categoryIds={categoryIds}
        isAdmin={isAdmin}
        resultCount={visibleSearchResults?.length ?? null}
        onSearched={handleSearch}
        onCleared={handleSearchClear}
      />
      <CategoryFilter
        categories={categories}
        selectedCategoryIds={categoryIds}
        onCategoryToggled={handleCategoryToggle}
      />
      {displayedRecord && (
        <RecordPreviewCard
          record={displayedRecord}
          category={categories.find(({ id }) => id === displayedRecord.categoryId)}
          onClosed={() => selectRecord(null)}
        />
      )}
    </MapProvider>
  )
}
