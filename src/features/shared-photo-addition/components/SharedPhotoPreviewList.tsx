import { useState } from 'react'
import { css } from 'styled-system/css'

interface SharedPhotoPreviewListProps {
  readonly photos: readonly File[]
}

export function SharedPhotoPreviewList({ photos }: SharedPhotoPreviewListProps) {
  // 共有された写真は画面を開いている間に変わらないため，最初に一度だけ Object URL を作る
  const [previewUrls] = useState(() => photos.map((photo) => URL.createObjectURL(photo)))

  return (
    <ul className={css({ display: 'flex', gap: '2', overflowX: 'auto', listStyle: 'none' })}>
      {previewUrls.map((url, index) => (
        <li key={url} className={css({ flexShrink: 0 })}>
          <img
            src={url}
            alt={`共有された写真${index + 1}`}
            className={css({ w: '24', h: '24', objectFit: 'cover', borderRadius: 'md', bg: 'primary-muted' })}
          />
        </li>
      ))}
    </ul>
  )
}
