import type { LayerSpecification, StyleSpecification } from 'maplibre-gl'
import { describe, expect, it } from 'vitest'

import { customizeMapStyle, isStyleSpecification } from './mapStyle'

const STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#fafaf8' } },
    {
      id: 'landcover',
      type: 'fill',
      source: 'protomaps',
      paint: { 'fill-color': 'rgba(234, 241, 233, 0.5)', 'fill-antialias': true },
    },
    { id: 'landuse', type: 'fill', source: 'protomaps', paint: { 'fill-color': '#eee' } },
    { id: 'water', type: 'fill', source: 'protomaps', paint: { 'fill-color': '#d4dadc' } },
    { id: 'waterway', type: 'line', source: 'protomaps', paint: { 'line-color': '#d1dbdf' } },
    {
      id: 'place_town',
      type: 'symbol',
      source: 'protomaps',
      layout: { 'text-field': ['get', 'name:en'], 'text-size': 12 },
    },
    {
      id: 'rail',
      type: 'line',
      source: 'protomaps',
      minzoom: 13,
      paint: { 'line-color': '#dddddd', 'line-width': 1 },
    },
    {
      id: 'boundary_state',
      type: 'line',
      source: 'protomaps',
      paint: { 'line-color': '#ead5d7', 'line-width': 1, 'line-dasharray': [2, 2] },
    },
    { id: 'roadname_minor', type: 'symbol', source: 'protomaps', layout: { 'text-field': '' } },
    { id: 'housenumber', type: 'symbol', source: 'protomaps', layout: { 'text-field': '' } },
  ],
}

/**
 * スタイルからレイヤーを ID で探す
 * @param style 探すスタイル
 * @param id レイヤーの ID
 * @returns レイヤー．見つからない場合は undefined
 */
function findLayer({
  style,
  id,
}: {
  style: StyleSpecification
  id: string
}): LayerSpecification | undefined {
  return style.layers.find((layer) => layer.id === id)
}

describe('customizeMapStyle', () => {
  it('道路名・番地のラベルを取り除く', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(style.layers.map(({ id }) => id)).not.toContain('roadname_minor')
    expect(style.layers.map(({ id }) => id)).not.toContain('housenumber')
  })

  it('地名のラベルは日本語名を優先して残す', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(findLayer({ style: style, id: 'place_town' })).toEqual({
      id: 'place_town',
      type: 'symbol',
      source: 'protomaps',
      layout: { 'text-field': ['coalesce', ['get', 'name:ja'], ['get', 'name']], 'text-size': 12 },
    })
  })

  it('緑地の塗りの色と不透明度を変え，その他の塗りの設定は保つ', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(findLayer({ style: style, id: 'landcover' })).toMatchObject({
      paint: {
        'fill-color': 'rgba(178, 222, 160, 0.7)',
        'fill-opacity': 1,
        'fill-antialias': true,
      },
    })
  })

  it('水域と河川の色を変える', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(findLayer({ style: style, id: 'water' })).toMatchObject({ paint: { 'fill-color': '#a8d4ef' } })
    expect(findLayer({ style: style, id: 'waterway' })).toMatchObject({ paint: { 'line-color': '#86c0e6' } })
  })

  it('緑地・水域以外のレイヤーは変えない', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(findLayer({ style: style, id: 'landuse' })).toEqual(findLayer({ style: STYLE, id: 'landuse' }))
    expect(findLayer({ style: style, id: 'background' })).toEqual(findLayer({ style: STYLE, id: 'background' }))
  })
})

describe('customizeMapStyle の駅と路線', () => {
  it('線路を濃い色にし，駅と同じズームから描く', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(findLayer({ style, id: 'field_note_station_dot' })).toMatchObject({ minzoom: 12 })
    expect(findLayer({ style, id: 'rail' })).toMatchObject({
      minzoom: 12,
      paint: { 'line-color': '#8a8f98', 'line-width': 1 },
    })
  })

  it('地下鉄の路線と駅のレイヤーを，県境を除く元のレイヤーの後ろに加える', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(style.layers.slice(-5, -2).map(({ id }) => id)).toEqual([
      'field_note_subway',
      'field_note_station_dot',
      'field_note_station_label',
    ])
  })
})

