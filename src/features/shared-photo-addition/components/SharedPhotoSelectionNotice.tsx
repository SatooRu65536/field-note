import { css } from 'styled-system/css'

import { MAX_PHOTO_BYTES, MAX_PHOTO_COUNT, MAX_TOTAL_PHOTO_BYTES } from '@/constants/photos'

import type { SharedPhotoSelection } from '../sharedPhotoSelection'

interface SharedPhotoSelectionNoticeProps {
  readonly selection: SharedPhotoSelection
}

export function SharedPhotoSelectionNotice({ selection }: SharedPhotoSelectionNoticeProps) {
  if (
    selection.unsupportedCount === 0 &&
    selection.oversizedCount === 0 &&
    selection.overLimitCount === 0
  ) {
    return null
  }

  return (
    <div role="alert" className={css({ fontSize: 'sm', color: 'danger' })}>
      {selection.unsupportedCount > 0 && (
        <p>JPEG・PNG・WebP・AVIF 以外の {selection.unsupportedCount} 枚は追加しません</p>
      )}
      {selection.oversizedCount > 0 && (
        <p>
          {MAX_PHOTO_BYTES / 1024 / 1024} MB を超える {selection.oversizedCount} 枚は追加しません
        </p>
      )}
      {selection.overLimitCount > 0 && (
        <p>
          一度に追加できるのは {MAX_PHOTO_COUNT} 枚・合計 {MAX_TOTAL_PHOTO_BYTES / 1024 / 1024} MB までのため，
          {selection.overLimitCount} 枚は追加しません
        </p>
      )}
    </div>
  )
}
