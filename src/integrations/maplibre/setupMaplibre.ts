import { addProtocol } from 'maplibre-gl'
import { Protocol } from 'pmtiles'

let isSetUp = false

/**
 * PMTiles を読み込めるよう MapLibre にプロトコルを登録する．2回目以降の呼び出しは何もしない
 */
export function setupMaplibre(): void {
  if (isSetUp) return
  addProtocol('pmtiles', new Protocol().tile)
  isSetUp = true
}
