import { describe, expect, it } from 'vitest'

import { selectPinPhotoId } from './pinPhoto'

describe('selectPinPhotoId', () => {
  it('記録の写真があればそれを使う', () => {
    // Act
    const photoId = selectPinPhotoId({ thumbnailPhotoId: 'own', referencePhotoId: 'reference' })

    // Assert
    expect(photoId).toBe('own')
  })

  it('記録の写真がなければ同じ名前の記録の写真を使う', () => {
    // Act
    const photoId = selectPinPhotoId({ thumbnailPhotoId: null, referencePhotoId: 'reference' })

    // Assert
    expect(photoId).toBe('reference')
  })

  it('どちらもなければ null を返す', () => {
    // Act
    const photoId = selectPinPhotoId({ thumbnailPhotoId: null, referencePhotoId: null })

    // Assert
    expect(photoId).toBeNull()
  })
})
