import 'maplibre-gl/dist/maplibre-gl.css'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Map, useMap } from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import type { Category } from '@/integrations/field-note-api/categories'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'
import {
  DEFAULT_PIN_COLOR,
  FOCUS_ZOOM,
  INITIAL_VIEW_STATE,
  MAX_ZOOM,
  MIN_ZOOM,
} from '@/integrations/maplibre/constants'
import { mapStyleQueryOptions } from '@/integrations/maplibre/mapStyle'

import { RECORD_MAP_ID } from '../constants'
import { useMapBounds } from '../hooks/useMapBounds'
import { usePublicRecordsInBounds } from '../hooks/usePublicRecordsInBounds'
import { CurrentPositionMarker } from './CurrentPositionMarker'
import { MapControls } from './MapControls'
import { RecordPin } from './RecordPin'

interface RecordMapCanvasProps {
  readonly categories: readonly Category[]
  readonly categoryIds: readonly string[]
  // 検索中の結果．検索していない場合は null とし，表示範囲内の記録を表示する
  readonly searchResults: readonly RecordSummary[] | null
  readonly selectedRecordId: string | null
  readonly currentPosition: Coordinates | null
  readonly onRecordSelected: (record: RecordSummary | null) => void
  readonly onCurrentPositionRequested: () => Promise<Coordinates | null>
  // ダブルクリックした地点を受け取る．null の場合はダブルクリックで地図を拡大する
  readonly onLocationDoubleClicked: ((location: Coordinates) => void) | null
}

export function RecordMapCanvas({
  categories,
  categoryIds,
  searchResults,
  selectedRecordId,
  currentPosition,
  onRecordSelected,
  onCurrentPositionRequested,
  onLocationDoubleClicked,
}: RecordMapCanvasProps) {
  const { [RECORD_MAP_ID]: map } = useMap()
  const { data: mapStyle } = useSuspenseQuery(mapStyleQueryOptions())
  const bounds = useMapBounds()
  const recordsInBounds = usePublicRecordsInBounds({ bounds, categoryIds })
  const records = searchResults ?? recordsInBounds
  const hasMovedToCurrentPosition = useRef(false)
  const colorByCategoryId = new globalThis.Map(
    categories.map((category) => [category.id, category.color]),
  )

  // 現在地は非同期に取得されるため，最初に取得できた時点で一度だけ地図を移動する
  useEffect(() => {
    if (!map || !currentPosition || hasMovedToCurrentPosition.current) return
    hasMovedToCurrentPosition.current = true
    map.jumpTo({
      center: [currentPosition.longitude, currentPosition.latitude],
      zoom: FOCUS_ZOOM,
    })
  }, [map, currentPosition])

  function handleDoubleClick(event: MapLayerMouseEvent): void {
    if (!onLocationDoubleClicked) return
    onLocationDoubleClicked({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
  }

  return (
    <div className={css({ position: 'absolute', inset: '0' })}>
      <Map
        id={RECORD_MAP_ID}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        // 日付変更線をまたいで表示すると表示範囲の経度が ±180 を超え，記録を検索できないため
        renderWorldCopies={false}
        localIdeographFontFamily="sans-serif"
        attributionControl={{ compact: true }}
        onClick={() => onRecordSelected(null)}
        doubleClickZoom={onLocationDoubleClicked === null}
        onDblClick={handleDoubleClick}
      >
        {currentPosition && <CurrentPositionMarker position={currentPosition} />}
        {records.map((record) => (
          <RecordPin
            key={record.id}
            record={record}
            color={colorByCategoryId.get(record.categoryId) ?? DEFAULT_PIN_COLOR}
            isSelected={record.id === selectedRecordId}
            onRecordSelected={onRecordSelected}
          />
        ))}
      </Map>
      <MapControls onCurrentPositionRequested={onCurrentPositionRequested} />
    </div>
  )
}
