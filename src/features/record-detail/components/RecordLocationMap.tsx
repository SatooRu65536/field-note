import 'maplibre-gl/dist/maplibre-gl.css'

import { Map, Marker } from 'react-map-gl/maplibre'

import { MapPin } from '@/components/ui/MapPin'
import { FOCUS_ZOOM, MAX_ZOOM, MIN_ZOOM } from '@/integrations/maplibre/constants'
import { MAP_STYLE_URL } from '@/integrations/maplibre/mapStyle'

interface RecordLocationMapProps {
  readonly latitude: number
  readonly longitude: number
  readonly color: string
}

export function RecordLocationMap({ latitude, longitude, color }: RecordLocationMapProps) {
  return (
    <Map
      initialViewState={{ latitude, longitude, zoom: FOCUS_ZOOM }}
      mapStyle={MAP_STYLE_URL}
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
