import { describe, expect, it } from 'vitest'

import { attachReferencePhotos, needsReferencePhotos } from './referencePhotos'
import type { RecordSummary } from './types'

const SUMMARY: RecordSummary = {
  id: 'undiscovered',
  name: 'こなら',
  categoryId: 'seed',
  latitude: 35.17,
  longitude: 136.88,
  discoveredAt: null,
  isPublic: true,
  thumbnailPhotoId: null,
  referencePhotoId: null,
}

const NAME_PHOTOS = [
  { name: 'コナラ', photoId: 'newer-photo' },
  { name: 'コナラ', photoId: 'older-photo' },
  { name: 'クヌギ', photoId: 'kunugi-photo' },
]

describe('attachReferencePhotos', () => {
  it('写真のない未発見の記録に，ひらがな・カタカナの違いを無視して同じ名前の記録の先の写真を割り当てる', () => {
    // Act
    const [summary] = attachReferencePhotos({ summaries: [SUMMARY], namePhotos: NAME_PHOTOS })

    // Assert
    expect(summary?.referencePhotoId).toBe('newer-photo')
  })

  it.each<[string, Partial<RecordSummary>]>([
    ['発見済みの記録', { discoveredAt: new Date(2026, 10, 13) }],
    ['自分の写真がある記録', { thumbnailPhotoId: 'own-photo' }],
    ['名前が分からない記録', { name: null }],
    ['同じ名前の写真がない記録', { name: 'イチョウ' }],
  ])('%sには割り当てない', (_, override) => {
    // Act
    const [summary] = attachReferencePhotos({
      summaries: [{ ...SUMMARY, ...override }],
      namePhotos: NAME_PHOTOS,
    })

    // Assert
    expect(summary?.referencePhotoId).toBeNull()
  })
})

describe('needsReferencePhotos', () => {
  it('写真のない未発見の記録で名前があるものがある場合は true を返す', () => {
    // Act
    const result = needsReferencePhotos([SUMMARY])

    // Assert
    expect(result).toBe(true)
  })

  it('割り当てる必要のある記録がない場合は false を返す', () => {
    // Act
    const result = needsReferencePhotos([{ ...SUMMARY, discoveredAt: new Date(2026, 10, 13) }])

    // Assert
    expect(result).toBe(false)
  })
})
