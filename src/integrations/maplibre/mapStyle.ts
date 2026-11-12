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
  if (layer.type === 'line' && layer.id === 'waterway') {
    return { ...layer, paint: { ...layer.paint, 'line-color': WATERWAY_LINE_COLOR } }
  }
  if (layer.type === 'symbol' && layer.layout?.['text-field'] !== undefined) {
    return { ...layer, layout: { ...layer.layout, 'text-field': LOCAL_NAME_TEXT_FIELD } }
  }
  return layer
}

/**
 * CARTO のスタイルを，地名を絞り込み緑地・河川の色を濃くしたスタイルに変換する
 * @param style CARTO のスタイル
 * @returns 変換したスタイル
 */
export function customizeMapStyle(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    layers: style.layers
      .filter((layer) => !HIDDEN_LAYER_IDS.includes(layer.id))
      .map(customizeLayer),
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
