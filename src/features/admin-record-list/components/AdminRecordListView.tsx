import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

import { buttonRecipe } from '@/components/ui/styles'
import type { Category } from '@/integrations/field-note-api/categories'
import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordSummary } from '@/integrations/field-note-api/records'

import type { CategoryCount } from '../categoryCounts'
import { AdminRecordEmpty } from './AdminRecordEmpty'
import { AdminRecordItems } from './AdminRecordItems'
import { CategoryCountList } from './CategoryCountList'

interface AdminRecordListViewProps {
  readonly records: readonly RecordSummary[]
  readonly categories: readonly Category[]
  readonly categoryCounts: readonly CategoryCount[]
  readonly deletingRecordId: string | null
  readonly isDeleting: boolean
  readonly deleteError: string | null
  readonly onDeleteConfirmed: (recordId: string) => void
}

export function AdminRecordListView({
  records,
  categories,
  categoryCounts,
  deletingRecordId,
  isDeleting,
  deleteError,
  onDeleteConfirmed,
}: AdminRecordListViewProps) {
  function handleDeleteRequest(record: RecordSummary): void {
    const name = formatRecordName(record.name)
    if (!window.confirm(`「${name}」の記録を削除しますか？写真も削除され，元に戻せません．`)) {
      return
    }
    onDeleteConfirmed(record.id)
  }

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4' })}>
        <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>記録一覧</h1>
        <Link to="/admin/records/new" className={buttonRecipe()}>
          記録を追加
        </Link>
      </div>

      <CategoryCountList totalCount={records.length} categoryCounts={categoryCounts} />

      {deleteError && (
        <p
          role="alert"
          className={css({ p: '3', borderRadius: 'md', bg: 'danger-muted', color: 'danger' })}
        >
          {deleteError}
        </p>
      )}

      {records.length === 0 ? (
        <AdminRecordEmpty />
      ) : (
        <AdminRecordItems
          records={records}
          categories={categories}
          deletingRecordId={deletingRecordId}
          isDeleting={isDeleting}
          onDeleteRequested={handleDeleteRequest}
        />
      )}
    </div>
  )
}
