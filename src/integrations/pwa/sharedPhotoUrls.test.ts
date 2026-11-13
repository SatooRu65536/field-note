import { describe, expect, it } from 'vitest'

import { sortSharedPhotoUrls } from './sharedPhotoUrls'

describe('sortSharedPhotoUrls', () => {
  it('連番を数値として比べて共有された順に並べる', () => {
    // Arrange
    const urls = [
      'https://example.com/shared-photos/10',
      'https://example.com/shared-photos/2',
      'https://example.com/shared-photos/0',
    ]

    // Act
    const sorted = sortSharedPhotoUrls(urls)

    // Assert
    expect(sorted).toEqual([
      'https://example.com/shared-photos/0',
      'https://example.com/shared-photos/2',
      'https://example.com/shared-photos/10',
    ])
  })

  it('共有された写真のものでない URL を除く', () => {
    // Arrange
    const urls = [
      'https://example.com/shared-photos/0',
      'https://example.com/photos/0',
      'https://example.com/shared-photos/name',
      'https://example.com/shared-photos/',
    ]

    // Act
    const sorted = sortSharedPhotoUrls(urls)

    // Assert
    expect(sorted).toEqual(['https://example.com/shared-photos/0'])
  })
})
