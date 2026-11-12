import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AdminNavigation } from '@/components/layouts/AdminNavigation'
import { PageLayout } from '@/components/layouts/PageLayout'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'

export const Route = createFileRoute('/admin')({
  // 管理画面は検索エンジンに載せず，フォームの初期値（現在日時）がサーバーとブラウザで食い違わないよう SSR しない
  ssr: false,
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex' }, { title: '管理 | Field Note' }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQueryOptions()),
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <PageLayout navigation={<AdminNavigation />}>
      <Outlet />
    </PageLayout>
  )
}
