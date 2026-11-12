import { Marker } from 'react-map-gl/maplibre'
import type { MarkerEvent } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import { MapPin } from '@/components/ui/MapPin'
import { PhotoMapPin } from '@/components/ui/PhotoMapPin'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'
import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordSummary } from '@/integrations/field-note-api/records'

import type { PixelOffset } from '../spiderLayout'

interface RecordPinProps {
  readonly record: RecordSummary
  readonly color: string
  readonly isSelected: boolean
  // 重なる記録を広げて表示するときの，記録の位置からのずれ
  readonly offset?: PixelOffset
  readonly onRecordSelected: (record: RecordSummary) => void
}

// 選択中のピンを，他のどのピンよりも手前に表示するための重なり順
const SELECTED_Z_INDEX = 1000000

// 広げて表示するピンを，周りのピンより手前に表示するための重なり順
const SPIDER_Z_INDEX = 500000

export function RecordPin({
  record,
  color,
  isSelected,
  offset,
  onRecordSelected,
}: RecordPinProps) {
  function handleClick(event: MarkerEvent<MouseEvent>): void {
    // MapLibre は地図の要素でクリックを受け取るため，ネイティブのイベントの伝播を止めて選択の解除が走らないようにする
    event.originalEvent.stopPropagation()
    onRecordSelected(record)
  }

  return (
    <Marker
      longitude={record.longitude}
      latitude={record.latitude}
      anchor="bottom"
      offset={offset ? [offset.x, offset.y] : undefined}
      onClick={handleClick}
      style={{ zIndex: calculateZIndex({ record, isSelected, isSpread: offset !== undefined }) }}
    >
      {/* キーボードで選べるようにするためのボタン．Enter で発生するクリックは Marker の onClick で受け取る */}
      <button
        type="button"
        aria-label={formatRecordName(record.name)}
        aria-pressed={isSelected}
        className={css({
          display: 'block',
          cursor: 'pointer',
          borderRadius: 'md',
          _focusVisible: { outline: '2px solid', outlineColor: 'accent', outlineOffset: '2px' },
        })}
      >
        {record.thumbnailPhotoId ? (
          <PhotoMapPin
            src={createPhotoUrl(record.thumbnailPhotoId)}
            color={color}
            isSelected={isSelected}
          />
        ) : (
          <MapPin color={color} isSelected={isSelected} />
        )}
      </button>
    </Marker>
  )
}

/**
 * ピンの重なり順を求める
 * @param record ピンの記録
 * @param isSelected 選択中の場合は true
 * @param isSpread 重なる記録を広げて表示している場合は true
 * @returns z-index
 */
function calculateZIndex({
  record,
  isSelected,
  isSpread,
}: {
  record: RecordSummary
  isSelected: boolean
  isSpread: boolean
}): number {
  if (isSelected) return SELECTED_Z_INDEX
  if (isSpread) return SPIDER_Z_INDEX
  // 南のピンほど手前に表示し，重なったピンの奥行きを地図と揃える
  return Math.round((90 - record.latitude) * 1000)
}
