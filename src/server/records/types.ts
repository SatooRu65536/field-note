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
  // 発見した日．まだ発見していない記録は null
  readonly discoveredAt: Date | null
  readonly isPublic: boolean
  readonly thumbnailPhotoId: string | null
  // 写真のない未発見の記録に表示する，同じ名前の記録の写真．それ以外の記録は null
  readonly referencePhotoId: string | null
}

export interface RecordDetail {
  readonly id: string
  readonly name: string | null
  readonly categoryId: string
  readonly latitude: number
  readonly longitude: number
  // 発見した日．まだ発見していない記録は null
  readonly discoveredAt: Date | null
  readonly memo: string
  readonly isPublic: boolean
  readonly tags: readonly string[]
  // 名前ごとのメモ．名前が分からない記録や，メモがない場合は空文字
  readonly nameMemo: string
  readonly photoIds: readonly string[]
  readonly updatedAt: Date
}

export interface RecordInput {
  readonly name: string | null
  // 名前だけが異なる記録をまとめて登録するときの，2件目以降の名前
  readonly additionalNames: readonly string[]
  readonly categoryId: string
  readonly latitude: number
  readonly longitude: number
  // 発見した日．まだ発見していない記録は null
  readonly discoveredAt: Date | null
  readonly memo: string
  readonly tags: readonly string[]
  // 名前ごとのメモ．null の場合は変更しない
  readonly nameMemo: string | null
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
