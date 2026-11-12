import { createFileRoute, notFound } from '@tanstack/react-router'

import { PageLayout } from '@/components/layouts/PageLayout'
import { createRecordOgp, RecordDetail, RecordNotFound } from '@/features/record-detail'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import { createOgpMeta } from '@/integrations/ogp/createOgpMeta'
import { publicRecordQueryOptions } from '@/integrations/field-note-api/records'

export const Route = createFileRoute('/records/$recordId')({
  loader: async ({ context, params }) => {
    const [record] = await Promise.all([
      context.queryClient.ensureQueryData(publicRecordQueryOptions(params.recordId)),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ])
    if (!record) throw notFound()
    return { ogp: createRecordOgp(record) }
  },
  head: ({ loaderData, params }) => ({
    // 記録が見つからない場合は，サイト全体の OGP のままにする
    meta: loaderData
      ? [
          ...createOgpMeta({
            ...loaderData.ogp,
            path: `/records/${params.recordId}`,
            type: 'article',
          }),
        ]
      : [],
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
