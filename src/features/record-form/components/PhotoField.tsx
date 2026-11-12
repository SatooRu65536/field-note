import { useState } from 'react'
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

const FILE_INPUT_LABEL_STYLES = css({
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
  _focusWithin: { outline: '2px solid', outlineColor: 'accent', outlineOffset: '2px' },
})

const DISABLED_FILE_INPUT_LABEL_STYLES = css({ opacity: 0.4, cursor: 'not-allowed' })

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
  const [skippedCount, setSkippedCount] = useState(0)

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedFiles = Array.from(event.target.files ?? [])
    const files = selectedFiles.slice(0, Math.max(remainingCount, 0))
    setSkippedCount(selectedFiles.length - files.length)
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
    setSkippedCount(0)
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
      {existingPhotoIds.map((photoId, index) => (
        <PhotoThumbnail
          key={photoId}
          src={createPhotoUrl(photoId)}
          label={`登録済みの写真${index + 1}`}
          isRemoved={removedPhotoIds.includes(photoId)}
          // 削除を取り消すと上限を超える場合は取り消せないようにする
          isToggleDisabled={removedPhotoIds.includes(photoId) && remainingCount <= 0}
          onRemoveToggled={() => handleExistingPhotoToggle(photoId)}
        />
      ))}
      {newPhotos.map((photo, index) => (
        <PhotoThumbnail
          key={photo.id}
          src={photo.previewUrl}
          label={`追加する写真${index + 1}`}
          isRemoved={false}
          isToggleDisabled={false}
          onRemoveToggled={() => handleNewPhotoRemove(photo)}
        />
      ))}
      <label
        className={cx(FILE_INPUT_LABEL_STYLES, remainingCount <= 0 && DISABLED_FILE_INPUT_LABEL_STYLES)}
      >
        ＋ 写真を追加
        <input
          id={id}
          type="file"
          accept={ACCEPTED_PHOTO_TYPES.join(',')}
          multiple
          disabled={remainingCount <= 0}
          onChange={handleFilesChange}
          className={css({ srOnly: true })}
        />
      </label>
      {skippedCount > 0 && (
        <p role="alert" className={css({ w: '100%', fontSize: 'sm', color: 'danger' })}>
          写真は {MAX_PHOTO_COUNT} 枚までのため，選択した写真のうち {skippedCount} 枚を追加しませんでした
        </p>
      )}
      <p className={css({ w: '100%', fontSize: 'xs', color: 'muted' })}>
        JPEG・PNG・WebP・AVIF，{MAX_PHOTO_COUNT} 枚まで，1枚 {MAX_PHOTO_BYTES / 1024 / 1024} MB まで
      </p>
    </div>
  )
}
