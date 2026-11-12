import { css, cx } from 'styled-system/css'

interface PhotoThumbnailProps {
  readonly src: string
  readonly isRemoved: boolean
  readonly onRemoveToggled: () => void
}

export function PhotoThumbnail({ src, isRemoved, onRemoveToggled }: PhotoThumbnailProps) {
  return (
    <div className={css({ position: 'relative', w: '28', h: '28' })}>
      <img
        src={src}
        alt=""
        className={cx(
          css({ w: '100%', h: '100%', objectFit: 'cover', borderRadius: 'md', bg: 'primary-muted' }),
          isRemoved && css({ opacity: 0.3 }),
        )}
      />
      <button
        type="button"
        onClick={onRemoveToggled}
        className={css({
          position: 'absolute',
          top: '1',
          right: '1',
          px: '2',
          py: '0.5',
          borderRadius: 'full',
          bg: 'white',
          boxShadow: 'floating',
          fontSize: 'xs',
          cursor: 'pointer',
        })}
      >
        {isRemoved ? '元に戻す' : '削除'}
      </button>
    </div>
  )
}
