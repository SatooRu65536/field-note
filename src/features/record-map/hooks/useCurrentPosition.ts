import { useQuery } from '@tanstack/react-query'

import { currentPositionQueryOptions } from '@/integrations/geolocation/currentPositionQueryOptions'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

interface CurrentPosition {
  // 取得前や取得できない場合は null
  readonly currentPosition: Coordinates | null
  readonly refreshCurrentPosition: () => Promise<Coordinates | null>
}

/**
 * 現在地を取得し，必要に応じて取り直す
 * @returns 現在地と，現在地を取り直す関数
 */
export function useCurrentPosition(): CurrentPosition {
  const { data, refetch } = useQuery(currentPositionQueryOptions())

  async function refreshCurrentPosition(): Promise<Coordinates | null> {
    const result = await refetch()
    return result.data ?? null
  }

  return { currentPosition: data ?? null, refreshCurrentPosition }
}
