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
import { useMapOrientation } from '../hooks/useMapOrientation'
import { ShareMapButton } from './ShareMapButton'

interface MapControlsProps {
  readonly selectedRecordId: string | null
  readonly onCurrentPositionRequested: () => Promise<Coordinates | null>
}

export function MapControls({ selectedRecordId, onCurrentPositionRequested }: MapControlsProps) {
  const { [RECORD_MAP_ID]: map } = useMap()
  const { bearing, pitch } = useMapOrientation()

  async function handleLocate(): Promise<void> {
    const position = await onCurrentPositionRequested()
    if (!map || !position) return
    map.flyTo({
      center: [position.longitude, position.latitude],
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
      <IconButton icon={<LocateIcon />} aria-label="現在地に移動" onClick={handleLocate} />
      <IconButton
        icon={<CompassIcon rotate={-bearing} />}
        aria-label="地図の向きを北に戻す"
        onClick={handleResetNorth}
        disabled={bearing === 0 && pitch === 0}
      />
      <ShareMapButton selectedRecordId={selectedRecordId} />
    </div>
  )
}
