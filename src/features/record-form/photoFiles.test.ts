import { describe, expect, it } from 'vitest'

import { selectPhotoFiles } from './photoFiles'

function createFile(type: string): File {
  return new File(['x'], 'file', { type })
}

describe('selectPhotoFiles', () => {
  it('対応する形式の写真を選び，対応しない形式のファイルを数える', () => {
    // Arrange
    const jpeg = createFile('image/jpeg')
    const files = [jpeg, createFile('application/pdf'), createFile('image/svg+xml')]

    // Act
    const selection = selectPhotoFiles({ files, remainingCount: 10 })

    // Assert
    expect(selection).toEqual({ files: [jpeg], unsupportedCount: 2, overLimitCount: 0 })
  })

  it('追加できる枚数を超えた写真は選ばずに数える', () => {
    // Arrange
    const photos = [createFile('image/png'), createFile('image/webp'), createFile('image/avif')]

    // Act
    const selection = selectPhotoFiles({ files: photos, remainingCount: 2 })

    // Assert
    expect(selection).toEqual({ files: photos.slice(0, 2), unsupportedCount: 0, overLimitCount: 1 })
  })

  it('追加できる枚数が残っていない場合は何も選ばない', () => {
    // Arrange
    const photos = [createFile('image/jpeg')]

    // Act
    const selection = selectPhotoFiles({ files: photos, remainingCount: 0 })

    // Assert
    expect(selection).toEqual({ files: [], unsupportedCount: 0, overLimitCount: 1 })
  })
})
