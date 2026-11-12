import { describe, expect, it } from 'vitest'

import type { RecordFormValues } from './types'
import { validateRecordFormValues } from './validation'

const VALUES: RecordFormValues = {
  name: ' コナラ ',
  isNameUnknown: false,
  categoryId: 'seed',
  location: { latitude: 35.18, longitude: 136.89 },
  discoveredAt: '2026-11-13T09:30',
  memo: ' 公園で拾った \n',
  tags: ['どんぐり'],
  nameMemo: 'ブナ科の落葉高木',
  existingPhotoIds: ['photo-1', 'photo-2'],
  removedPhotoIds: ['photo-2'],
  newPhotos: [],
}

describe('validateRecordFormValues', () => {
  it('入力内容を送信する内容に変換する', () => {
    // Act
    const result = validateRecordFormValues({ values: VALUES, recordId: 'record-1' })

    // Assert
    expect(result).toEqual({
      ok: true,
      value: {
        recordId: 'record-1',
        name: 'コナラ',
        categoryId: 'seed',
        latitude: 35.18,
        longitude: 136.89,
        discoveredAt: new Date(2026, 10, 13, 9, 30),
        memo: '公園で拾った',
        tags: ['どんぐり'],
        nameMemo: 'ブナ科の落葉高木',
        isPublic: true,
        photos: [],
        removedPhotoIds: ['photo-2'],
      },
    })
  })

  it('名前が分からない場合は入力された名前・名前ごとのメモを使わず null にする', () => {
    // Arrange
    const values = { ...VALUES, isNameUnknown: true }

    // Act
    const result = validateRecordFormValues({ values, recordId: undefined })

    // Assert
    expect(result.ok && result.value.name).toBeNull()
    expect(result.ok && result.value.nameMemo).toBeNull()
  })

  it('新たに選択した写真のファイルを送信する', () => {
    // Arrange
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    const values = { ...VALUES, newPhotos: [{ id: 'new', file, previewUrl: 'blob:x' }] }

    // Act
    const result = validateRecordFormValues({ values, recordId: undefined })

    // Assert
    expect(result.ok && result.value.photos).toEqual([file])
  })

  it.each<[string, Partial<RecordFormValues>]>([
    ['名前が空で名前が分からないも選ばれていない', { name: '  ' }],
    ['カテゴリが未選択', { categoryId: '' }],
    ['発見場所が未指定', { location: null }],
    ['発見日時が未入力', { discoveredAt: '' }],
  ])('%sの場合はエラーを返す', (_, override) => {
    // Arrange
    const values = { ...VALUES, ...override }

    // Act
    const result = validateRecordFormValues({ values, recordId: undefined })

    // Assert
    expect(result.ok).toBe(false)
  })
})
