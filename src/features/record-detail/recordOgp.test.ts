import { describe, expect, it } from 'vitest'

import { createRecordOgp } from './recordOgp'

const RECORD = {
  name: 'コナラ',
  discoveredAt: new Date('2026-11-13T00:00:00+09:00'),
  memo: '公園の\n入口で拾った',
  photoIds: ['photo-1', 'photo-2'],
}

describe('createRecordOgp', () => {
  it('記録名・発見日とメモ・1枚目の写真から作成する', () => {
    // Act
    const ogp = createRecordOgp(RECORD)

    // Assert
    expect(ogp).toEqual({
      title: 'コナラ | Field Note',
      description: '2026/11/13 に発見．公園の 入口で拾った',
      imagePath: '/photos/photo-1',
    })
  })

  it('写真がない場合はサイトの共有用の画像を使う', () => {
    // Act
    const ogp = createRecordOgp({ ...RECORD, photoIds: [] })

    // Assert
    expect(ogp.imagePath).toBe('/og-image.png')
  })

  it('未発見でメモがない記録は「未発見」とだけ説明する', () => {
    // Act
    const ogp = createRecordOgp({ ...RECORD, name: null, discoveredAt: null, memo: '' })

    // Assert
    expect(ogp).toMatchObject({ title: '名前不明 | Field Note', description: '未発見' })
  })

  it('長いメモは冒頭だけを使う', () => {
    // Act
    const ogp = createRecordOgp({ ...RECORD, memo: 'あ'.repeat(100) })

    // Assert
    expect(ogp.description).toBe(`2026/11/13 に発見．${'あ'.repeat(80)}…`)
  })
})
