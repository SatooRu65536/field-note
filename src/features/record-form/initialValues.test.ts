import { describe, expect, it } from 'vitest'

import { createEditRecordFormValues, createNewRecordFormValues } from './initialValues'

describe('createNewRecordFormValues', () => {
  it('発見日時を指定した日時にし，その他の項目を未入力にする', () => {
    // Act
    const values = createNewRecordFormValues({ now: new Date(2026, 10, 13, 9, 30), location: null })

    // Assert
    expect(values).toEqual({
      name: '',
      isNameUnknown: false,
      categoryId: '',
      location: null,
      discoveredAt: '2026-11-13T09:30',
      memo: '',
      tags: [],
      nameMemo: null,
      isPublic: false,
      existingPhotoIds: [],
      removedPhotoIds: [],
      newPhotos: [],
    })
  })
})

describe('createNewRecordFormValues の発見場所', () => {
  it('指定した発見場所を初期値にする', () => {
    // Arrange
    const location = { latitude: 35.18, longitude: 136.89 }

    // Act
    const values = createNewRecordFormValues({ now: new Date(2026, 10, 13), location })

    // Assert
    expect(values.location).toEqual(location)
  })
})

describe('createEditRecordFormValues', () => {
  const RECORD = {
    id: 'record-1',
    name: 'コナラ',
    categoryId: 'seed',
    latitude: 35.18,
    longitude: 136.89,
    discoveredAt: new Date(2026, 10, 13, 9, 30),
    memo: '公園で拾った',
    tags: ['どんぐり'],
    nameMemo: 'ブナ科の落葉高木',
    isPublic: true,
    photoIds: ['photo-1'],
    updatedAt: new Date(2026, 10, 14),
  }

  it('登録済みの記録の内容を入力済みにする', () => {
    // Act
    const values = createEditRecordFormValues(RECORD)

    // Assert
    expect(values).toEqual({
      name: 'コナラ',
      isNameUnknown: false,
      categoryId: 'seed',
      location: { latitude: 35.18, longitude: 136.89 },
      discoveredAt: '2026-11-13T09:30',
      memo: '公園で拾った',
      tags: ['どんぐり'],
      nameMemo: null,
      isPublic: true,
      existingPhotoIds: ['photo-1'],
      removedPhotoIds: [],
      newPhotos: [],
    })
  })

  it('名前が分からない記録は名前を空にし，名前が分からないを選択済みにする', () => {
    // Act
    const values = createEditRecordFormValues({ ...RECORD, name: null })

    // Assert
    expect(values.name).toBe('')
    expect(values.isNameUnknown).toBe(true)
  })
})
