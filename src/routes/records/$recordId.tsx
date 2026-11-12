import { createFileRoute, notFound } from '@tanstack/react-router'

import { PageLayout } from '@/components/layouts/PageLayout'
import { RecordDetail, RecordNotFound } from '@/features/record-detail'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import { formatRecordName } from '@/integrations/field-note-api/recordName'
import { publicRecordQueryOptions } from '@/integrations/field-note-api/records'

export const Route = createFileRoute('/records/$recordId')({
  loader: async ({ context, params }) => {
    const [record] = await Promise.all([
      context.queryClient.ensureQueryData(publicRecordQueryOptions(params.recordId)),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ])
    if (!record) throw notFound()
    return { title: formatRecordName(record.name) }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} | Field Note` : 'Field Note' }],
  }),
  component: RecordPage,
  notFoundComponent: RecordNotFoundPage,
})

function RecordPage() {
  const { recordId } = Route.useParams()

  return (
    <PageLayout>
      <RecordDetail recordId={recordId} />
    </PageLayout>
  )
}

function RecordNotFoundPage() {
  return (
    <PageLayout>
      <RecordNotFound />
    </PageLayout>
  )
}