describe('customizeMapStyle の地下鉄', () => {
  it('地下鉄を他の路線と同じ色の実線で描く', () => {
    // Act
    const style = customizeMapStyle(STYLE)
    const subway = findLayer({ style, id: 'field_note_subway' })

    // Assert
    expect(subway).toMatchObject({ minzoom: 12, paint: { 'line-color': '#8a8f98' } })
    expect(subway?.type === 'line' && subway.paint?.['line-dasharray']).toBeFalsy()
  })
})

describe('customizeMapStyle の県境', () => {
  it('県境を最前面に描く', () => {
    // Act
    const style = customizeMapStyle(STYLE)

    // Assert
    expect(style.layers.at(-1)?.id).toBe('boundary_state')
  })

  it('市町村境を県境のすぐ下に，県境より細く描く', () => {
    // Act
    const style = customizeMapStyle(STYLE)
    const municipality = findLayer({ style, id: 'field_note_municipality_boundary' })

    // Assert
    expect(style.layers.at(-2)?.id).toBe('field_note_municipality_boundary')
    expect(municipality).toMatchObject({
      filter: ['==', ['get', 'kind_detail'], 7],
      minzoom: 10,
      paint: { 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.6, 12, 1, 16, 1.5] },
    })
  })

  it('県境を濃い色の太い実線にする', () => {
    // Act
    const style = customizeMapStyle(STYLE)
    const boundary = findLayer({ style, id: 'boundary_state' })

    // Assert
    expect(boundary).toMatchObject({ paint: { 'line-color': '#8a6f80' } })
    expect(boundary?.type === 'line' && boundary.paint?.['line-dasharray']).toBeFalsy()
  })
})

describe('customizeMapStyle の境界のタイル', () => {
  const STYLE_WITH_SOURCE: StyleSpecification = {
    ...STYLE,
    sources: {
      protomaps: { type: 'vector', tiles: ['https://example.test/{z}/{x}/{y}.mvt'], maxzoom: 15 },
    },
  }

  it('境界はズーム 13 までのタイルを拡大して描く', () => {
    // Act
    const style = customizeMapStyle(STYLE_WITH_SOURCE)

    // Assert
    expect(style.sources.field_note_boundaries).toEqual({
      type: 'vector',
      tiles: ['https://example.test/{z}/{x}/{y}.mvt'],
      maxzoom: 13,
    })
    expect(findLayer({ style, id: 'boundary_state' })).toMatchObject({ source: 'field_note_boundaries' })
    expect(findLayer({ style, id: 'field_note_municipality_boundary' })).toMatchObject({
      source: 'field_note_boundaries',
    })
  })

  it('境界以外のレイヤーは元のタイルのまま描く', () => {
    // Act
    const style = customizeMapStyle(STYLE_WITH_SOURCE)

    // Assert
    expect(findLayer({ style, id: 'water' })).toMatchObject({ source: 'protomaps' })
  })
})

describe('isStyleSpecification', () => {
  it('version 8 で sources と layers を持つ場合に true を返す', () => {
    // Act
    const result = isStyleSpecification({ version: 8, sources: {}, layers: [] })

    // Assert
    expect(result).toBe(true)
  })

  it.each([
    ['null', null],
    ['version が 8 でない', { version: 7, sources: {}, layers: [] }],
    ['layers が配列でない', { version: 8, sources: {}, layers: {} }],
    ['sources がない', { version: 8, layers: [] }],
    ['sources が null', { version: 8, sources: null, layers: [] }],
  ])('%sの場合は false を返す', (_, value) => {
    // Act
    const result = isStyleSpecification(value)

    // Assert
    expect(result).toBe(false)
  })
})
