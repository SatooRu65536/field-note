import { createFileRoute } from '@tanstack/react-router'

import { MapLayout } from '@/components/layouts/MapLayout'
import { parseMapSearch, RecordMap } from '@/features/record-map'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'

export const Route = createFileRoute('/')({
  validateSearch: parseMapSearch,
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQueryOptions()),
  component: MapPage,
})

function MapPage() {
  const search = Route.useSearch()

  return (
    <MapLayout>
      <RecordMap search={search} />
    </MapLayout>
  )
}
