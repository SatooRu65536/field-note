import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef } from 'react'
import { Map, Marker, useMap } from 'react-map-gl/maplibre'
import type { MarkerEvent } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import { MapPin } from '@/components/ui/MapPin'
import type { Category } from '@/integrations/field-note-api/categories'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import {
  FOCUS_ZOOM,
  INITIAL_VIEW_STATE,
  MAX_ZOOM,
  MIN_ZOOM,
} from '@/integrations/maplibre/constants'
import { MAP_STYLE } from '@/integrations/maplibre/mapStyle'
import { setupMaplibre } from '@/integrations/maplibre/setupMaplibre'

import { RECORD_MAP_ID } from '../constants'
import { useCurrentPosition } from '../hooks/useCurrentPosition'
import { useMapBounds } from '../hooks/useMapBounds'
import { usePublicRecordsInBounds } from '../hooks/usePublicRecordsInBounds'
import { CurrentPositionMarker } from './CurrentPositionMarker'
import { MapControls } from './MapControls'

setupMaplibre()

// カテゴリが削除された場合などに使う色
const FALLBACK_PIN_COLOR = '#000000'

interface RecordMapCanvasProps {
  readonly categories: readonly Category[]
  readonly categoryIds: readonly string[]
  readonly selectedRecordId: string | null
  readonly onRecordSelected: (record: RecordSummary | null) => void
}

export function RecordMapCanvas({
  categories,
  categoryIds,
  selectedRecordId,
  onRecordSelected,
}: RecordMapCanvasProps) {
  const { [RECORD_MAP_ID]: map } = useMap()
  const bounds = useMapBounds()
  const records = usePublicRecordsInBounds({ bounds, categoryIds })
  const currentPosition = useCurrentPosition()
  const hasMovedToCurrentPosition = useRef(false)
  const colorByCategoryId = new globalThis.Map(
    categories.map((category) => [category.id, category.color]),
  )

  // 現在地は非同期に取得されるため，取得できた時点で一度だけ地図を移動する
  useEffect(() => {
    if (!map || !currentPosition || hasMovedToCurrentPosition.current) return
    hasMovedToCurrentPosition.current = true
    map.jumpTo({
      center: [currentPosition.longitude, currentPosition.latitude],
      zoom: FOCUS_ZOOM,
    })
  }, [map, currentPosition])

  function handleMarkerClick(event: MarkerEvent<MouseEvent>, record: RecordSummary): void {
    // 地図のクリックとして選択の解除が走らないようにする
    event.originalEvent.stopPropagation()
    onRecordSelected(record)
  }

  return (
    <div className={css({ position: 'absolute', inset: '0' })}>
      <Map
        id={RECORD_MAP_ID}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        localIdeographFontFamily="sans-serif"
        attributionControl={{ compact: true }}
        onClick={() => onRecordSelected(null)}
      >
        {currentPosition && <CurrentPositionMarker position={currentPosition} />}
        {records.map((record) => (
          <Marker
            key={record.id}
            longitude={record.longitude}
            latitude={record.latitude}
            anchor="bottom"
            onClick={(event) => handleMarkerClick(event, record)}
            style={{
              cursor: 'pointer',
              // 南のピンほど手前に表示し，重なったピンの奥行きを地図と揃える
              zIndex: record.id === selectedRecordId ? 1000000 : Math.round((90 - record.latitude) * 1000),
            }}
          >
            <MapPin
              color={colorByCategoryId.get(record.categoryId) ?? FALLBACK_PIN_COLOR}
              isSelected={record.id === selectedRecordId}
            />
          </Marker>
        ))}
      </Map>
      <MapControls currentPosition={currentPosition} />
    </div>
  )
}
