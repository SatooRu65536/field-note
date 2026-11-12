import { createFileRoute } from '@tanstack/react-router'

import { createPhotoResponse } from '@/server/photos/createPhotoResponse'

export const Route = createFileRoute('/photos/$photoId')({
  server: {
    handlers: {
      GET: ({ params }) => createPhotoResponse(params.photoId),
    },
  },
})
