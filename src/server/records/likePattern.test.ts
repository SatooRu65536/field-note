import { describe, expect, it } from 'vitest'

import { createContainsPattern } from './likePattern'

describe('createContainsPattern', () => {
  it('前後を % で囲む', () => {
    // Act
    const pattern = createContainsPattern('こなら')

    // Assert
    expect(pattern).toBe('%こなら%')
  })

  it('LIKE で特別な意味を持つ % と _ と \\ をエスケープする', () => {
    // Act
    const pattern = createContainsPattern('50%_a\\b')

    // Assert
    expect(pattern).toBe('%50\\%\\_a\\\\b%')
  })
})
