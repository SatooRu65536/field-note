import { css } from 'styled-system/css'

import { UncertainCornerMark } from './UncertainCornerMark'

interface PhotoMapPinProps {
  readonly src: string
  // 写真の縁取りと，ピンの先端の色
  readonly color: string
  readonly isSelected?: boolean
  // 不確かなものを示す場合は，縁取りを破線にして写真を薄くし，「?」を重ねる
  readonly isUncertain?: boolean
}

export function PhotoMapPin({
  src,
  color,
  isSelected = false,
  isUncertain = false,
}: PhotoMapPinProps) {
  return (
    <span
      aria-hidden="true"
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35))',
        transition: 'transform 0.15s',
        transformOrigin: 'bottom center',
      })}
      style={{ transform: isSelected ? 'scale(1.25)' : undefined }}
    >
      <span
        className={css({
          display: 'block',
          w: '11',
          h: '11',
          p: '2px',
          borderRadius: 'full',
          bg: 'white',
          borderWidth: '3px',
          borderStyle: 'solid',
        })}
        style={{ borderColor: color, borderStyle: isUncertain ? 'dashed' : 'solid', position: 'relative' }}
      >
        <img
          src={src}
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
        {isUncertain && <UncertainCornerMark color={color} />}
      </span>
      <svg width="12" height="8" viewBox="0 0 12 8" className={css({ display: 'block', mt: '-1px' })}>
        <path d="M0 0h12L6 8z" fill={color} />
      </svg>
    </span>
  )
}
