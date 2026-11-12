import { createFileRoute } from '@tanstack/react-router'

import { NewRecordForm, parseNewRecordSearch } from '@/features/record-form'
import {
  nameCandidatesQueryOptions,
  tagCandidatesQueryOptions,
} from '@/integrations/field-note-api/adminRecords'

export const Route = createFileRoute('/admin/records/new')({
  validateSearch: parseNewRecordSearch,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(nameCandidatesQueryOptions()),
      context.queryClient.ensureQueryData(tagCandidatesQueryOptions()),
    ]),
  component: NewRecordPage,
})

function NewRecordPage() {
  const search = Route.useSearch()
  // 地図で別の地点を指定し直したときに，フォームを作り直して発見場所を反映する
  return <NewRecordForm key={`${search.latitude},${search.longitude}`} search={search} />
}
