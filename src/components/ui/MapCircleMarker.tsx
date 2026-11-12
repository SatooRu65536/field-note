import { css } from 'styled-system/css'

import { UncertainCornerMark } from './UncertainCornerMark'

interface MapCircleMarkerProps {
  // 縁取りの色．写真がない場合は円の中も塗る
  readonly color: string
  readonly imageSrc?: string
  readonly isSelected?: boolean
  // 不確かなものを示す場合は，縁取りを破線にして中を薄くし，「?」を重ねる
  readonly isUncertain?: boolean
}

export function MapCircleMarker({
  color,
  imageSrc,
  isSelected = false,
  isUncertain = false,
}: MapCircleMarkerProps) {
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
      style={{
        borderColor: color,
        borderStyle: isUncertain ? 'dashed' : 'solid',
        position: 'relative',
        transform: isSelected ? 'scale(1.25)' : undefined,
      }}
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
          style={{ opacity: isUncertain ? 0.6 : undefined }}
        />
      ) : (
        <span
          className={css({ display: 'block', w: '100%', h: '100%', borderRadius: 'full' })}
          style={{ backgroundColor: color, opacity: isUncertain ? 0.4 : undefined }}
        />
      )}
      {isUncertain && <UncertainCornerMark color={color} />}
    </span>
  )
}
