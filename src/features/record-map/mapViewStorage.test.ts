import { describe, expect, it } from 'vitest'

import { parseMapView } from './mapViewStorage'

describe('parseMapView', () => {
  it('保存した表示位置を読み込む', () => {
    // Act
    const view = parseMapView(JSON.stringify({ latitude: 35.17, longitude: 136.88, zoom: 13.5 }))

    // Assert
    expect(view).toEqual({ latitude: 35.17, longitude: 136.88, zoom: 13.5 })
  })

  it.each([
    ['保存していない', null],
    ['JSON でない', '{broken'],
    ['ズームが範囲外', JSON.stringify({ latitude: 35, longitude: 136, zoom: 30 })],
    ['緯度がない', JSON.stringify({ longitude: 136, zoom: 10 })],
  ])('%s場合は null を返す', (_, value) => {
    // Act
    const view = parseMapView(value)

    // Assert
    expect(view).toBeNull()
  })
})
