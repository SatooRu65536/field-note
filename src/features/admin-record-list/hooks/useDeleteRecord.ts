import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteAdminRecord } from '@/integrations/field-note-api/adminRecords'
import { QUERY_KEYS } from '@/integrations/field-note-api/queryKeys'

interface DeleteRecord {
  readonly deleteRecord: (recordId: string) => void
  readonly deletingRecordId: string | null
  // 1件ずつ削除するため，削除中は他の記録を削除できない
  readonly isDeleting: boolean
  readonly error: string | null
}

/**
 * 記録を削除し，記録の一覧を再取得する
 * @returns 削除処理と，削除中・エラーの状態
 */
export function useDeleteRecord(): DeleteRecord {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (recordId: string) => deleteAdminRecord({ data: { recordId } }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminRecords }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicRecords }),
      ]),
  })

  const resultError = mutation.data && !mutation.data.ok ? mutation.data.error : null
  const requestError = mutation.error ? '削除に失敗しました．時間をおいて再度お試しください' : null

  return {
    deleteRecord: mutation.mutate,
    deletingRecordId: mutation.isPending ? (mutation.variables ?? null) : null,
    isDeleting: mutation.isPending,
    error: resultError ?? requestError,
  }
}
