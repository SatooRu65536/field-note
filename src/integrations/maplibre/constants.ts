import type { ViewState } from 'react-map-gl/maplibre'

// 現在地を取得できない場合に表示する，日本全体が収まる範囲
export const INITIAL_VIEW_STATE: Partial<ViewState> = {
  longitude: 137.5,
  latitude: 37.5,
  zoom: 4.5,
}

// 現在地や記録の位置へ移動するときのズームレベル
export const FOCUS_ZOOM = 14

export const MIN_ZOOM = 4

// 発見場所を建物の単位で確かめられる程度まで拡大できるようにする
export const MAX_ZOOM = 18

export const MAP_TRANSITION_DURATION_MS = 500

// カテゴリが見つからない記録や，発見場所の入力に使うピンの色
export const DEFAULT_PIN_COLOR = '#000000'
