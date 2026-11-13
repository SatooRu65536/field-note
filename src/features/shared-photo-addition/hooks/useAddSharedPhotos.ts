import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { addAdminRecordPhotos } from '@/integrations/field-note-api/adminRecords'
import type { RecordCommandResult } from '@/integrations/field-note-api/adminRecords'
import { QUERY_KEYS } from '@/integrations/field-note-api/queryKeys'
import { createRecordPhotosFormData } from '@/integrations/field-note-api/recordFormData'
import type { RecordPhotosPayload } from '@/integrations/field-note-api/recordFormData'
import { clearSharedPhotos } from '@/integrations/pwa/sharedPhotos'

interface AddSharedPhotos {
  readonly addPhotos: (payload: RecordPhotosPayload) => void
  readonly addingRecordId: string | null
  // 1件ずつ追加するため，追加中は他の記録に追加できない
  readonly isAdding: boolean
  readonly error: string | null
}

/**
 * 共有された写真を登録済みの記録に追加し，成功したら共有された写真を消して記録の詳細に移動する
 * @returns 追加処理と，追加中・エラーの状態
 */
export function useAddSharedPhotos(): AddSharedPhotos {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (payload: RecordPhotosPayload): Promise<RecordCommandResult> =>
      addAdminRecordPhotos({ data: createRecordPhotosFormData(payload) }),
    onSuccess: async (result) => {
      if (!result.ok) return
      // 同じ写真を別の記録に重ねて追加しないよう，追加した写真は消す
      // 写真の追加は確定しているため，消せなくても失敗として扱わない（失敗表示を見て再度追加すると写真が重複する）
      await clearSharedPhotos().catch((error: unknown) => {
        console.error('共有された写真の削除に失敗しました', error)
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminRecords }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicRecords }),
      ])
      // 追加した写真を確かめられるよう，記録の詳細に移動する
      await navigate({ to: '/records/$recordId', params: { recordId: result.recordId } })
    },
  })

  const resultError = mutation.data && !mutation.data.ok ? mutation.data.error : null
  const requestError = mutation.error ? '写真の追加に失敗しました．時間をおいて再度お試しください' : null

  return {
    addPhotos: mutation.mutate,
    addingRecordId: mutation.isPending ? (mutation.variables?.recordId ?? null) : null,
    isAdding: mutation.isPending,
    error: resultError ?? requestError,
  }
}
