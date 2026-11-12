import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteAdminRecord } from '@/integrations/field-note-api/adminRecords'
import { QUERY_KEYS } from '@/integrations/field-note-api/queryKeys'

interface DeleteRecord {
  readonly deleteRecord: (recordId: string) => void
  // 削除中の記録の ID
  readonly deletingRecordId: string | null
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
    error: resultError ?? requestError,
  }
}
