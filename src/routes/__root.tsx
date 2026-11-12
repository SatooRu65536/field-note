import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { SITE_DESCRIPTION, SITE_NAME, SITE_OGP_IMAGE_PATH } from '@/constants/site'
import { PageLayout } from '@/components/layouts/PageLayout'
import { NotFoundMessage } from '@/components/ui/NotFoundMessage'
import { AdminShortcuts } from '@/features/admin-shortcuts'
import { createOgpMeta } from '@/integrations/ogp/createOgpMeta'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      // 個々のページで上書きしない限り，サイト全体の OGP を使う
      ...createOgpMeta({
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        path: '/',
        imagePath: SITE_OGP_IMAGE_PATH,
        type: 'website',
      }),
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  return (
    <PageLayout>
      <NotFoundMessage
        title="ここは，まだ誰も踏み入れていない場所のようです"
        description="この先には道がありません．地図に戻って，新しい発見を探しに行きましょう．"
      />
    </PageLayout>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <AdminShortcuts />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
