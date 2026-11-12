import { useState } from 'react'

import type { RecordFormValues } from '../types'
import { validateRecordFormValues } from '../validation'
import { useSaveRecord } from './useSaveRecord'

interface RecordFormSubmission {
  readonly submit: (values: RecordFormValues) => void
  readonly isSaving: boolean
  readonly error: string | null
}

/**
 * フォームの入力内容を検証して保存する
 * @param recordId 編集する記録の ID．新規登録の場合は undefined
 * @returns 送信処理と，保存中・エラーの状態
 */
export function useRecordFormSubmission(recordId: string | undefined): RecordFormSubmission {
  const { save, isSaving, error: saveError } = useSaveRecord()
  const [validationError, setValidationError] = useState<string | null>(null)

  function submit(values: RecordFormValues): void {
    const result = validateRecordFormValues({ values, recordId })
    if (!result.ok) {
      setValidationError(result.error)
      return
    }
    setValidationError(null)
    save(result.value)
  }

  return { submit, isSaving, error: validationError ?? saveError }
}
