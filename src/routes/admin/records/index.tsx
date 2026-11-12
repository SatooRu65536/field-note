import { createFileRoute } from '@tanstack/react-router'

import { AdminRecordList } from '@/features/admin-record-list'
import { adminRecordsQueryOptions } from '@/integrations/field-note-api/adminRecords'

export const Route = createFileRoute('/admin/records/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminRecordsQueryOptions()),
  component: AdminRecordList,
})
