import { describe, expect, it } from 'vitest'

import {
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
  MAX_TOTAL_PHOTO_BYTES,
} from '@/constants/photos'

import {
  createRecordFormData,
  MAX_MEMO_LENGTH,
  MAX_NAME_LENGTH,
  MAX_NAME_MEMO_LENGTH,
  parseRecordFormData,
} from './recordFormData'
import type { RecordPayload } from './recordFormData'
import { MAX_TAG_COUNT, MAX_TAG_LENGTH } from './tags'

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
  memo: '公園の入口で拾った',
  tags: ['どんぐり', '秋'],
  nameMemo: 'ブナ科の落葉高木',
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

  it('タグの文字数は先頭の # と空白を除いて数える', () => {
    // Arrange
    const tag = 'あ'.repeat(MAX_TAG_LENGTH)
    const formData = createRecordFormData({ ...PAYLOAD, tags: [` #${tag} `] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok && result.value.tags).toEqual([tag])
  })

  it('名前ごとのメモを変更しない場合は null にする', () => {
    // Arrange
    const formData = createRecordFormData({ ...PAYLOAD, nameMemo: null })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok && result.value.nameMemo).toBeNull()
  })

  it('名前ごとのメモを空にした場合は空文字にする', () => {
    // Arrange
    const formData = createRecordFormData({ ...PAYLOAD, nameMemo: '  ' })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok && result.value.nameMemo).toBe('')
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
    ['緯度が範囲外', 'latitude', '90.1', '緯度は -90 から 90 の範囲で指定してください'],
    ['経度が範囲外', 'longitude', '-180.1', '経度は -180 から 180 の範囲で指定してください'],
    ['緯度が空', 'latitude', '', '発見場所を指定してください'],
    ['発見日時が日時でない', 'discoveredAt', '2026-13-01', '発見日時が不正です'],
    ['カテゴリが空', 'categoryId', '', 'カテゴリを選択してください'],
  ])('%s場合はエラーを返す', (_, key, value, error) => {
    // Arrange
    const formData = createRecordFormData(PAYLOAD)
    formData.set(key, value)

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result).toEqual({ ok: false, error })
  })

  it.each([
    ['名前', { name: 'あ'.repeat(MAX_NAME_LENGTH) }],
    ['メモ', { memo: 'あ'.repeat(MAX_MEMO_LENGTH) }],
    ['名前のメモ', { nameMemo: 'あ'.repeat(MAX_NAME_MEMO_LENGTH) }],
    ['タグの文字数', { tags: ['あ'.repeat(MAX_TAG_LENGTH)] }],
    ['タグの個数', { tags: Array.from({ length: MAX_TAG_COUNT }, (_, index) => `タグ${index}`) }],
  ])('%sが上限ちょうどの場合は受け付ける', (_, override) => {
    // Arrange
    const formData = createRecordFormData({ ...PAYLOAD, ...override })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(true)
  })

  it.each([
    ['名前', { name: 'あ'.repeat(MAX_NAME_LENGTH + 1) }, `名前は ${MAX_NAME_LENGTH} 文字以内で入力してください`],
    [
      'メモ',
      { memo: 'あ'.repeat(MAX_MEMO_LENGTH + 1) },
      `メモは ${MAX_MEMO_LENGTH} 文字以内で入力してください`,
    ],
    [
      '名前のメモ',
      { nameMemo: 'あ'.repeat(MAX_NAME_MEMO_LENGTH + 1) },
      `名前のメモは ${MAX_NAME_MEMO_LENGTH} 文字以内で入力してください`,
    ],
    [
      'タグの文字数',
      { tags: ['あ'.repeat(MAX_TAG_LENGTH + 1)] },
      `タグは ${MAX_TAG_LENGTH} 文字以内で入力してください`,
    ],
    [
      'タグの個数',
      { tags: Array.from({ length: MAX_TAG_COUNT + 1 }, (_, index) => `タグ${index}`) },
      `タグは ${MAX_TAG_COUNT} 個までです`,
    ],
  ])('%sが上限を超える場合はエラーを返す', (_, override, error) => {
    // Arrange
    const formData = createRecordFormData({ ...PAYLOAD, ...override })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result).toEqual({ ok: false, error })
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
    expect(result).toEqual({ ok: false, error: `写真は ${MAX_PHOTO_COUNT} 枚までです` })
  })

  it('写真が上限サイズちょうどの場合は受け付ける', () => {
    // Arrange
    const photo = createPhoto({ bytes: MAX_PHOTO_BYTES })
    const formData = createRecordFormData({ ...PAYLOAD, photos: [photo] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result.ok).toBe(true)
  })

  it('写真の合計サイズが上限を超える場合はエラーを返す', () => {
    // Arrange
    const photoCount = Math.floor(MAX_TOTAL_PHOTO_BYTES / MAX_PHOTO_BYTES) + 1
    const photos = Array.from({ length: photoCount }, () => createPhoto({ bytes: MAX_PHOTO_BYTES }))
    const formData = createRecordFormData({ ...PAYLOAD, photos })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result).toEqual({
      ok: false,
      error: `一度に保存できる写真は合計 ${MAX_TOTAL_PHOTO_BYTES / 1024 / 1024} MB までです`,
    })
  })

  it('写真が上限サイズを超える場合はエラーを返す', () => {
    // Arrange
    const photo = createPhoto({ bytes: MAX_PHOTO_BYTES + 1 })
    const formData = createRecordFormData({ ...PAYLOAD, photos: [photo] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result).toEqual({
      ok: false,
      error: `写真は1枚あたり ${MAX_PHOTO_BYTES / 1024 / 1024} MB 以下にしてください`,
    })
  })

  it('対応していない形式の写真はエラーを返す', () => {
    // Arrange
    const photo = createPhoto({ type: 'image/svg+xml' })
    const formData = createRecordFormData({ ...PAYLOAD, photos: [photo] })

    // Act
    const result = parseRecordFormData(formData)

    // Assert
    expect(result).toEqual({
      ok: false,
      error: '写真は JPEG・PNG・WebP・AVIF のいずれかを選択してください',
    })
  })
})
