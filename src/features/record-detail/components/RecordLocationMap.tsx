import 'maplibre-gl/dist/maplibre-gl.css'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Map, Marker } from 'react-map-gl/maplibre'

import { MapPin } from '@/components/ui/MapPin'
import { FOCUS_ZOOM, MAX_ZOOM, MIN_ZOOM } from '@/integrations/maplibre/constants'
import { mapStyleQueryOptions } from '@/integrations/maplibre/mapStyle'

interface RecordLocationMapProps {
  readonly latitude: number
  readonly longitude: number
  readonly color: string
}

export function RecordLocationMap({ latitude, longitude, color }: RecordLocationMapProps) {
  const { data: mapStyle } = useSuspenseQuery(mapStyleQueryOptions())

  return (
    <Map
      initialViewState={{ latitude, longitude, zoom: FOCUS_ZOOM }}
      mapStyle={mapStyle}
      style={{ width: '100%', height: '100%' }}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      localIdeographFontFamily="sans-serif"
      attributionControl={{ compact: true }}
      cooperativeGestures
      renderWorldCopies={false}
    >
      <Marker latitude={latitude} longitude={longitude} anchor="bottom">
        <MapPin color={color} />
      </Marker>
    </Map>
  )
}
