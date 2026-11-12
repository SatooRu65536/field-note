import { describe, expect, it } from 'vitest'

import { createPhotoUrl } from './photos'

describe('createPhotoUrl', () => {
  it('写真の ID を URL のパスとして使えるようエンコードする', () => {
    // Act
    const url = createPhotoUrl('a/b?c')

    // Assert
    expect(url).toBe('/photos/a%2Fb%3Fc')
  })
})
