import type { LayerSpecification, StyleSpecification } from 'maplibre-gl'

// Planetiler の OpenMapTiles プロファイルで生成した PMTiles の URL
const PMTILES_URL: string | undefined = import.meta.env.VITE_PMTILES_URL

const SOURCE_ID = 'openmaptiles'

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'

const TEXT_FONT = ['Noto Sans Regular']

const PREFECTURE_ADMIN_LEVEL = 4
const MUNICIPALITY_ADMIN_LEVELS = [7, 8]

const BACKGROUND_LAYER: LayerSpecification = {
  id: 'background',
  type: 'background',
  paint: { 'background-color': '#fcfcfc' },
}

const TILE_LAYERS: LayerSpecification[] = [
  {
    id: 'landcover',
    type: 'fill',
    source: SOURCE_ID,
    'source-layer': 'landcover',
    paint: { 'fill-color': '#d8ead2', 'fill-opacity': 0.6 },
  },
  {
    id: 'park',
    type: 'fill',
    source: SOURCE_ID,
    'source-layer': 'park',
    paint: { 'fill-color': '#d8ead2', 'fill-opacity': 0.6 },
  },
  {
    id: 'water',
    type: 'fill',
    source: SOURCE_ID,
    'source-layer': 'water',
    paint: { 'fill-color': '#cfe3f0' },
  },
  {
    id: 'building',
    type: 'fill',
    source: SOURCE_ID,
    'source-layer': 'building',
    minzoom: 13,
    paint: { 'fill-color': '#e8e8e8', 'fill-opacity': 0.4 },
  },
  {
    id: 'transportation',
    type: 'line',
    source: SOURCE_ID,
    'source-layer': 'transportation',
    // class が path の地物は歩道・階段などを含み，車道と同じ太さでは道路が過密に見えるため除外する
    filter: ['!', ['in', ['get', 'class'], ['literal', ['ferry', 'path', 'bridge']]]],
    paint: { 'line-color': '#bfbfbf', 'line-width': 1 },
  },
  {
    id: 'boundary-municipality',
    type: 'line',
    source: SOURCE_ID,
    'source-layer': 'boundary',
    filter: ['in', ['get', 'admin_level'], ['literal', MUNICIPALITY_ADMIN_LEVELS]],
    paint: {
      'line-color': '#8c8c8c',
      'line-width': 2,
      'line-dasharray': ['literal', [2, 1]],
    },
  },
  // 都道府県境は市区町村境と重なることが多く，先に描画すると市区町村境に隠れるため後ろに置く
  {
    id: 'boundary-prefecture',
    type: 'line',
    source: SOURCE_ID,
    'source-layer': 'boundary',
    filter: ['==', ['get', 'admin_level'], PREFECTURE_ADMIN_LEVEL],
    paint: { 'line-color': '#666666', 'line-width': 1.5 },
  },
  {
    id: 'place',
    type: 'symbol',
    source: SOURCE_ID,
    'source-layer': 'place',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': TEXT_FONT,
      'text-size': ['interpolate', ['linear'], ['get', 'rank'], 1, 16, 12, 10],
    },
    paint: {
      'text-color': '#333333',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.2,
    },
  },
]

function createMapStyle(pmtilesUrl: string | undefined): StyleSpecification {
  if (!pmtilesUrl) {
    console.warn('VITE_PMTILES_URL が未設定のため，地図タイルを表示しません')
    return { version: 8, sources: {}, layers: [BACKGROUND_LAYER] }
  }

  return {
    version: 8,
    sources: {
      [SOURCE_ID]: {
        type: 'vector',
        url: `pmtiles://${pmtilesUrl}`,
        attribution: ATTRIBUTION,
      },
    },
    layers: [BACKGROUND_LAYER, ...TILE_LAYERS],
  }
}

export const MAP_STYLE = createMapStyle(PMTILES_URL)
