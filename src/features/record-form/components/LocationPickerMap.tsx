import 'maplibre-gl/dist/maplibre-gl.css'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Map, Marker, useMap } from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent, MarkerDragEvent } from 'react-map-gl/maplibre'

import { MapPin } from '@/components/ui/MapPin'
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

const LOCATION_PICKER_MAP_ID = 'location-picker-map'

interface LocationPickerMapProps {
  readonly location: Coordinates | null
  readonly onLocationChanged: (location: Coordinates) => void
}

export function LocationPickerMap({ location, onLocationChanged }: LocationPickerMapProps) {
  const { [LOCATION_PICKER_MAP_ID]: map } = useMap()
  const { data: mapStyle } = useSuspenseQuery(mapStyleQueryOptions())

  // 現在地の取得などで地図の外から位置が変わった場合に，その位置が見えるよう地図を動かす
  useEffect(() => {
    if (!map || !location) return
    if (map.getBounds().contains([location.longitude, location.latitude])) return
    map.flyTo({
      center: [location.longitude, location.latitude],
      zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
      duration: MAP_TRANSITION_DURATION_MS,
    })
  }, [map, location])

  function handleClick(event: MapLayerMouseEvent): void {
    onLocationChanged({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
  }

  function handleDragEnd(event: MarkerDragEvent): void {
    onLocationChanged({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
  }

  return (
    <Map
      id={LOCATION_PICKER_MAP_ID}
      initialViewState={
        location
          ? { latitude: location.latitude, longitude: location.longitude, zoom: FOCUS_ZOOM }
          : INITIAL_VIEW_STATE
      }
      mapStyle={mapStyle}
      style={{ width: '100%', height: '100%' }}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      localIdeographFontFamily="sans-serif"
      attributionControl={{ compact: true }}
      cursor="crosshair"
      renderWorldCopies={false}
      onClick={handleClick}
    >
      {location && (
        <Marker
          latitude={location.latitude}
          longitude={location.longitude}
          anchor="bottom"
          draggable
          onDragEnd={handleDragEnd}
        >
          <MapPin color={DEFAULT_PIN_COLOR} />
        </Marker>
      )}
    </Map>
  )
}
