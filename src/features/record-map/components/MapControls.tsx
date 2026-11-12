import type { MapLibreEvent } from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import { CompassIcon } from '@/components/ui/CompassIcon'
import { IconButton } from '@/components/ui/IconButton'
import { LocateIcon } from '@/components/ui/LocateIcon'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'
import {
  FOCUS_ZOOM,
  MAP_TRANSITION_DURATION_MS,
} from '@/integrations/maplibre/constants'

import { RECORD_MAP_ID } from '../constants'

interface MapControlsProps {
  readonly currentPosition: Coordinates | null
}

export function MapControls({ currentPosition }: MapControlsProps) {
  const { [RECORD_MAP_ID]: map } = useMap()
  const [bearing, setBearing] = useState(0)
  const [pitch, setPitch] = useState(0)

  // 地図の回転・傾きは MapLibre 側の状態のため，イベントを購読して表示に反映する
  useEffect(() => {
    if (!map) return
    const handleRotate = (event: MapLibreEvent): void =>
      setBearing(event.target.getBearing())
    const handlePitch = (event: MapLibreEvent): void => setPitch(event.target.getPitch())
    map.on('rotate', handleRotate)
    map.on('pitch', handlePitch)
    return () => {
      map.off('rotate', handleRotate)
      map.off('pitch', handlePitch)
    }
  }, [map])

  function handleLocate(): void {
    if (!currentPosition) return
    map?.flyTo({
      center: [currentPosition.longitude, currentPosition.latitude],
      zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
      duration: MAP_TRANSITION_DURATION_MS,
    })
  }

  function handleResetNorth(): void {
    map?.resetNorthPitch({ duration: MAP_TRANSITION_DURATION_MS })
  }

  return (
    <div
      className={css({
        position: 'absolute',
        top: '4',
        right: '4',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2',
      })}
    >
      <IconButton
        icon={<LocateIcon />}
        aria-label="現在地に移動"
        onClick={handleLocate}
        disabled={!currentPosition}
      />
      <IconButton
        icon={<CompassIcon rotate={-bearing} />}
        aria-label="地図の向きを北に戻す"
        onClick={handleResetNorth}
        disabled={bearing === 0 && pitch === 0}
      />
    </div>
  )
}
