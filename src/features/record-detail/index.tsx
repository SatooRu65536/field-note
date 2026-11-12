import { ClientOnly } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'

import { adminStatusQueryOptions } from '@/integrations/field-note-api/adminStatus'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import { DEFAULT_PIN_COLOR } from '@/integrations/maplibre/constants'
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

export { RecordNotFound }

interface RecordDetailProps {
  readonly recordId: string
}

export function RecordDetail({ recordId }: RecordDetailProps) {
  const { data: record } = useSuspenseQuery(publicRecordQueryOptions(recordId))
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  // 一般ユーザーの表示を待たせないよう，判定は表示の後にブラウザで行う
  const { data: isAdmin = false } = useQuery(adminStatusQueryOptions())
  if (!record) return <RecordNotFound />

  const category = categories.find(({ id }) => id === record.categoryId)

  return (
    <RecordDetailView
      record={record}
      category={category}
      isAdmin={isAdmin}
      locationMap={
        <MapFrame>
          <ClientOnly>
            <Suspense>
              <RecordLocationMap
                latitude={record.latitude}
                longitude={record.longitude}
                color={category?.color ?? DEFAULT_PIN_COLOR}
              />
            </Suspense>
          </ClientOnly>
        </MapFrame>
      }
    />
  )
}
