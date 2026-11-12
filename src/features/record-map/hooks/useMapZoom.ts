import { useCallback, useRef, useSyncExternalStore } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import type { MapRef } from 'react-map-gl/maplibre'

import { INITIAL_VIEW_STATE } from '@/integrations/maplibre/constants'

import { RECORD_MAP_ID } from '../constants'

const INITIAL_ZOOM = INITIAL_VIEW_STATE.zoom ?? 0

/**
 * 地図の移動の終了を購読し，ズームレベルを書き込む
 * @param map 購読する地図．未作成の場合は何もしない
 * @param zoomRef 最新のズームレベルを書き込む参照
 * @param onStoreChange ズームレベルが変わったときに呼ぶ関数
 * @returns 購読を解除する関数
 */
function subscribeToZoom({
  map,
  zoomRef,
  onStoreChange,
}: {
  map: MapRef | undefined
  zoomRef: { current: number }
  onStoreChange: () => void
}): () => void {
  if (!map) return () => {}

  const handleMoveEnd = (): void => {
    zoomRef.current = map.getZoom()
    onStoreChange()
  }

  handleMoveEnd()
  map.on('moveend', handleMoveEnd)
  return () => {
    map.off('moveend', handleMoveEnd)
  }
}

/**
 * 地図の移動が収まるたびに，ズームレベルを返す
 * @returns ズームレベル．地図の読み込み前は初期表示のズームレベル
 */
export function useMapZoom(): number {
  const { [RECORD_MAP_ID]: map } = useMap()
  const zoomRef = useRef(INITIAL_ZOOM)

  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToZoom({ map, zoomRef, onStoreChange }),
    [map],
  )
  const getSnapshot = useCallback(() => zoomRef.current, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_ZOOM)
}
