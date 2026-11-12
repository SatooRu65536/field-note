import { describe, expect, it } from 'vitest'

import type { RecordFormValues } from './types'
import { validateRecordFormValues } from './validation'

const VALUES: RecordFormValues = {
  name: ' コナラ ',
  isNameUnknown: false,
  categoryId: 'seed',
  location: { latitude: 35.18, longitude: 136.89 },
  discoveredAt: '2026-11-13',
  isUndiscovered: false,
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
        additionalNames: [],
        categoryId: 'seed',
        latitude: 35.18,
        longitude: 136.89,
        discoveredAt: new Date(2026, 10, 13),
        memo: '公園で拾った',
              tags: ['どんぐり'],
        nameMemo: 'ブナ科の落葉高木',
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

  it('新規登録では区切り文字で区切った名前ごとに記録を登録し，名前ごとのメモは保存しない', () => {
    // Arrange
    const values = { ...VALUES, name: 'サッパ，シロギス' }

    // Act
    const result = validateRecordFormValues({ values, recordId: undefined })

    // Assert
    expect(result.ok && result.value).toMatchObject({
      name: 'サッパ',
      additionalNames: ['シロギス'],
      nameMemo: null,
    })
  })

  it('編集では区切り文字も名前の一部として1件の記録にする', () => {
    // Arrange
    const values = { ...VALUES, name: 'サッパ，シロギス' }

    // Act
    const result = validateRecordFormValues({ values, recordId: 'record-1' })

    // Assert
    expect(result.ok && result.value).toMatchObject({
      name: 'サッパ，シロギス',
      additionalNames: [],
    })
  })

  it('未発見の場合は発見日を null にし，発見日の入力欄は使わない', () => {
    // Arrange
    const values = { ...VALUES, discoveredAt: '', isUndiscovered: true }

    // Act
    const result = validateRecordFormValues({ values, recordId: undefined })

    // Assert
    expect(result.ok && result.value.discoveredAt).toBeNull()
  })

  it.each<[string, Partial<RecordFormValues>]>([
    ['名前が空で名前が分からないも選ばれていない', { name: '  ' }],
    ['名前が区切り文字だけ', { name: '，，' }],
    ['カテゴリが未選択', { categoryId: '' }],
    ['発見場所が未指定', { location: null }],
    ['発見日が未入力で未発見も選ばれていない', { discoveredAt: '' }],
  ])('%sの場合はエラーを返す', (_, override) => {
    // Arrange
    const values = { ...VALUES, ...override }

    // Act
    const result = validateRecordFormValues({ values, recordId: undefined })

    // Assert
    expect(result.ok).toBe(false)
  })
})
