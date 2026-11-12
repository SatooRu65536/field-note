export interface Bounds {
  readonly west: number
  readonly east: number
  readonly south: number
  readonly north: number
}

export interface RecordSummary {
  readonly id: string
  // 名前が分からない自然物は null
  readonly name: string | null
  readonly categoryId: string
  readonly latitude: number
  readonly longitude: number
  readonly discoveredAt: Date
  readonly isPublic: boolean
  readonly thumbnailPhotoId: string | null
}

export interface RecordDetail {
  readonly id: string
  readonly name: string | null
  readonly categoryId: string
  readonly latitude: number
  readonly longitude: number
  readonly discoveredAt: Date
  readonly description: string
  readonly isPublic: boolean
  readonly tags: readonly string[]
  readonly photoIds: readonly string[]
  readonly updatedAt: Date
}

export interface RecordInput {
  readonly name: string | null
  readonly categoryId: string
  readonly latitude: number
  readonly longitude: number
  readonly discoveredAt: Date
  readonly description: string
  readonly tags: readonly string[]
  readonly isPublic: boolean
  // 新たに追加する写真
  readonly photos: readonly File[]
}

export interface RecordUpdateInput extends RecordInput {
  // 削除する登録済みの写真の ID
  readonly removedPhotoIds: readonly string[]
}

export type RecordCommandResult =
  | { readonly ok: true; readonly recordId: string }
  | { readonly ok: false; readonly error: string }
