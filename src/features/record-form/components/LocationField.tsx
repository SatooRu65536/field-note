import { ClientOnly } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import { MapProvider } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import { Button } from '@/components/ui/Button'
import { getCurrentCoordinates } from '@/integrations/geolocation/getCurrentCoordinates'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

// MapLibre はブラウザでのみ動作するため，サーバーでは読み込まない
const LocationPickerMap = lazy(() =>
  import('./LocationPickerMap').then((module) => ({ default: module.LocationPickerMap })),
)

interface LocationFieldProps {
  readonly location: Coordinates | null
  readonly onLocationChanged: (location: Coordinates) => void
}

export function LocationField({ location, onLocationChanged }: LocationFieldProps) {
  const [isLocating, setIsLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)

  async function handleLocate(): Promise<void> {
    setIsLocating(true)
    setLocateError(null)
    const coordinates = await getCurrentCoordinates()
    setIsLocating(false)
    if (!coordinates) {
      setLocateError('現在地を取得できませんでした．位置情報の利用を許可してください')
      return
    }
    onLocationChanged(coordinates)
  }

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
      <div className={css({ display: 'flex', alignItems: 'center', gap: '3', flexWrap: 'wrap' })}>
        <Button variant="secondary" size="sm" onClick={handleLocate} disabled={isLocating}>
          {isLocating ? '取得中…' : '現在地を使う'}
        </Button>
        <span className={css({ fontSize: 'sm', color: 'muted' })}>
          {location
            ? `緯度 ${location.latitude.toFixed(6)}，経度 ${location.longitude.toFixed(6)}`
            : '地図をクリックして発見場所を指定してください'}
        </span>
      </div>
      {locateError && (
        <p role="alert" className={css({ fontSize: 'sm', color: 'danger' })}>
          {locateError}
        </p>
      )}
      <div
        className={css({
          position: 'relative',
          h: '320px',
          borderRadius: 'lg',
          overflow: 'hidden',
          borderWidth: '1px',
          borderColor: 'border',
          bg: '#fcfcfc',
        })}
      >
        <MapProvider>
          <ClientOnly>
            <Suspense>
              <LocationPickerMap location={location} onLocationChanged={onLocationChanged} />
            </Suspense>
          </ClientOnly>
        </MapProvider>
      </div>
    </div>
  )
}
