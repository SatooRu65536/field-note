import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

// 国土地理院の地名検索 API．利用登録・キーは不要
const ADDRESS_SEARCH_URL = 'https://msearch.gsi.go.jp/address-search/AddressSearch'

// 地名の候補として表示する上限
export const MAX_PLACE_RESULTS = 8

export interface Place {
  readonly title: string
  readonly latitude: number
  readonly longitude: number
}

const ADDRESS_SEARCH_RESPONSE_SCHEMA = z.array(
  z.object({
    geometry: z.object({
      // GeoJSON のため経度・緯度の順
      coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    }),
    properties: z.object({ title: z.string() }),
  }),
)

/**
 * 地名検索 API の応答を検証し，地名の候補に変換する
 * @param response 地名検索 API の応答
 * @returns 地名の候補．形式が不正な場合は空
 */
export function parseAddressSearchResponse(response: unknown): readonly Place[] {
  const result = ADDRESS_SEARCH_RESPONSE_SCHEMA.safeParse(response)
  if (!result.success) return []
  return result.data.slice(0, MAX_PLACE_RESULTS).map(({ geometry, properties }) => ({
    title: properties.title,
    latitude: geometry.coordinates[1],
    longitude: geometry.coordinates[0],
  }))
}

/**
 * 国土地理院の地名検索 API で地名を検索する
 * @param query 検索語
 * @returns 地名の候補
 * @throws 通信に失敗した場合や，応答が失敗した場合
 */
async function searchPlaces(query: string): Promise<readonly Place[]> {
  const url = new URL(ADDRESS_SEARCH_URL)
  url.searchParams.set('q', query)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`地名の検索に失敗しました（status: ${response.status}）`)
  return parseAddressSearchResponse(await response.json())
}

/**
 * 地名を検索するクエリの設定を作成する
 * @param query 検索語
 * @returns クエリの設定
 */
export function placeSearchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ['placeSearch', query],
    queryFn: () => searchPlaces(query),
    staleTime: Infinity,
  })
}
