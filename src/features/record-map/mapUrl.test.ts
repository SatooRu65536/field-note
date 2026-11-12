import { describe, expect, it } from 'vitest'

import { createMapShareUrl, parseMapSearch, toMapView } from './mapUrl'

describe('createMapShareUrl と parseMapSearch', () => {
  it('作成した URL を読み取ると，同じ表示位置と記録に戻る', () => {
    // Arrange
    const url = new URL(
      createMapShareUrl({
        origin: 'https://field-note.example',
        view: { latitude: 35.170912, longitude: 136.881537, zoom: 15.25 },
        recordId: 'record-1',
      }),
    )

    // Act
    const search = parseMapSearch(Object.fromEntries(url.searchParams))

    // Assert
    expect(url.pathname).toBe('/')
    expect(search).toEqual({ lat: 35.17091, lng: 136.88154, zoom: 15.25, record: 'record-1' })
  })

  it('記録を選択していない場合は，記録を URL に含めない', () => {
    // Act
    const url = new URL(
      createMapShareUrl({
        origin: 'https://field-note.example',
        view: { latitude: 35, longitude: 136, zoom: 10 },
        recordId: null,
      }),
    )

    // Assert
    expect(url.searchParams.has('record')).toBe(false)
  })
})

describe('parseMapSearch', () => {
  it.each([
    ['ズームがない', { lat: '35', lng: '136' }],
    ['緯度が範囲外', { lat: '91', lng: '136', zoom: '10' }],
    ['経度が空', { lat: '35', lng: '', zoom: '10' }],
    ['ズームが範囲外', { lat: '35', lng: '136', zoom: '30' }],
  ])('%s場合は表示位置を含めない', (_, search) => {
    // Act
    const result = parseMapSearch(search)

    // Assert
    expect(toMapView(result)).toBeNull()
  })

  it('表示位置がなくても記録は読み取る', () => {
    // Act
    const result = parseMapSearch({ record: 'record-1' })

    // Assert
    expect(result).toEqual({ record: 'record-1' })
  })
})
