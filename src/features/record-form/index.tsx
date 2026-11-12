import { useSuspenseQuery } from '@tanstack/react-query'

import {
  adminRecordQueryOptions,
  nameCandidatesQueryOptions,
  tagCandidatesQueryOptions,
} from '@/integrations/field-note-api/adminRecords'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'

import { RecordFormNotFound } from './components/RecordFormNotFound'
import { RecordFormView } from './components/RecordFormView'
import { useRecordFormSubmission } from './hooks/useRecordFormSubmission'
import { createEditRecordFormValues, createNewRecordFormValues } from './initialValues'

export function NewRecordForm() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  const { data: nameCandidates } = useSuspenseQuery(nameCandidatesQueryOptions())
  const { data: tagCandidates } = useSuspenseQuery(tagCandidatesQueryOptions())
  const { submit, isSaving, error } = useRecordFormSubmission(undefined)

  return (
    <RecordFormView
      title="記録を追加"
      initialValues={createNewRecordFormValues(new Date())}
      categories={categories}
      nameCandidates={nameCandidates.names}
      nameMemos={nameCandidates.memos}
      tagCandidates={tagCandidates}
      isSaving={isSaving}
      error={error}
      onSubmitted={submit}
    />
  )
}

interface EditRecordFormProps {
  readonly recordId: string
}

export function EditRecordForm({ recordId }: EditRecordFormProps) {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  const { data: nameCandidates } = useSuspenseQuery(nameCandidatesQueryOptions())
  const { data: tagCandidates } = useSuspenseQuery(tagCandidatesQueryOptions())
  const { data: record } = useSuspenseQuery(adminRecordQueryOptions(recordId))
  const { submit, isSaving, error } = useRecordFormSubmission(recordId)
  if (!record) return <RecordFormNotFound />

  return (
    <RecordFormView
      title="記録を編集"
      initialValues={createEditRecordFormValues(record)}
      categories={categories}
      nameCandidates={nameCandidates.names}
      nameMemos={nameCandidates.memos}
      tagCandidates={tagCandidates}
      isSaving={isSaving}
      error={error}
      onSubmitted={submit}
    />
  )
}
