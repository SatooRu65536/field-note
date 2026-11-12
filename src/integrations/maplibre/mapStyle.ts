import { queryOptions } from '@tanstack/react-query'
import type {
  ExpressionSpecification,
  LayerSpecification,
  StyleSpecification,
} from 'maplibre-gl'

// CARTO のベースマップ（Positron）．色を抑えた地図で，記録のピンを目立たせる
const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

// 地名を絞り込むため，道路名・番地・小字などの細かいラベルを表示しない
const HIDDEN_LAYER_IDS: readonly string[] = [
  'roadname_minor',
  'roadname_sec',
  'roadname_pri',
  'roadname_major',
  'housenumber',
  'place_hamlet',
  'poi_stadium',
]

// 森林・草地・公園などの緑地を塗るレイヤー
const GREEN_LAYER_IDS: readonly string[] = [
  'landcover',
  'park_national_park',
  'park_nature_reserve',
]

const GREEN_FILL_COLOR = 'rgba(178, 222, 160, 0.7)'
// 元のスタイルはレイヤーごとに不透明度が異なるため，緑地の濃さを揃える
const GREEN_FILL_OPACITY = 1
const WATER_FILL_COLOR = '#a8d4ef'
const WATERWAY_LINE_COLOR = '#86c0e6'

// 低いズームでは英語名を表示する元のスタイルに対し，日本語名を優先する
const LOCAL_NAME_TEXT_FIELD: ExpressionSpecification = ['coalesce', ['get', 'name:ja'], ['get', 'name']]

// 元のスタイルではズーム 13 以上で薄く描く線路を，路線の位置が分かるよう濃くして駅と同じズームから描く
const RAIL_LAYER_IDS: readonly string[] = ['rail', 'tunnel_rail']
const RAIL_LINE_COLOR = '#8a8f98'
// 路線と駅を表示し始めるズームレベル
const TRANSIT_MIN_ZOOM = 12

// 元のスタイルでは薄い色の細い破線で描く県境を，県の範囲が分かるよう濃い実線で描く
const PREFECTURE_BOUNDARY_LAYER_ID = 'boundary_state'
const PREFECTURE_BOUNDARY_COLOR = '#8a6f80'

const SOURCE_ID = 'protomaps'
const STATION_COLOR = '#4a5160'
// 元のスタイルの地名のラベルと同じフォント．CJK のフォントを含む
const LABEL_FONT = ['Montserrat SemiBold', 'Open Sans Bold', 'Noto Sans Regular', 'Noto Sans CJK JP Regular']

// 元のスタイルにない，地下鉄の路線と駅を描くレイヤー．地下鉄も他の路線と同じく実線で描く
const TRANSIT_LAYERS: readonly LayerSpecification[] = [
  {
    id: 'field_note_subway',
    type: 'line',
    source: SOURCE_ID,
    'source-layer': 'roads',
    minzoom: TRANSIT_MIN_ZOOM,
    filter: ['all', ['==', ['get', 'kind'], 'rail'], ['==', ['get', 'kind_detail'], 'subway']],
    paint: {
      'line-color': RAIL_LINE_COLOR,
      'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 3],
    },
  },
  {
    id: 'field_note_station_dot',
    type: 'circle',
    source: SOURCE_ID,
    'source-layer': 'pois',
    minzoom: TRANSIT_MIN_ZOOM,
    filter: ['==', ['get', 'kind'], 'station'],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 5],
      'circle-color': '#ffffff',
      'circle-stroke-color': STATION_COLOR,
      'circle-stroke-width': 2,
    },
  },
  {
    id: 'field_note_station_label',
    type: 'symbol',
    source: SOURCE_ID,
    'source-layer': 'pois',
    minzoom: TRANSIT_MIN_ZOOM,
    filter: ['==', ['get', 'kind'], 'station'],
    layout: {
      'text-field': ['concat', LOCAL_NAME_TEXT_FIELD, '駅'],
      'text-font': LABEL_FONT,
      'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 13],
      'text-anchor': 'top',
      'text-offset': [0, 0.6],
      'text-max-width': 8,
    },
    paint: {
      'text-color': STATION_COLOR,
      'text-halo-color': 'rgba(255, 255, 255, 0.9)',
      'text-halo-width': 1.5,
    },
  },
]

