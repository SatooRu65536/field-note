import type { RecordSummary } from './types'

export interface RecordSummaryRow {
  readonly id: string
  readonly name: string | null
  readonly categoryId: string
  readonly latitude: number
  readonly longitude: number
  readonly discoveredAt: Date
  readonly isPublic: boolean
  readonly isDiscovered: boolean
  readonly thumbnailPhotoId: string | null
}

/**
 * 発見した日を取り出す
 * @param record 記録の行
 * @returns 発見した日．まだ発見していない記録は null
 */
export function toDiscoveredAt(record: {
  readonly discoveredAt: Date
  readonly isDiscovered: boolean
}): Date | null {
  return record.isDiscovered ? record.discoveredAt : null
}

/**
 * 一覧用に取得した行を，一覧用の記録に変換する
 * @param row 一覧用に取得した行
 * @returns 一覧用の記録．まだ発見していない記録は発見した日を null にする
 */
export function toRecordSummary({ isDiscovered, discoveredAt, ...row }: RecordSummaryRow): RecordSummary {
  return {
    ...row,
    discoveredAt: toDiscoveredAt({ discoveredAt, isDiscovered }),
    // 参考の写真は，一覧を取得した後に attachReferencePhotos で割り当てる
    referencePhotoId: null,
  }
}
