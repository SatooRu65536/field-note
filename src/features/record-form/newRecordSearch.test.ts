import { describe, expect, it } from 'vitest'

import { parseNewRecordSearch, toInitialLocation } from './newRecordSearch'

describe('parseNewRecordSearch', () => {
  it('緯度・経度の数値を取り出す', () => {
    // Act
    const search = parseNewRecordSearch({ latitude: 35.18, longitude: '136.89' })

    // Assert
    expect(search).toEqual({ latitude: 35.18, longitude: 136.89 })
  })

  it.each([
    ['緯度がない', { longitude: 136 }],
    ['経度が数値でない', { latitude: 35, longitude: 'east' }],
    ['緯度が範囲外', { latitude: 90.1, longitude: 136 }],
    ['緯度・経度が空文字', { latitude: '', longitude: '' }],
    ['緯度が null', { latitude: null, longitude: 136 }],
    ['経度が範囲外', { latitude: 35, longitude: -180.1 }],
  ])('%s場合は発見場所を含めない', (_, value) => {
    // Act
    const search = parseNewRecordSearch(value)

    // Assert
    expect(search).toEqual({})
  })
})

describe('toInitialLocation', () => {
  it('緯度・経度がある場合は座標を返す', () => {
    // Act
    const location = toInitialLocation({ latitude: 35.18, longitude: 136.89 })

    // Assert
    expect(location).toEqual({ latitude: 35.18, longitude: 136.89 })
  })

  it('指定がない場合は null を返す', () => {
    // Act
    const location = toInitialLocation({})

    // Assert
    expect(location).toBeNull()
  })
})
