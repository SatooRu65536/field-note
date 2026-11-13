import { createFileRoute } from '@tanstack/react-router'

import { SharedPhotoAddition } from '@/features/shared-photo-addition'
import { adminRecordsQueryOptions } from '@/integrations/field-note-api/adminRecords'
import { sharedPhotosQueryOptions } from '@/integrations/pwa/sharedPhotos'

// public/sw.js が，他のアプリから共有された写真を保存してからこの画面に移動させる
export const Route = createFileRoute('/admin/share/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(sharedPhotosQueryOptions()),
      context.queryClient.ensureQueryData(adminRecordsQueryOptions()),
    ]),
  component: SharedPhotoAddition,
})
