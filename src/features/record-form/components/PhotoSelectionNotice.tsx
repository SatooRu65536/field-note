import { css } from 'styled-system/css'

import { MAX_PHOTO_COUNT } from '@/constants/photos'

import type { PhotoFileSelection } from '../photoFiles'

interface PhotoSelectionNoticeProps {
  readonly selection: PhotoFileSelection
}

export function PhotoSelectionNotice({ selection }: PhotoSelectionNoticeProps) {
  if (selection.unsupportedCount === 0 && selection.overLimitCount === 0) return null

  return (
    <div role="alert" className={css({ w: '100%', fontSize: 'sm', color: 'danger' })}>
      {selection.unsupportedCount > 0 && (
        <p>対応していない形式のファイル {selection.unsupportedCount} 件を追加しませんでした</p>
      )}
      {selection.overLimitCount > 0 && (
        <p>
          写真は {MAX_PHOTO_COUNT} 枚までのため，{selection.overLimitCount} 枚を追加しませんでした
        </p>
      )}
    </div>
  )
}
