import { createFileRoute } from '@tanstack/react-router'

import { NewRecordForm } from '@/features/record-form'

export const Route = createFileRoute('/admin/records/new')({
  component: NewRecordForm,
})
