import { describe, expect, it } from 'vitest'

import { MAX_PHOTO_BYTES, MAX_PHOTO_COUNT } from '@/constants/photos'

import { createRecordFormData, parseRecordFormData } from './recordFormData'
import type { RecordPayload } from './recordFormData'

function createPhoto({
  type = 'image/jpeg',
  bytes = 3,
}: { type?: string; bytes?: number } = {}): File {
  return new File([new Uint8Array(bytes)], 'photo', { type })
}

const PAYLOAD: RecordPayload = {
  recordId: 'record-1',
  name: 'コナラ',
  categoryId: 'seed',
  latitude: 35.1847501,
  longitude: 136.8971134,
  discoveredAt: new Date('2026-11-13T01:02:03.000Z'),
  description: '公園の入口で拾った',
  tags: ['どんぐり', '秋'],
  isPublic: true,
  photos: [],
  removedPhotoIds: ['photo-1'],
}

describe('createRecordFormData と parseRecordFormData', () => {
  it('作成した FormData を解析すると元の内容に戻る', () => {
    // Arrange
    const photo = createPhoto()
    const formData = createRecordFormData({ ...PAYLOAD, photos: [photo] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toEqual({ ...PAYLOAD, photos: [photo] })
  })
})

describe('parseRecordFormData', () => {
  it('名前が空の場合は名前が分からない記録として null にする', () => {
    // Arrange
    const formData = createRecordFormData({ ...PAYLOAD, name: null })
    formData.set('name', '   ')

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok && result.value.name).toBeNull()
  })

  it('タグを正規化する', () => {
    // Arrange
    const formData = createRecordFormData({ ...PAYLOAD, tags: ['#秋', '秋', ' '] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok && result.value.tags).toEqual(['秋'])
  })

  it('ファイルを選択していない input から送られた空の File を除外する', () => {
    // Arrange
    const formData = createRecordFormData(PAYLOAD)
    formData.append('photos', new File([], ''))

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok && result.value.photos).toEqual([])
  })

  it.each([
    ['緯度が範囲外', 'latitude', '90.1'],
    ['経度が範囲外', 'longitude', '-180.1'],
    ['緯度が空', 'latitude', ''],
    ['発見日時が日時でない', 'discoveredAt', '2026-13-01'],
    ['カテゴリが空', 'categoryId', ''],
    ['公開設定が真偽値でない', 'isPublic', 'yes'],
  ])('%s場合はエラーを返す', (_, key, value) => {
    // Arrange
    const formData = createRecordFormData(PAYLOAD)
    formData.set(key, value)

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(false)
  })

  it('緯度・経度は境界値を受け付ける', () => {
    // Arrange
    const formData = createRecordFormData({ ...PAYLOAD, latitude: -90, longitude: 180 })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(true)
  })

  it('写真が上限枚数ちょうどの場合は受け付ける', () => {
    // Arrange
    const photos = Array.from({ length: MAX_PHOTO_COUNT }, () => createPhoto())
    const formData = createRecordFormData({ ...PAYLOAD, photos })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(true)
  })

  it('写真が上限枚数を超える場合はエラーを返す', () => {
    // Arrange
    const photos = Array.from({ length: MAX_PHOTO_COUNT + 1 }, () => createPhoto())
    const formData = createRecordFormData({ ...PAYLOAD, photos })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(false)
  })

  it('写真が上限サイズを超える場合はエラーを返す', () => {
    // Arrange
    const photo = createPhoto({ bytes: MAX_PHOTO_BYTES + 1 })
    const formData = createRecordFormData({ ...PAYLOAD, photos: [photo] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(false)
  })

  it('対応していない形式の写真はエラーを返す', () => {
    // Arrange
    const photo = createPhoto({ type: 'image/svg+xml' })
    const formData = createRecordFormData({ ...PAYLOAD, photos: [photo] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(false)
  })
})
