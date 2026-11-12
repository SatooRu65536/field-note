import { describe, expect, it } from 'vitest'

import { parseCoordinates } from './coordinates'

describe('parseCoordinates', () => {
  it('緯度・経度の文字列を座標に変換する', () => {
    // Act
    const coordinates = parseCoordinates({ latitude: ' 35.18 ', longitude: '136.89' })

    // Assert
    expect(coordinates).toEqual({ latitude: 35.18, longitude: 136.89 })
  })

  it('緯度・経度は境界値を受け付ける', () => {
    // Act
    const coordinates = parseCoordinates({ latitude: '-90', longitude: '180' })

    // Assert
    expect(coordinates).toEqual({ latitude: -90, longitude: 180 })
  })

  it.each([
    ['緯度が空欄', '', '136'],
    ['経度が数値でない', '35', 'east'],
    ['緯度が範囲外', '90.1', '136'],
    ['経度が範囲外', '35', '-180.1'],
  ])('%sの場合は null を返す', (_, latitude, longitude) => {
    // Act
    const coordinates = parseCoordinates({ latitude, longitude })

    // Assert
    expect(coordinates).toBeNull()
  })
})
