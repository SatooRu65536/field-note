import { useState } from 'react'
import { css } from 'styled-system/css'

import { INPUT_STYLES } from '@/components/ui/styles'
import type { Category } from '@/integrations/field-note-api/categories'
import type { RecordSummary } from '@/integrations/field-note-api/records'

import { filterRecordsByName } from '../recordSearch'
import type { SharedPhotoSelection } from '../sharedPhotoSelection'
import { SharedPhotoPreviewList } from './SharedPhotoPreviewList'
import { SharedPhotoRecordEmpty } from './SharedPhotoRecordEmpty'
import { SharedPhotoRecordRow } from './SharedPhotoRecordRow'
import { SharedPhotoSelectionNotice } from './SharedPhotoSelectionNotice'

interface SharedPhotoAdditionViewProps {
  readonly selection: SharedPhotoSelection
  readonly records: readonly RecordSummary[]
  readonly categories: readonly Category[]
  readonly addingRecordId: string | null
  readonly isAdding: boolean
  readonly addError: string | null
  readonly onAddRequested: (recordId: string) => void
}

const SEARCH_INPUT_ID = 'shared-photo-record-search'

export function SharedPhotoAdditionView({
  selection,
  records,
  categories,
  addingRecordId,
  isAdding,
  addError,
  onAddRequested,
}: SharedPhotoAdditionViewProps) {
  const [query, setQuery] = useState('')
  const filteredRecords = filterRecordsByName({ records, query })

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
      <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>写真を記録に追加</h1>

      <SharedPhotoPreviewList photos={selection.photos} />
      <SharedPhotoSelectionNotice selection={selection} />

      {addError && (
        <p
          role="alert"
          className={css({ p: '3', borderRadius: 'md', bg: 'danger-muted', color: 'danger' })}
        >
          {addError}
        </p>
      )}

      <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
        <label htmlFor={SEARCH_INPUT_ID} className={css({ fontWeight: 'bold', fontSize: 'sm' })}>
          追加する記録を名前で探す
        </label>
        <input
          id={SEARCH_INPUT_ID}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例：コナラ"
          className={INPUT_STYLES}
        />
      </div>

      <ul className={css({ display: 'flex', flexDirection: 'column', gap: '2', listStyle: 'none' })}>
        {filteredRecords.map((record) => (
          <SharedPhotoRecordRow
            key={record.id}
            record={record}
            category={categories.find(({ id }) => id === record.categoryId)}
            isAdding={record.id === addingRecordId}
            // 追加できる写真がない場合や，別の記録に追加している間は選べない
            isAddDisabled={isAdding || selection.photos.length === 0}
            onAddRequested={onAddRequested}
          />
        ))}
      </ul>
      {filteredRecords.length === 0 && <SharedPhotoRecordEmpty query={query} />}
    </div>
  )
}
