import { css, cx } from 'styled-system/css'

interface PhotoThumbnailProps {
  readonly src: string
  // 写真を区別するための名前．ボタン・画像の読み上げに使う
  readonly label: string
  readonly isRemoved: boolean
  readonly isToggleDisabled: boolean
  readonly onRemoveToggled: () => void
}

export function PhotoThumbnail({
  src,
  label,
  isRemoved,
  isToggleDisabled,
  onRemoveToggled,
}: PhotoThumbnailProps) {
  return (
    <div className={css({ position: 'relative', w: '28', h: '28' })}>
      <img
        src={src}
        alt={label}
        className={cx(
          css({ w: '100%', h: '100%', objectFit: 'cover', borderRadius: 'md', bg: 'primary-muted' }),
          isRemoved && css({ opacity: 0.3 }),
        )}
      />
      <button
        type="button"
        aria-label={isRemoved ? `${label}の削除を取り消す` : `${label}を削除`}
        disabled={isToggleDisabled}
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
          _disabled: { opacity: 0.4, cursor: 'not-allowed' },
        })}
      >
        {isRemoved ? '元に戻す' : '削除'}
      </button>
    </div>
  )
}
