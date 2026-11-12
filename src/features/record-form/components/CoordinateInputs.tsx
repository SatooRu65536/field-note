import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { css } from 'styled-system/css'

import { INPUT_STYLES } from '@/components/ui/styles'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

import { parseCoordinates } from '../coordinates'

interface CoordinateInputsProps {
  readonly location: Coordinates | null
  readonly onLocationChanged: (location: Coordinates) => void
}

export function CoordinateInputs({ location, onLocationChanged }: CoordinateInputsProps) {
  const [latitude, setLatitude] = useState(location ? String(location.latitude) : '')
  const [longitude, setLongitude] = useState(location ? String(location.longitude) : '')
  const coordinates = parseCoordinates({ latitude, longitude })

  function applyCoordinates(): void {
    if (!coordinates) return
    if (
      coordinates.latitude === location?.latitude &&
      coordinates.longitude === location.longitude
    ) {
      return
    }
    onLocationChanged(coordinates)
  }

  function handleBlur(): void {
    applyCoordinates()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return
    // フォーム全体を送信せず，入力した座標だけを反映する
    event.preventDefault()
    applyCoordinates()
  }

  return (
    <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
      <label className={css({ display: 'flex', flexDirection: 'column', gap: '1', fontSize: 'xs', flex: '1', minW: '40' })}>
        緯度
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min={-90}
          max={90}
          value={latitude}
          onChange={(event) => setLatitude(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={INPUT_STYLES}
        />
      </label>
      <label className={css({ display: 'flex', flexDirection: 'column', gap: '1', fontSize: 'xs', flex: '1', minW: '40' })}>
        経度
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min={-180}
          max={180}
          value={longitude}
          onChange={(event) => setLongitude(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={INPUT_STYLES}
        />
      </label>
    </div>
  )
}
