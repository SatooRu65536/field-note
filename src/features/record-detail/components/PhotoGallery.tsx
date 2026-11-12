import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

import { createPhotoUrl } from '@/integrations/field-note-api/photos'

interface PhotoGalleryProps {
  readonly photoIds: readonly string[]
  readonly alt: string
}

export function PhotoGallery({ photoIds, alt }: PhotoGalleryProps) {
  if (photoIds.length === 0) {
    return (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          h: '200px',
          borderRadius: 'lg',
          bg: 'primary-muted',
          color: 'muted',
          fontSize: 'sm',
        })}
      >
        写真はありません
      </div>
    )
  }

  return (
    <ul
      className={css({
        display: 'flex',
        gap: '2',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        listStyle: 'none',
      })}
    >
      {photoIds.map((photoId, index) => (
        <li key={photoId} className={css({ flexShrink: 0, scrollSnapAlign: 'start' })}>
          <Link
            to="/photos/$photoId"
            params={{ photoId }}
            reloadDocument
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={createPhotoUrl(photoId)}
              alt={`${alt}（${index + 1}枚目）`}
              loading={index === 0 ? 'eager' : 'lazy'}
              className={css({
                h: { base: '240px', md: '360px' },
                maxW: '90vw',
                objectFit: 'cover',
                borderRadius: 'lg',
                bg: 'primary-muted',
              })}
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
