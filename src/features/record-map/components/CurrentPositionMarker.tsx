import { Marker } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

interface CurrentPositionMarkerProps {
  readonly position: Coordinates
}

export function CurrentPositionMarker({ position }: CurrentPositionMarkerProps) {
  return (
    <Marker longitude={position.longitude} latitude={position.latitude} anchor="center">
      <span
        role="img"
        aria-label="現在地"
        className={css({
          display: 'block',
          w: '4',
          h: '4',
          borderRadius: 'full',
          bg: '#007aff',
          borderWidth: '3px',
          borderColor: 'white',
          boxShadow: '0 0 0 6px rgba(0, 122, 255, 0.2)',
        })}
      />
    </Marker>
  )
}
