import type { ChangeEvent } from 'react'
import { css, cx } from 'styled-system/css'

import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
} from '@/constants/photos'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'

import type { NewPhoto } from '../types'
import { PhotoThumbnail } from './PhotoThumbnail'

interface PhotoFieldProps {
  readonly id: string
  readonly existingPhotoIds: readonly string[]
  readonly removedPhotoIds: readonly string[]
  readonly newPhotos: readonly NewPhoto[]
  readonly onRemovedPhotoIdsChanged: (photoIds: readonly string[]) => void
  readonly onNewPhotosChanged: (photos: readonly NewPhoto[]) => void
}

const fileInputLabelStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '28',
  h: '28',
  borderWidth: '2px',
  borderStyle: 'dashed',
  borderColor: 'border',
  borderRadius: 'md',
  color: 'muted',
  fontSize: 'sm',
  cursor: 'pointer',
  _hover: { borderColor: 'primary', color: 'primary' },
})

const disabledFileInputLabelStyles = css({ opacity: 0.4, cursor: 'not-allowed' })

export function PhotoField({
  id,
  existingPhotoIds,
  removedPhotoIds,
  newPhotos,
  onRemovedPhotoIdsChanged,
  onNewPhotosChanged,
}: PhotoFieldProps) {
  const keptPhotoCount = existingPhotoIds.length - removedPhotoIds.length
  const remainingCount = MAX_PHOTO_COUNT - keptPhotoCount - newPhotos.length

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(remainingCount, 0))
    // 同じファイルを続けて選べるよう選択状態を消す
    event.target.value = ''
    onNewPhotosChanged([
      ...newPhotos,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  function handleNewPhotoRemove(photo: NewPhoto): void {
    URL.revokeObjectURL(photo.previewUrl)
    onNewPhotosChanged(newPhotos.filter(({ id: photoId }) => photoId !== photo.id))
  }

  function handleExistingPhotoToggle(photoId: string): void {
    onRemovedPhotoIdsChanged(
      removedPhotoIds.includes(photoId)
        ? removedPhotoIds.filter((removedId) => removedId !== photoId)
        : [...removedPhotoIds, photoId],
    )
  }

  return (
    <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
      {existingPhotoIds.map((photoId) => (
        <PhotoThumbnail
          key={photoId}
          src={createPhotoUrl(photoId)}
          isRemoved={removedPhotoIds.includes(photoId)}
          onRemoveToggled={() => handleExistingPhotoToggle(photoId)}
        />
      ))}
      {newPhotos.map((photo) => (
        <PhotoThumbnail
          key={photo.id}
          src={photo.previewUrl}
          isRemoved={false}
          onRemoveToggled={() => handleNewPhotoRemove(photo)}
        />
      ))}
      <label
        htmlFor={id}
        className={cx(fileInputLabelStyles, remainingCount <= 0 && disabledFileInputLabelStyles)}
      >
        ＋ 写真を追加
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(',')}
        multiple
        disabled={remainingCount <= 0}
        onChange={handleFilesChange}
        className={css({ srOnly: true })}
      />
      <p className={css({ w: '100%', fontSize: 'xs', color: 'muted' })}>
        JPEG・PNG・WebP・AVIF，{MAX_PHOTO_COUNT} 枚まで，1枚 {MAX_PHOTO_BYTES / 1024 / 1024} MB まで
      </p>
    </div>
  )
}
