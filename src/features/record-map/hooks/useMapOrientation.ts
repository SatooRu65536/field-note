import { useCallback, useRef, useSyncExternalStore } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import type { MapRef } from 'react-map-gl/maplibre'

import { RECORD_MAP_ID } from '../constants'

interface MapOrientation {
  readonly bearing: number
  readonly pitch: number
}

const INITIAL_ORIENTATION: MapOrientation = { bearing: 0, pitch: 0 }

/**
 * 地図の回転・傾きの変化を購読する
 * @param map 購読する地図．未作成の場合は何もしない
 * @param orientationRef 最新の回転・傾きを書き込む参照
 * @param onStoreChange 回転・傾きが変わったときに呼ぶ関数
 * @returns 購読を解除する関数
 */
function subscribeToOrientation({
  map,
  orientationRef,
  onStoreChange,
}: {
  map: MapRef | undefined
  orientationRef: { current: MapOrientation }
  onStoreChange: () => void
}): () => void {
  if (!map) return () => {}

  const handleChange = (): void => {
    orientationRef.current = { bearing: map.getBearing(), pitch: map.getPitch() }
    onStoreChange()
  }

  handleChange()
  map.on('rotate', handleChange)
  map.on('pitch', handleChange)
  return () => {
    map.off('rotate', handleChange)
    map.off('pitch', handleChange)
  }
}

/**
 * 地図の回転・傾きを返す
 * @returns 回転の角度と傾きの角度．地図の読み込み前はどちらも 0
 */
export function useMapOrientation(): MapOrientation {
  const { [RECORD_MAP_ID]: map } = useMap()
  const orientationRef = useRef(INITIAL_ORIENTATION)

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      subscribeToOrientation({ map, orientationRef, onStoreChange }),
    [map],
  )
  const getSnapshot = useCallback(() => orientationRef.current, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_ORIENTATION)
}
