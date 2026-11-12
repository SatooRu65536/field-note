import { SITE_NAME, SITE_URL } from '@/constants/site'

export interface OgpMetaTag {
  readonly title?: string
  readonly name?: string
  readonly property?: string
  readonly content?: string
}

/**
 * ページのタイトル・説明と，OGP・X（Twitter）のカードのメタタグを作成する
 * @param title ページのタイトル
 * @param description ページの説明
 * @param path ページのパス
 * @param imagePath 共有用の画像のパス
 * @param type OGP の種類．トップは website，個々の記録は article
 * @returns TanStack Router の head の meta に渡すメタタグ
 */
export function createOgpMeta({
  title,
  description,
  path,
  imagePath,
  type,
}: {
  title: string
  description: string
  path: string
  imagePath: string
  type: 'website' | 'article'
}): readonly OgpMetaTag[] {
  // SNS は相対 URL を解決しないため，ページと画像の URL は絶対 URL にする
  const url = new URL(path, SITE_URL).toString()
  const imageUrl = new URL(imagePath, SITE_URL).toString()
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:locale', content: 'ja_JP' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ]
}
