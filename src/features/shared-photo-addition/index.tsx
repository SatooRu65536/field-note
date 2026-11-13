import { useSuspenseQuery } from '@tanstack/react-query'

import { adminRecordsQueryOptions } from '@/integrations/field-note-api/adminRecords'
import { categoriesQueryOptions } from '@/integrations/field-note-api/categories'
import { sharedPhotosQueryOptions } from '@/integrations/pwa/sharedPhotos'

import { SharedPhotoEmpty } from './components/SharedPhotoEmpty'
import { SharedPhotoAdditionView } from './components/SharedPhotoAdditionView'
import { useAddSharedPhotos } from './hooks/useAddSharedPhotos'
import { selectSharedPhotos } from './sharedPhotoSelection'

export function SharedPhotoAddition() {
  const { data: sharedPhotos } = useSuspenseQuery(sharedPhotosQueryOptions())
  const { data: records } = useSuspenseQuery(adminRecordsQueryOptions())
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions())
  const { addPhotos, addingRecordId, isAdding, error } = useAddSharedPhotos()

  if (sharedPhotos.length === 0) return <SharedPhotoEmpty />

  const selection = selectSharedPhotos(sharedPhotos)
  return (
    <SharedPhotoAdditionView
      selection={selection}
      records={records}
      categories={categories}
      addingRecordId={addingRecordId}
      isAdding={isAdding}
      addError={error}
      onAddRequested={(recordId) => addPhotos({ recordId, photos: selection.photos })}
    />
  )
}
