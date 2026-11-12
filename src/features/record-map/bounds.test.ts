import { describe, expect, it } from 'vitest'

import { toPaddedBounds } from './bounds'

describe('toPaddedBounds', () => {
  it('東西・南北それぞれの幅の半分を外側に加える', () => {
    // Arrange
    const bounds = { west: 136, east: 138, south: 34, north: 36 }

    // Act
    const padded = toPaddedBounds(bounds)

    // Assert
    expect(padded).toEqual({ west: 135, east: 139, south: 33, north: 37 })
  })

  it('余白を加えた結果が緯度経度の範囲を超える場合は範囲内に収める', () => {
    // Arrange
    const bounds = { west: -170, east: 170, south: -80, north: 80 }

    // Act
    const padded = toPaddedBounds(bounds)

    // Assert
    expect(padded).toEqual({ west: -180, east: 180, south: -90, north: 90 })
  })
})
