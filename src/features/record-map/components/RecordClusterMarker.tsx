import { Marker } from 'react-map-gl/maplibre'
import type { MarkerEvent } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

interface RecordClusterMarkerProps {
  readonly latitude: number
  readonly longitude: number
  readonly recordCount: number
  readonly onClusterSelected: () => void
}

/**
 * 件数に応じたまとまりの直径を求める
 * @param recordCount まとまりの記録の件数
 * @returns 直径（ピクセル）
 */
function calculateDiameter(recordCount: number): number {
  // 件数が増えても大きくなりすぎないよう，対数で大きくする
  return Math.min(36 + Math.log10(recordCount) * 12, 64)
}

export function RecordClusterMarker({
  latitude,
  longitude,
  recordCount,
  onClusterSelected,
}: RecordClusterMarkerProps) {
  const diameter = calculateDiameter(recordCount)

  function handleClick(event: MarkerEvent<MouseEvent>): void {
    // MapLibre は地図の要素でクリックを受け取るため，ネイティブのイベントの伝播を止めて選択の解除が走らないようにする
    event.originalEvent.stopPropagation()
    onClusterSelected()
  }

  return (
    <Marker latitude={latitude} longitude={longitude} anchor="center" onClick={handleClick}>
      {/* キーボードで選べるようにするためのボタン．Enter で発生するクリックは Marker の onClick で受け取る */}
      <button
        type="button"
        aria-label={`${recordCount} 件の記録．拡大して表示`}
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'full',
          bg: 'primary',
          color: 'on-primary',
          fontWeight: 'bold',
          fontSize: 'sm',
          borderWidth: '3px',
          borderColor: 'white',
          boxShadow: 'floating',
          cursor: 'pointer',
          _focusVisible: { outline: '2px solid', outlineColor: 'accent', outlineOffset: '2px' },
        })}
        style={{ width: diameter, height: diameter }}
      >
        {recordCount}
      </button>
    </Marker>
  )
}
