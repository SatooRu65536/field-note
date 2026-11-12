import { queryOptions } from '@tanstack/react-query'

import { getCurrentCoordinates } from './getCurrentCoordinates'

/**
 * 現在地を取得するクエリの設定を作成する
 * @returns クエリの設定．取得できない場合，データは null
 */
export function currentPositionQueryOptions() {
  return queryOptions({
    queryKey: ['currentPosition'],
    queryFn: getCurrentCoordinates,
    // 移動しながら使うため，取り直しは利用者の操作に任せ，画面のフォーカスなどでは取り直さない
    staleTime: Infinity,
  })
}
