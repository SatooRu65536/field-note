import { createFileRoute } from '@tanstack/react-router'

import { MapLayout } from '@/components/layouts/MapLayout'
import { RecordMap } from '@/features/record-map'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQueryOptions()),
  component: MapPage,
})

function MapPage() {
  return (
    <MapLayout>
      <RecordMap />
    </MapLayout>
  )
}
