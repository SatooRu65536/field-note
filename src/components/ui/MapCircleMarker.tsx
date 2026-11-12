import { css } from 'styled-system/css'

interface MapCircleMarkerProps {
  // 縁取りの色．写真がない場合は円の中も塗る
  readonly color: string
  readonly imageSrc?: string
  readonly isSelected?: boolean
}

export function MapCircleMarker({ color, imageSrc, isSelected = false }: MapCircleMarkerProps) {
  return (
    <span
      aria-hidden="true"
      className={css({
        display: 'block',
        w: '9',
        h: '9',
        p: '2px',
        borderRadius: 'full',
        bg: 'white',
        borderWidth: '3px',
        borderStyle: 'solid',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
        transition: 'transform 0.15s',
      })}
      style={{ borderColor: color, transform: isSelected ? 'scale(1.25)' : undefined }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className={css({
            display: 'block',
            w: '100%',
            h: '100%',
            objectFit: 'cover',
            borderRadius: 'full',
            bg: 'primary-muted',
          })}
        />
      ) : (
        <span
          className={css({ display: 'block', w: '100%', h: '100%', borderRadius: 'full' })}
          style={{ backgroundColor: color }}
        />
      )}
    </span>
  )
}
