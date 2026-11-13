import { describe, expect, it } from 'vitest'

import {
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
  MAX_TOTAL_PHOTO_BYTES,
} from '@/constants/photos'

import { selectSharedPhotos } from './sharedPhotoSelection'

function createPhoto({ type = 'image/jpeg', bytes = 3 }: { type?: string; bytes?: number } = {}): File {
  return new File([new Uint8Array(bytes)], 'photo', { type })
}

describe('selectSharedPhotos', () => {
  it('対応する形式で上限サイズちょうどの写真を選ぶ', () => {
    // Arrange
    const photo = createPhoto({ bytes: MAX_PHOTO_BYTES })

    // Act
    const selection = selectSharedPhotos([photo])

    // Assert
    expect(selection).toEqual({ photos: [photo], unsupportedCount: 0, oversizedCount: 0, overLimitCount: 0 })
  })

  it('対応していない形式の写真を除いて数える', () => {
    // Arrange
    const photo = createPhoto()
    const heic = createPhoto({ type: 'image/heic' })

    // Act
    const selection = selectSharedPhotos([heic, photo])

    // Assert
    expect(selection).toEqual({ photos: [photo], unsupportedCount: 1, oversizedCount: 0, overLimitCount: 0 })
  })

  it('上限サイズを超える写真を除いて数える', () => {
    // Arrange
    const photo = createPhoto()
    const oversized = createPhoto({ bytes: MAX_PHOTO_BYTES + 1 })

    // Act
    const selection = selectSharedPhotos([photo, oversized])

    // Assert
    expect(selection).toEqual({ photos: [photo], unsupportedCount: 0, oversizedCount: 1, overLimitCount: 0 })
  })

  it('上限の枚数を超える写真は，共有された順に上限まで選んで残りを数える', () => {
    // Arrange
    const files = Array.from({ length: MAX_PHOTO_COUNT + 2 }, () => createPhoto())

    // Act
    const selection = selectSharedPhotos(files)

    // Assert
    expect(selection).toEqual({
      photos: files.slice(0, MAX_PHOTO_COUNT),
      unsupportedCount: 0,
      oversizedCount: 0,
      overLimitCount: 2,
    })
  })

  it('合計サイズが上限を超える写真は選ばず，後ろの収まる写真は選ぶ', () => {
    // Arrange
    // 上限の合計サイズに収まる枚数だけ並べ，次の1枚で上限を超えるようにする
    const large = createPhoto({ bytes: MAX_PHOTO_BYTES - 1024 * 1024 })
    const largePhotos = Array.from({ length: Math.floor(MAX_TOTAL_PHOTO_BYTES / large.size) }, () => large)
    const small = createPhoto()
    const files = [...largePhotos, large, small]

    // Act
    const selection = selectSharedPhotos(files)

    // Assert
    expect(selection).toEqual({
      photos: [...largePhotos, small],
      unsupportedCount: 0,
      oversizedCount: 0,
      overLimitCount: 1,
    })
  })
})
