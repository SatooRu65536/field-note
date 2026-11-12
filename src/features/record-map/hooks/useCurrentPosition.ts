import { useQuery } from '@tanstack/react-query'

import { getCurrentCoordinates } from '@/integrations/geolocation/getCurrentCoordinates'
import type { Coordinates } from '@/integrations/geolocation/getCurrentCoordinates'

/**
 * 現在地を取得する
 * @returns 現在地．取得前や取得できない場合は null
 */
export function useCurrentPosition(): Coordinates | null {
  const { data } = useQuery({
    queryKey: ['currentPosition'],
    queryFn: getCurrentCoordinates,
    staleTime: Infinity,
  })
  return data ?? null
}
