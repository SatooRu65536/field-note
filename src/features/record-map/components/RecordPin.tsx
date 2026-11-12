import { Marker } from 'react-map-gl/maplibre'
import type { MarkerEvent } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import { MapPin } from '@/components/ui/MapPin'
import { PhotoMapPin } from '@/components/ui/PhotoMapPin'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'
import type { RecordSummary } from '@/integrations/field-note-api/records'

import { createRecordLabel } from '../recordLabel'

interface RecordPinProps {
  readonly record: RecordSummary
  readonly color: string
  readonly isSelected: boolean
  readonly onRecordSelected: (record: RecordSummary) => void
}

// 選択中のピンを，他のどのピンよりも手前に表示するための重なり順
const SELECTED_Z_INDEX = 1000000

export function RecordPin({ record, color, isSelected, onRecordSelected }: RecordPinProps) {
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
      onClick={handleClick}
      style={{
        // 南のピンほど手前に表示し，重なったピンの奥行きを地図と揃える
        zIndex: isSelected ? SELECTED_Z_INDEX : Math.round((90 - record.latitude) * 1000),
      }}
    >
      {/* キーボードで選べるようにするためのボタン．Enter で発生するクリックは Marker の onClick で受け取る */}
      <button
        type="button"
        aria-label={createRecordLabel(record)}
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
            isUncertain={record.discoveredAt === null}
          />
        ) : (
          <MapPin color={color} isSelected={isSelected} isUncertain={record.discoveredAt === null} />
        )}
      </button>
    </Marker>
  )
}
