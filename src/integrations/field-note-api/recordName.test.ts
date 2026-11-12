import { describe, expect, it } from 'vitest'

import { formatRecordName } from './recordName'

describe('formatRecordName', () => {
  it('名前がある場合はそのまま返す', () => {
    // Act
    const name = formatRecordName('コナラ')

    // Assert
    expect(name).toBe('コナラ')
  })

  it('名前が分からない記録は「名前不明」と表す', () => {
    // Act
    const name = formatRecordName(null)

    // Assert
    expect(name).toBe('名前不明')
  })
})
