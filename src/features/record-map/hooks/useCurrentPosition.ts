import { useQuery } from '@tanstack/react-query'

import { getCurrentCoordinates } from '@/integrations/geolocation/getCurrentCoordinates'
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
  const { data, refetch } = useQuery({
    queryKey: ['currentPosition'],
    queryFn: getCurrentCoordinates,
    // 移動しながら使うため，取り直しは利用者の操作に任せ，画面のフォーカスなどでは取り直さない
    staleTime: Infinity,
  })

  async function refreshCurrentPosition(): Promise<Coordinates | null> {
    const result = await refetch()
    return result.data ?? null
  }

  return { currentPosition: data ?? null, refreshCurrentPosition }
}
