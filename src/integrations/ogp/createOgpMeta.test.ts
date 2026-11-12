import { describe, expect, it } from 'vitest'

import { createOgpMeta } from './createOgpMeta'

const META = createOgpMeta({
  title: 'コナラ | Field Note',
  description: '2026/11/13 に発見',
  path: '/records/record-1',
  imagePath: '/photos/photo-1',
  type: 'article',
})

/**
 * メタタグの中から，指定した property または name の値を探す
 * @param key property または name
 * @returns content の値．見つからない場合は undefined
 */
function findContent(key: string): string | undefined {
  return META.find((tag) => tag.property === key || tag.name === key)?.content
}

describe('createOgpMeta', () => {
  it('ページと画像の URL を公開している URL の絶対 URL にする', () => {
    // Assert
    expect(findContent('og:url')).toBe('https://field-note.satooru.dev/records/record-1')
    expect(findContent('og:image')).toBe('https://field-note.satooru.dev/photos/photo-1')
    expect(findContent('twitter:image')).toBe('https://field-note.satooru.dev/photos/photo-1')
  })

  it('タイトルと説明を，ページ・OGP・X のカードで揃える', () => {
    // Assert
    expect(META).toContainEqual({ title: 'コナラ | Field Note' })
    expect(findContent('og:title')).toBe('コナラ | Field Note')
    expect(findContent('twitter:title')).toBe('コナラ | Field Note')
    expect(findContent('description')).toBe('2026/11/13 に発見')
    expect(findContent('og:description')).toBe('2026/11/13 に発見')
  })

  it('OGP の種類と，X のカードの大きさを指定する', () => {
    // Assert
    expect(findContent('og:type')).toBe('article')
    expect(findContent('twitter:card')).toBe('summary_large_image')
  })
})
