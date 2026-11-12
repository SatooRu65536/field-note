import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { css } from 'styled-system/css'

import { Button } from '@/components/ui/Button'
import { FieldGroup } from '@/components/ui/FieldGroup'
import { FormField } from '@/components/ui/FormField'
import { buttonRecipe, INPUT_STYLES } from '@/components/ui/styles'
import { SuggestionInput } from '@/components/ui/SuggestionInput'
import type { NameCandidate, NameMemo } from '@/integrations/field-note-api/adminRecords'
import { normalizeKana } from '@/integrations/intl/normalizeKana'
import type { Category } from '@/integrations/field-note-api/categories'
import {
  MAX_MEMO_LENGTH,
  MAX_NAME_LENGTH,
} from '@/integrations/field-note-api/recordFormData'

import {
  filterNameSuggestions,
  findSavedNameMemo,
  inferCategoryId,
  inferTags,
} from '../candidates'
import type { RecordFormValues } from '../types'
import { LocationField } from './LocationField'
import { NameMemoField } from './NameMemoField'
import { PhotoField } from './PhotoField'
import { TagField } from './TagField'

interface RecordFormViewProps {
  readonly title: string
  readonly initialValues: RecordFormValues
  readonly categories: readonly Category[]
  readonly nameCandidates: readonly NameCandidate[]
  readonly nameMemos: readonly NameMemo[]
  readonly tagCandidates: readonly string[]
  readonly isSaving: boolean
  readonly error: string | null
  readonly onSubmitted: (values: RecordFormValues) => void
}

export function RecordFormView({
  title,
  initialValues,
  categories,
  nameCandidates,
  nameMemos,
  tagCandidates,
  isSaving,
  error,
  onSubmitted,
}: RecordFormViewProps) {
  const [values, setValues] = useState(initialValues)
  // 利用者が選んだカテゴリは，名前からの推定で上書きしない．編集時の登録済みのカテゴリも利用者が選んだものとみなす
  const [isCategorySelectedByUser, setIsCategorySelectedByUser] = useState(
    initialValues.categoryId !== '',
  )
  const isCategoryInferred = !isCategorySelectedByUser && values.categoryId !== ''
  // カテゴリと同じく，利用者が選んだタグは名前からの推定で上書きしない
  const [isTagsSelectedByUser, setIsTagsSelectedByUser] = useState(initialValues.tags.length > 0)
  const isTagsInferred = !isTagsSelectedByUser && values.tags.length > 0

  function updateValues(changes: Partial<RecordFormValues>): void {
    setValues((current) => ({ ...current, ...changes }))
  }

  function handleNameChange(name: string): void {
    // 別の名前になると共有するメモも変わるため，編集中の名前ごとのメモを破棄して保存済みのメモを表示する
    const isSameName = normalizeKana(name) === normalizeKana(values.name)
    updateValues({
      name,
      ...(isSameName ? {} : { nameMemo: null }),
      ...(isCategorySelectedByUser
        ? {}
        : { categoryId: inferCategoryId({ candidates: nameCandidates, name }) ?? '' }),
      ...(isTagsSelectedByUser ? {} : { tags: inferTags({ candidates: nameCandidates, name }) ?? [] }),
    })
  }

  function handleTagsChange(tags: readonly string[]): void {
    setIsTagsSelectedByUser(true)
    updateValues({ tags })
  }

  function handleCategoryChange(categoryId: string): void {
    setIsCategorySelectedByUser(categoryId !== '')
    updateValues({ categoryId })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSubmitted(values)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}
    >
      <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>{title}</h1>

      <FormField label="写真" htmlFor="record-photos">
        <PhotoField
          id="record-photos"
          existingPhotoIds={values.existingPhotoIds}
          removedPhotoIds={values.removedPhotoIds}
          newPhotos={values.newPhotos}
          onRemovedPhotoIdsChanged={(removedPhotoIds) => updateValues({ removedPhotoIds })}
          onNewPhotosChanged={(newPhotos) => updateValues({ newPhotos })}
        />
      </FormField>

      <FormField label="名前" htmlFor="record-name">
        <SuggestionInput
          id="record-name"
          value={values.name}
          suggestions={filterNameSuggestions({ candidates: nameCandidates, input: values.name })}
          maxLength={MAX_NAME_LENGTH}
          disabled={values.isNameUnknown}
          onValueChanged={handleNameChange}
        />
        <label className={css({ display: 'flex', alignItems: 'center', gap: '2', fontSize: 'sm' })}>
          <input
            type="checkbox"
            checked={values.isNameUnknown}
            onChange={(event) => updateValues({ isNameUnknown: event.target.checked })}
          />
          名前が分からない
        </label>
      </FormField>

      {!values.isNameUnknown && values.name.trim() !== '' && (
        <NameMemoField
          id="record-name-memo"
          name={values.name.trim()}
          memo={values.nameMemo ?? findSavedNameMemo({ memos: nameMemos, name: values.name })}
          onMemoChanged={(nameMemo) => updateValues({ nameMemo })}
        />
      )}

      <FormField
        label="カテゴリ"
        htmlFor="record-category"
        hint={isCategoryInferred ? '過去の同じ名前の記録から推定しました' : undefined}
      >
        <select
          id="record-category"
          aria-describedby={isCategoryInferred ? 'record-category-hint' : undefined}
          value={values.categoryId}
          onChange={(event) => handleCategoryChange(event.target.value)}
          className={INPUT_STYLES}
        >
          <option value="">選択してください</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="発見日時" htmlFor="record-discovered-at">
        <input
          id="record-discovered-at"
          type="datetime-local"
          value={values.discoveredAt}
          onChange={(event) => updateValues({ discoveredAt: event.target.value })}
          className={INPUT_STYLES}
        />
      </FormField>

      <FieldGroup legend="発見場所">
        <LocationField
          location={values.location}
          onLocationChanged={(location) => updateValues({ location })}
        />
      </FieldGroup>

      <FormField label="メモ" htmlFor="record-memo">
        <textarea
          id="record-memo"
          value={values.memo}
          rows={5}
          maxLength={MAX_MEMO_LENGTH}
          onChange={(event) => updateValues({ memo: event.target.value })}
          className={INPUT_STYLES}
        />
      </FormField>

      <FieldGroup legend="タグ">
        <TagField
          id="record-tags"
          tags={values.tags}
          candidates={tagCandidates}
          onTagsChanged={handleTagsChange}
        />
        {isTagsInferred && (
          <p className={css({ fontSize: 'xs', color: 'muted' })}>
            過去の同じ名前の記録から推定しました
          </p>
        )}
      </FieldGroup>

      {error && (
        <p
          role="alert"
          className={css({ p: '3', borderRadius: 'md', bg: 'danger-muted', color: 'danger' })}
        >
          {error}
        </p>
      )}

      <div className={css({ display: 'flex', gap: '3' })}>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? '保存中…' : '保存する'}
        </Button>
        <Link to="/admin/records" className={buttonRecipe({ variant: 'secondary' })}>
          キャンセル
        </Link>
      </div>
    </form>
  )
}
