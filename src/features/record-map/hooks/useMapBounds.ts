import { useCallback, useRef, useSyncExternalStore } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import type { MapRef } from 'react-map-gl/maplibre'

import type { Bounds } from '@/integrations/field-note-api/records'

import { toPaddedBounds } from '../bounds'
import { RECORD_MAP_ID } from '../constants'

/**
 * 地図の移動の終了を購読し，表示範囲に余白を加えた範囲を書き込む
 * @param map 購読する地図．未作成の場合は何もしない
 * @param boundsRef 最新の範囲を書き込む参照
 * @param onStoreChange 範囲が変わったときに呼ぶ関数
 * @returns 購読を解除する関数
 */
function subscribeToBounds({
  map,
  boundsRef,
  onStoreChange,
}: {
  map: MapRef | undefined
  boundsRef: { current: Bounds | null }
  onStoreChange: () => void
}): () => void {
  if (!map) return () => {}

  const handleMoveEnd = (): void => {
    const bounds = map.getBounds()
    boundsRef.current = toPaddedBounds({
      west: bounds.getWest(),
      east: bounds.getEast(),
      south: bounds.getSouth(),
      north: bounds.getNorth(),
    })
    onStoreChange()
  }

  handleMoveEnd()
  map.on('moveend', handleMoveEnd)
  return () => {
    map.off('moveend', handleMoveEnd)
  }
}

/**
 * 地図の移動が収まるたびに，表示範囲に余白を加えた範囲を返す
 * @returns 範囲．地図の読み込み前は null
 */
export function useMapBounds(): Bounds | null {
  const { [RECORD_MAP_ID]: map } = useMap()
  const boundsRef = useRef<Bounds | null>(null)

  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToBounds({ map, boundsRef, onStoreChange }),
    [map],
  )
  const getSnapshot = useCallback(() => boundsRef.current, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
