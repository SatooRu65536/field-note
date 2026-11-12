import { createFileRoute } from '@tanstack/react-router'

import { EditRecordForm } from '@/features/record-form'
import { adminRecordQueryOptions } from '@/integrations/field-note-api/adminRecords'

export const Route = createFileRoute('/admin/records/$recordId/edit')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(adminRecordQueryOptions(params.recordId)),
  component: EditRecordPage,
})

function EditRecordPage() {
  const { recordId } = Route.useParams()
  // 記録を切り替えたときにフォームの入力状態を引き継がないよう，記録ごとに作り直す
  return <EditRecordForm key={recordId} recordId={recordId} />
}
