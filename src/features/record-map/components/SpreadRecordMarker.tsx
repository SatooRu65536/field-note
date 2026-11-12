import { Marker } from 'react-map-gl/maplibre'
import type { MarkerEvent } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import { MapCircleMarker } from '@/components/ui/MapCircleMarker'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'
import type { RecordSummary } from '@/integrations/field-note-api/records'

import { selectPinPhotoId } from '../pinPhoto'
import { createRecordLabel } from '../recordLabel'
import type { PixelOffset } from '../spiderLayout'

interface SpreadRecordMarkerProps {
  readonly latitude: number
  readonly longitude: number
  readonly record: RecordSummary
  readonly color: string
  readonly isSelected: boolean
  // 広げた中心からの位置
  readonly offset: PixelOffset
  readonly onRecordSelected: (record: RecordSummary) => void
}

// 中心から伸ばす線（400000）より手前に，選択中のピン（1000000）より奥に表示する
const SPREAD_Z_INDEX = 500000
const SELECTED_Z_INDEX = 1000000

export function SpreadRecordMarker({
  latitude,
  longitude,
  record,
  color,
  isSelected,
  offset,
  onRecordSelected,
}: SpreadRecordMarkerProps) {
  const photoId = selectPinPhotoId(record)

  function handleClick(event: MarkerEvent<MouseEvent>): void {
    // MapLibre は地図の要素でクリックを受け取るため，ネイティブのイベントの伝播を止めて選択の解除が走らないようにする
    event.originalEvent.stopPropagation()
    onRecordSelected(record)
  }

  return (
    <Marker
      // 線の端と丸の中心が重なるよう，広げた中心から丸の中心をずらす
      latitude={latitude}
      longitude={longitude}
      anchor="center"
      offset={[offset.x, offset.y]}
      onClick={handleClick}
      style={{ zIndex: isSelected ? SELECTED_Z_INDEX : SPREAD_Z_INDEX }}
    >
      {/* キーボードで選べるようにするためのボタン．Enter で発生するクリックは Marker の onClick で受け取る */}
      <button
        type="button"
        aria-label={createRecordLabel(record)}
        aria-pressed={isSelected}
        className={css({
          display: 'block',
          cursor: 'pointer',
          borderRadius: 'full',
          _focusVisible: { outline: '2px solid', outlineColor: 'accent', outlineOffset: '2px' },
        })}
      >
        <MapCircleMarker
          color={color}
          imageSrc={photoId ? createPhotoUrl(photoId) : undefined}
          isSelected={isSelected}
          isUncertain={record.discoveredAt === null}
        />
      </button>
    </Marker>
  )
}
