import { normalizeKana } from '@/integrations/intl/normalizeKana'

import type { RecordSummary } from './types'

export interface NamePhoto {
  readonly name: string
  readonly photoId: string
}

/**
 * 写真のない未発見の記録に，同じ名前の記録の写真を参考の写真として割り当てる
 * @param summaries 一覧用の記録
 * @param namePhotos 記録の名前と写真．同じ名前の中では先のものを使う
 * @returns 参考の写真を割り当てた記録．発見済みの記録や写真がある記録，名前が分からない記録は null のまま
 */
export function attachReferencePhotos({
  summaries,
  namePhotos,
}: {
  summaries: readonly RecordSummary[]
  namePhotos: readonly NamePhoto[]
}): readonly RecordSummary[] {
  // ひらがな・カタカナの違いを無視して同じ名前とみなす
  const photoIdByNameKey = namePhotos.reduce<ReadonlyMap<string, string>>((photoIds, { name, photoId }) => {
    const nameKey = normalizeKana(name)
    return photoIds.has(nameKey) ? photoIds : new Map([...photoIds, [nameKey, photoId]])
  }, new Map())

  return summaries.map((summary) => {
    if (summary.discoveredAt !== null || summary.thumbnailPhotoId !== null || summary.name === null) {
      return summary
    }
    return { ...summary, referencePhotoId: photoIdByNameKey.get(normalizeKana(summary.name)) ?? null }
  })
}

/**
 * 参考の写真を割り当てる必要がある記録があるか判定する
 * @param summaries 一覧用の記録
 * @returns 写真のない未発見の記録で，名前があるものが1件でもある場合に true
 */
export function needsReferencePhotos(summaries: readonly RecordSummary[]): boolean {
  return summaries.some(
    (summary) =>
      summary.discoveredAt === null && summary.thumbnailPhotoId === null && summary.name !== null,
  )
}
