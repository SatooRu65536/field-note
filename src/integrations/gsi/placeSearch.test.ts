import { describe, expect, it } from 'vitest'

import { MAX_PLACE_RESULTS, parseAddressSearchResponse } from './placeSearch'

function createFeature({ title, lng, lat }: { title: string; lng: number; lat: number }): unknown {
  return {
    geometry: { coordinates: [lng, lat], type: 'Point' },
    type: 'Feature',
    properties: { addressCode: '', title },
  }
}

describe('parseAddressSearchResponse', () => {
  it('GeoJSON の経度・緯度の順の座標を，緯度・経度に変換する', () => {
    // Act
    const places = parseAddressSearchResponse([
      createFeature({ title: '愛知県名古屋市昭和区鶴舞', lng: 136.917, lat: 35.156 }),
    ])

    // Assert
    expect(places).toEqual([{ title: '愛知県名古屋市昭和区鶴舞', latitude: 35.156, longitude: 136.917 }])
  })

  it('候補は上限の件数までにする', () => {
    // Arrange
    const response = Array.from({ length: MAX_PLACE_RESULTS + 1 }, (_, index) =>
      createFeature({ title: `地名${index}`, lng: 136, lat: 35 }),
    )

    // Act
    const places = parseAddressSearchResponse(response)

    // Assert
    expect(places).toHaveLength(MAX_PLACE_RESULTS)
  })

  it.each([
    ['配列でない', { error: 'invalid' }],
    ['座標が範囲外', [createFeature({ title: '地名', lng: 200, lat: 35 })]],
    ['地名がない', [{ geometry: { coordinates: [136, 35] }, properties: {} }]],
  ])('応答が%s場合は空にする', (_, response) => {
    // Act
    const places = parseAddressSearchResponse(response)

    // Assert
    expect(places).toEqual([])
  })
})
