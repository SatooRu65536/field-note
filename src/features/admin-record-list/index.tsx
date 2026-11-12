import { useSuspenseQuery } from '@tanstack/react-query'

import { adminRecordsQueryOptions } from '@/integrations/field-note-api/adminRecords'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'

import { countRecordsByCategory } from './categoryCounts'
import { AdminRecordListView } from './components/AdminRecordListView'
import { useDeleteRecord } from './hooks/useDeleteRecord'

export function AdminRecordList() {
  const { data: records } = useSuspenseQuery(adminRecordsQueryOptions())
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  const { deleteRecord, deletingRecordId, error } = useDeleteRecord()

  return (
    <AdminRecordListView
      records={records}
      categories={categories}
      categoryCounts={countRecordsByCategory({ categories, records })}
      deletingRecordId={deletingRecordId}
      deleteError={error}
      onDeleteConfirmed={deleteRecord}
    />
  )
}
