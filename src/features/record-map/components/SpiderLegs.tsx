import { Marker } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import type { PixelOffset } from '../spiderLayout'

interface SpiderLegsProps {
  readonly latitude: number
  readonly longitude: number
  readonly offsets: readonly PixelOffset[]
}

// 広げた丸より奥に描くための重なり順．広げた丸（500000）より小さく，周りのピンより大きくする
const SPIDER_LEGS_Z_INDEX = 400000

export function SpiderLegs({ latitude, longitude, offsets }: SpiderLegsProps) {
  // 中心から最も遠いピンまで線が届く大きさの正方形に描く
  const size = Math.ceil(Math.max(...offsets.map(({ x, y }) => Math.hypot(x, y)), 0) * 2) + 8
  const center = size / 2

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="center"
      style={{ zIndex: SPIDER_LEGS_Z_INDEX, pointerEvents: 'none' }}
    >
      <svg width={size} height={size} aria-hidden="true" className={css({ display: 'block' })}>
        {offsets.map(({ x, y }) => (
          <line
            key={`${x}-${y}`}
            x1={center}
            y1={center}
            x2={center + x}
            y2={center + y}
            stroke="#4a5160"
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
        ))}
        <circle cx={center} cy={center} r={4} fill="#ffffff" stroke="#4a5160" strokeWidth={2} />
      </svg>
    </Marker>
  )
}
