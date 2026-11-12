import { ClientOnly } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'

import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import { publicRecordQueryOptions } from '@/integrations/field-note-api/records'

import { MapFrame } from './components/MapFrame'
import { RecordDetailView } from './components/RecordDetailView'
import { RecordNotFound } from './components/RecordNotFound'

// MapLibre はブラウザでのみ動作するため，サーバーでは読み込まない
const RecordLocationMap = lazy(() =>
  import('./components/RecordLocationMap').then((module) => ({
    default: module.RecordLocationMap,
  })),
)

// カテゴリが削除された場合などに使う色
const FALLBACK_PIN_COLOR = '#000000'

export { RecordNotFound }

interface RecordDetailProps {
  readonly recordId: string
}

export function RecordDetail({ recordId }: RecordDetailProps) {
  const { data: record } = useSuspenseQuery(publicRecordQueryOptions(recordId))
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  if (!record) return <RecordNotFound />

  const category = categories.find(({ id }) => id === record.categoryId)

  return (
    <RecordDetailView
      record={record}
      category={category}
      locationMap={
        <MapFrame>
          <ClientOnly>
            <Suspense>
              <RecordLocationMap
                latitude={record.latitude}
                longitude={record.longitude}
                color={category?.color ?? FALLBACK_PIN_COLOR}
              />
            </Suspense>
          </ClientOnly>
        </MapFrame>
      }
    />
  )
}
