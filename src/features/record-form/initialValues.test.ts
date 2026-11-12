import { describe, expect, it } from 'vitest'

import { createEditRecordFormValues, createNewRecordFormValues } from './initialValues'

describe('createNewRecordFormValues', () => {
  it('発見日を指定した日にし，その他の項目を未入力にする', () => {
    // Act
    const values = createNewRecordFormValues({ now: new Date(2026, 10, 13, 9, 30), location: null })

    // Assert
    expect(values).toEqual({
      name: '',
      isNameUnknown: false,
      categoryId: '',
      location: null,
      discoveredAt: '2026-11-13',
      isUndiscovered: false,
      memo: '',
      tags: [],
      nameMemo: null,
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
  const NOW = new Date(2026, 10, 20)

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
    const values = createEditRecordFormValues({ record: RECORD, now: NOW })

    // Assert
    expect(values).toEqual({
      name: 'コナラ',
      isNameUnknown: false,
      categoryId: 'seed',
      location: { latitude: 35.18, longitude: 136.89 },
      discoveredAt: '2026-11-13',
      isUndiscovered: false,
      memo: '公園で拾った',
      tags: ['どんぐり'],
      nameMemo: null,
      existingPhotoIds: ['photo-1'],
      removedPhotoIds: [],
      newPhotos: [],
    })
  })

  it('名前が分からない記録は名前を空にし，名前が分からないを選択済みにする', () => {
    // Act
    const values = createEditRecordFormValues({ record: { ...RECORD, name: null }, now: NOW })

    // Assert
    expect(values.name).toBe('')
    expect(values.isNameUnknown).toBe(true)
  })

  it('未発見の記録は未発見を選択済みにし，発見日の入力欄には今日を入れる', () => {
    // Act
    const values = createEditRecordFormValues({ record: { ...RECORD, discoveredAt: null }, now: NOW })

    // Assert
    expect(values.isUndiscovered).toBe(true)
    expect(values.discoveredAt).toBe('2026-11-20')
  })
})
