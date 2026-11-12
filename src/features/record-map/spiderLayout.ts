export interface PixelOffset {
  readonly x: number
  readonly y: number
}

// 円状に並べる上限．これより多い場合は渦巻き状に並べる
const MAX_CIRCLE_ITEMS = 8
// 丸の直径（36px）に余白を加えた，隣り合う丸の間隔
const PIN_SPACING_PIXELS = 40
const MIN_CIRCLE_RADIUS_PIXELS = 36

/**
 * 同じ地点に重なる記録を，中心から広げて並べるときの位置を求める
 * @param count 並べる記録の件数
 * @returns 中心からの位置（ピクセル）．件数が8件以下は円状に，それより多い場合は渦巻き状に並べる
 */
export function calculateSpiderOffsets(count: number): readonly PixelOffset[] {
  if (count <= MAX_CIRCLE_ITEMS) {
    // 丸同士が重ならない円周の長さになるよう半径を決める
    const radius = Math.max(MIN_CIRCLE_RADIUS_PIXELS, (PIN_SPACING_PIXELS * count) / (2 * Math.PI))
    return Array.from({ length: count }, (_, index) => {
      // 真上から時計回りに並べる
      const angle = (2 * Math.PI * index) / count - Math.PI / 2
      return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
    })
  }

  // アルキメデスの渦巻きの上に，隣り合う丸が等間隔になるよう並べる
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.sqrt(index + 1) * 2.4
    const radius = MIN_CIRCLE_RADIUS_PIXELS + (PIN_SPACING_PIXELS / (2 * Math.PI)) * angle * 1.6
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
  })
}
