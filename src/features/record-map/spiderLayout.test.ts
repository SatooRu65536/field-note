import { describe, expect, it } from 'vitest'

import { calculateSpiderOffsets } from './spiderLayout'

/**
 * 2点間の距離を求める
 * @param a 1つ目の点
 * @param b 2つ目の点
 * @returns 距離
 */
function distanceBetween(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

describe('calculateSpiderOffsets', () => {
  it('件数ぶんの位置を返す', () => {
    // Act
    const offsets = calculateSpiderOffsets(5)

    // Assert
    expect(offsets).toHaveLength(5)
  })

  it('8件以下は中心から同じ距離の円状に並べ，最初の1件を真上に置く', () => {
    // Act
    const offsets = calculateSpiderOffsets(4)

    // Assert
    const radii = offsets.map((offset) => Math.hypot(offset.x, offset.y))
    expect(Math.max(...radii) - Math.min(...radii)).toBeCloseTo(0)
    expect(offsets[0]?.x).toBeCloseTo(0)
    expect(offsets[0]?.y).toBeLessThan(0)
  })

  it.each([2, 8, 9, 30])('%i件を並べても，どの丸も隣と丸の直径以上離れる', (count) => {
    // Act
    const offsets = calculateSpiderOffsets(count)

    // Assert
    const minDistance = Math.min(
      ...offsets.flatMap((a, i) => offsets.slice(i + 1).map((b) => distanceBetween(a, b))),
    )
    expect(minDistance).toBeGreaterThanOrEqual(36)
  })
})
