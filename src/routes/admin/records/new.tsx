import { createFileRoute } from '@tanstack/react-router'

import { NewRecordForm } from '@/features/record-form'
import {
  nameCandidatesQueryOptions,
  tagCandidatesQueryOptions,
} from '@/integrations/field-note-api/adminRecords'

export const Route = createFileRoute('/admin/records/new')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(nameCandidatesQueryOptions()),
      context.queryClient.ensureQueryData(tagCandidatesQueryOptions()),
    ]),
  component: NewRecordForm,
})
