import { css } from 'styled-system/css'

import type { Category } from '@/integrations/field-note-api/categories'
import type { RecordSummary } from '@/integrations/field-note-api/records'

import { AdminRecordRow } from './AdminRecordRow'

interface AdminRecordItemsProps {
  readonly records: readonly RecordSummary[]
  readonly categories: readonly Category[]
  readonly deletingRecordId: string | null
  readonly isDeleting: boolean
  readonly onDeleteRequested: (record: RecordSummary) => void
}

export function AdminRecordItems({
  records,
  categories,
  deletingRecordId,
  isDeleting,
  onDeleteRequested,
}: AdminRecordItemsProps) {
  return (
    <ul className={css({ display: 'flex', flexDirection: 'column', gap: '2', listStyle: 'none' })}>
      {records.map((record) => (
        <AdminRecordRow
          key={record.id}
          record={record}
          category={categories.find(({ id }) => id === record.categoryId)}
          isDeleting={record.id === deletingRecordId}
          isDeleteDisabled={isDeleting}
          onDeleteRequested={onDeleteRequested}
        />
      ))}
    </ul>
  )
}
