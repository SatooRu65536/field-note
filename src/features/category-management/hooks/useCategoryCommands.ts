import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createAdminCategory,
  reorderAdminCategories,
  updateAdminCategory,
} from '@/integrations/field-note-api/adminCategories'
import type { CategoryCommandResult } from '@/integrations/field-note-api/adminCategories'
import { QUERY_KEYS } from '@/integrations/field-note-api/queryKeys'

type CategoryCommand =
  | { readonly type: 'create'; readonly name: string; readonly color: string }
  | {
      readonly type: 'update'
      readonly categoryId: string
      readonly name: string
      readonly color: string
    }
  | { readonly type: 'reorder'; readonly categoryIds: readonly string[] }

interface CategoryCommands {
  readonly run: (command: CategoryCommand) => void
  readonly isRunning: boolean
  readonly error: string | null
}

/**
 * カテゴリの追加・変更・並び替えを行い，成功したらカテゴリの一覧を再取得する
 * @returns 実行する関数と，実行中・エラーの状態
 */
export function useCategoryCommands(): CategoryCommands {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (command: CategoryCommand): Promise<CategoryCommandResult> => {
      switch (command.type) {
        case 'create':
          return createAdminCategory({ data: { name: command.name, color: command.color } })
        case 'update':
          return updateAdminCategory({
            data: { categoryId: command.categoryId, name: command.name, color: command.color },
          })
        case 'reorder':
          return reorderAdminCategories({ data: { categoryIds: [...command.categoryIds] } })
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories }),
  })

  const resultError = mutation.data && !mutation.data.ok ? mutation.data.error : null
  const requestError = mutation.error ? '保存に失敗しました．入力内容を確認してください' : null

  return { run: mutation.mutate, isRunning: mutation.isPending, error: resultError ?? requestError }
}
