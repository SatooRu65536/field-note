import { css } from 'styled-system/css'

import { UncertainPinMark } from './UncertainPinMark'

interface MapPinProps {
  readonly color: string
  readonly isSelected?: boolean
  // 不確かなものを示す場合は，縁取りを破線にして中に「?」を表示する
  readonly isUncertain?: boolean
}

export function MapPin({ color, isSelected = false, isUncertain = false }: MapPinProps) {
  return (
    <svg
      width="32"
      height="42"
      viewBox="0 0 32 42"
      aria-hidden="true"
      className={css({
        display: 'block',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35))',
        transition: 'transform 0.15s',
        transformOrigin: 'bottom center',
      })}
      style={{ transform: isSelected ? 'scale(1.25)' : undefined }}
    >
      <path
        d="M16 1C7.7 1 1 7.6 1 15.8 1 26.9 16 41 16 41s15-14.1 15-25.2C31 7.6 24.3 1 16 1z"
        fill="white"
        stroke={color}
        strokeWidth={isUncertain ? 2.5 : 2}
        strokeDasharray={isUncertain ? '4 3' : undefined}
      />
      {isUncertain ? (
        <UncertainPinMark color={color} />
      ) : (
        <circle cx="16" cy="15.5" r="8" fill={color} />
      )}
    </svg>
  )
}
