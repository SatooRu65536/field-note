import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import {
  createAdminRecord,
  updateAdminRecord,
} from '@/integrations/field-note-api/adminRecords'
import type { RecordCommandResult } from '@/integrations/field-note-api/adminRecords'
import { QUERY_KEYS } from '@/integrations/field-note-api/queryKeys'
import { createRecordFormData } from '@/integrations/field-note-api/recordFormData'
import type { RecordPayload } from '@/integrations/field-note-api/recordFormData'

interface SaveRecord {
  readonly save: (payload: RecordPayload) => void
  readonly isSaving: boolean
  // サーバーで検証に失敗した場合などのエラーメッセージ
  readonly error: string | null
}

/**
 * 記録を登録・更新し，成功したら追加後は地図に，編集後は記録の一覧に移動する
 * @returns 保存処理と，保存中・エラーの状態
 */
export function useSaveRecord(): SaveRecord {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (payload: RecordPayload): Promise<RecordCommandResult> => {
      const data = createRecordFormData(payload)
      return payload.recordId ? updateAdminRecord({ data }) : createAdminRecord({ data })
    },
    onSuccess: async (result, payload) => {
      if (!result.ok) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminRecords }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicRecords }),
      ])
      // 追加した記録を地図で確かめられるよう，追加後は地図に，編集後は記録の一覧に戻る
      await navigate({ to: payload.recordId ? '/admin/records' : '/' })
    },
  })

  const resultError = mutation.data && !mutation.data.ok ? mutation.data.error : null
  const requestError = mutation.error ? '保存に失敗しました．時間をおいて再度お試しください' : null

  return {
    save: mutation.mutate,
    isSaving: mutation.isPending,
    error: resultError ?? requestError,
  }
}
