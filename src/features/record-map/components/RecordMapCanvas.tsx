import 'maplibre-gl/dist/maplibre-gl.css'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Map, useMap } from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import type { Category } from '@/integrations/field-note-api/categories'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'
import {
  DEFAULT_PIN_COLOR,
  FOCUS_ZOOM,
  INITIAL_VIEW_STATE,
  MAP_TRANSITION_DURATION_MS,
  MAX_ZOOM,
  MIN_ZOOM,
} from '@/integrations/maplibre/constants'
import { mapStyleQueryOptions } from '@/integrations/maplibre/mapStyle'

import { RECORD_MAP_ID } from '../constants'
import { useMapBounds } from '../hooks/useMapBounds'
import { useMapZoom } from '../hooks/useMapZoom'
import { usePublicRecordsInBounds } from '../hooks/usePublicRecordsInBounds'
import { loadMapView, saveMapView } from '../mapViewStorage'
import { createRecordClusterIndex, getRecordMapItems } from '../recordClusters'
import { RecordClusterMarker } from './RecordClusterMarker'
import { CurrentPositionMarker } from './CurrentPositionMarker'
import { MapControls } from './MapControls'
import { RecordPin } from './RecordPin'

// 地図の読み込み前に，記録をまとめるときの範囲
const WORLD_BOUNDS = { west: -180, east: 180, south: -90, north: 90 }

interface RecordMapCanvasProps {
  readonly categories: readonly Category[]
  readonly categoryIds: readonly string[]
  // 検索中の結果．検索していない場合は null とし，表示範囲内の記録を表示する
  readonly searchResults: readonly RecordSummary[] | null
  readonly selectedRecordId: string | null
  readonly currentPosition: Coordinates | null
  readonly onRecordSelected: (record: RecordSummary | null) => void
  readonly onCurrentPositionRequested: () => Promise<Coordinates | null>
  // 右クリックした地点を受け取る．null の場合は右クリックを受け付けない
  readonly onLocationRightClicked: ((location: Coordinates) => void) | null
}

export function RecordMapCanvas({
  categories,
  categoryIds,
  searchResults,
  selectedRecordId,
  currentPosition,
  onRecordSelected,
  onCurrentPositionRequested,
  onLocationRightClicked,
}: RecordMapCanvasProps) {
  const { [RECORD_MAP_ID]: map } = useMap()
  const { data: mapStyle } = useSuspenseQuery(mapStyleQueryOptions())
  const bounds = useMapBounds()
  const recordsInBounds = usePublicRecordsInBounds({ bounds, categoryIds })
  const records = searchResults ?? recordsInBounds
  const zoom = useMapZoom()
  // 記録が変わったときだけ索引を作り直し，地図の移動のたびに作り直さない
  const clusterIndex = useMemo(() => createRecordClusterIndex(records), [records])
  const mapItems = getRecordMapItems({ index: clusterIndex, bounds: bounds ?? WORLD_BOUNDS, zoom })
  // 前回の表示位置は最初の描画で一度だけ読み込み，地図の初期表示に使う
  const [savedView] = useState(loadMapView)
  // 前回の表示位置がある場合は，現在地で上書きしないよう現在地への自動の移動を済んだものとみなす
  const hasMovedToCurrentPosition = useRef(savedView !== null)
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

  function handleMoveEnd(event: ViewStateChangeEvent): void {
    // 次に開いたときに同じ場所から見られるよう，移動が収まるたびに表示位置を保存する
    saveMapView({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude,
      zoom: event.viewState.zoom,
    })
  }

  function handleClusterSelect({
    latitude,
    longitude,
    expansionZoom,
  }: {
    latitude: number
    longitude: number
    expansionZoom: number
  }): void {
    map?.flyTo({
      center: [longitude, latitude],
      zoom: Math.min(expansionZoom, MAX_ZOOM),
      duration: MAP_TRANSITION_DURATION_MS,
    })
  }

  function handleContextMenu(event: MapLayerMouseEvent): void {
    if (!onLocationRightClicked) return
    // ピンの右クリックも地図に伝わるため，ピンの上では記録を追加しない
    const target = event.originalEvent.target
    if (target instanceof Element && target.closest('.maplibregl-marker')) return
    // ブラウザのコンテキストメニューを出さずに記録の追加画面へ移る
    event.preventDefault()
    event.originalEvent.preventDefault()
    onLocationRightClicked({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
  }

  return (
    // ピンの z-index が地図の外の検索欄などより手前に出ないよう，重なり順をこの中に閉じ込める
    <div className={css({ position: 'absolute', inset: '0', isolation: 'isolate' })}>
      <Map
        id={RECORD_MAP_ID}
        initialViewState={savedView ?? INITIAL_VIEW_STATE}
        mapStyle={mapStyle}
        // ピンの z-index が現在地・方位のボタンより手前に出ないよう，地図の中に閉じ込める
        style={{ width: '100%', height: '100%', isolation: 'isolate' }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        // 日付変更線をまたいで表示すると表示範囲の経度が ±180 を超え，記録を検索できないため
        renderWorldCopies={false}
        localIdeographFontFamily="sans-serif"
        attributionControl={{ compact: true }}
        onClick={() => onRecordSelected(null)}
        onContextMenu={handleContextMenu}
        onMoveEnd={handleMoveEnd}
        // 右ボタンのドラッグによる回転と，右クリックでの記録の追加が重ならないよう，管理者はマウスで回転させない
        dragRotate={onLocationRightClicked === null}
      >
        {currentPosition && <CurrentPositionMarker position={currentPosition} />}
        {mapItems.map((item) =>
          item.type === 'cluster' ? (
            <RecordClusterMarker
              key={`cluster-${item.clusterId}`}
              latitude={item.latitude}
              longitude={item.longitude}
              recordCount={item.recordCount}
              onClusterSelected={() => handleClusterSelect(item)}
            />
          ) : (
            <RecordPin
              key={item.record.id}
              record={item.record}
              color={colorByCategoryId.get(item.record.categoryId) ?? DEFAULT_PIN_COLOR}
              isSelected={item.record.id === selectedRecordId}
              onRecordSelected={onRecordSelected}
            />
          ),
        )}
      </Map>
      <MapControls onCurrentPositionRequested={onCurrentPositionRequested} />
    </div>
  )
}