/**
 * レイヤーの色・ラベルを Field Note 向けに変更する
 * @param layer 元のレイヤー
 * @returns 変更したレイヤー
 */
function customizeLayer(layer: LayerSpecification): LayerSpecification {
  if (layer.type === 'fill' && GREEN_LAYER_IDS.includes(layer.id)) {
    return {
      ...layer,
      paint: { ...layer.paint, 'fill-color': GREEN_FILL_COLOR, 'fill-opacity': GREEN_FILL_OPACITY },
    }
  }
  if (layer.type === 'fill' && layer.id === 'water') {
    return { ...layer, paint: { ...layer.paint, 'fill-color': WATER_FILL_COLOR } }
  }
  if (layer.type === 'line' && RAIL_LAYER_IDS.includes(layer.id)) {
    return {
      ...layer,
      minzoom: TRANSIT_MIN_ZOOM,
      paint: { ...layer.paint, 'line-color': RAIL_LINE_COLOR },
    }
  }
  if (layer.type === 'line' && layer.id === PREFECTURE_BOUNDARY_LAYER_ID) {
    // 破線の指定を除いて実線にする
    const { 'line-dasharray': _, ...paint } = layer.paint ?? {}
    return {
      ...layer,
      paint: {
        ...paint,
        'line-color': PREFECTURE_BOUNDARY_COLOR,
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 8, 1.8, 12, 2.5],
      },
    }
  }
  if (layer.type === 'line' && layer.id === 'waterway') {
    return { ...layer, paint: { ...layer.paint, 'line-color': WATERWAY_LINE_COLOR } }
  }
  if (layer.type === 'symbol' && layer.layout?.['text-field'] !== undefined) {
    return { ...layer, layout: { ...layer.layout, 'text-field': LOCAL_NAME_TEXT_FIELD } }
  }
  return layer
}

/**
 * CARTO のスタイルを，地名を絞り込み，緑地・河川・線路・県境を濃くし，駅を加えたスタイルに変換する
 * @param style CARTO のスタイル
 * @returns 変換したスタイル
 */
export function customizeMapStyle(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    // 駅のラベルを他のラベルと同じく最前面に描くため，元のレイヤーの後ろに加える
    layers: [
      ...style.layers.filter((layer) => !HIDDEN_LAYER_IDS.includes(layer.id)).map(customizeLayer),
      ...TRANSIT_LAYERS,
    ],
  }
}

/**
 * 取得したスタイルが MapLibre のスタイルの形をしているか確かめる
 * @param value 取得した値
 * @returns スタイルの形をしている場合に true
 */
export function isStyleSpecification(value: unknown): value is StyleSpecification {
  if (typeof value !== 'object' || value === null) return false
  return (
    'version' in value &&
    value.version === 8 &&
    'sources' in value &&
    typeof value.sources === 'object' &&
    value.sources !== null &&
    'layers' in value &&
    Array.isArray(value.layers)
  )
}

/**
 * CARTO のスタイルを取得して変換する
 * @returns 変換したスタイル．応答が失敗・不正な形式の場合は，変換しないスタイルの URL
 * @throws 通信に失敗した場合．TanStack Query が再試行する
 */
async function fetchMapStyle(): Promise<StyleSpecification | string> {
  const response = await fetch(MAP_STYLE_URL)
  // 色やラベルを変えられなくても地図自体は表示できるよう，元のスタイルで表示する
  if (!response.ok) {
    console.warn(`地図のスタイルを取得できなかったため，元のスタイルで表示します（status: ${response.status}）`)
    return MAP_STYLE_URL
  }
  const style: unknown = await response.json()
  if (!isStyleSpecification(style)) {
    console.warn('地図のスタイルの形式が不正なため，元のスタイルで表示します')
    return MAP_STYLE_URL
  }
  return customizeMapStyle(style)
}

/**
 * 地図のスタイルを取得するクエリの設定を作成する
 * @returns クエリの設定
 */
export function mapStyleQueryOptions() {
  return queryOptions({
    queryKey: ['mapStyle'],
    queryFn: fetchMapStyle,
    staleTime: Infinity,
  })
}
