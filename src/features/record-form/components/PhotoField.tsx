import { useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { css, cx } from 'styled-system/css'

import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
} from '@/constants/photos'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'

import { selectPhotoFiles } from '../photoFiles'
import type { PhotoFileSelection } from '../photoFiles'
import type { NewPhoto } from '../types'
import { PhotoSelectionNotice } from './PhotoSelectionNotice'
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
  flexDirection: 'column',
  gap: '1',
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

const DROP_ZONE_STYLES = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
  p: '2',
  m: '-2',
  borderRadius: 'lg',
  borderWidth: '2px',
  borderStyle: 'dashed',
  borderColor: 'transparent',
  transition: 'background-color 0.15s, border-color 0.15s',
})

const DRAGGING_DROP_ZONE_STYLES = css({ borderColor: 'accent', bg: 'accent-muted' })

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
  const [selection, setSelection] = useState<PhotoFileSelection | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function addFiles(files: readonly File[]): void {
    const nextSelection = selectPhotoFiles({ files, remainingCount })
    setSelection(nextSelection)
    onNewPhotosChanged([
      ...newPhotos,
      ...nextSelection.files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>): void {
    addFiles(Array.from(event.target.files ?? []))
    // 同じファイルを続けて選べるよう選択状態を消す
    event.target.value = ''
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    if (!event.dataTransfer.types.includes('Files')) return
    // ドロップを受け付けるため，ブラウザが既定でファイルを開く動作を止める
    event.preventDefault()
    event.dataTransfer.dropEffect = remainingCount > 0 ? 'copy' : 'none'
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    // 子要素の上に移っただけの場合は，ドロップ先の外に出ていない
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(event.dataTransfer.files))
  }

  function handleNewPhotoRemove(photo: NewPhoto): void {
    URL.revokeObjectURL(photo.previewUrl)
    setSelection(null)
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cx(DROP_ZONE_STYLES, isDragging && DRAGGING_DROP_ZONE_STYLES)}
    >
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
        <span className={css({ fontSize: 'xs' })}>ドロップも可</span>
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
      {selection && <PhotoSelectionNotice selection={selection} />}
      <p className={css({ w: '100%', fontSize: 'xs', color: 'muted' })}>
        JPEG・PNG・WebP・AVIF，{MAX_PHOTO_COUNT} 枚まで，1枚 {MAX_PHOTO_BYTES / 1024 / 1024} MB まで
      </p>
    </div>
  )
}
