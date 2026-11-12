import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
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
import { getLastName, replaceLastName, splitRecordNames } from '../recordNames'
import { useSaveShortcut } from '../hooks/useSaveShortcut'
import type { RecordFormValues } from '../types'
import { LocationField } from './LocationField'
import { NameMemoField } from './NameMemoField'
import { PhotoField } from './PhotoField'
import { TagField } from './TagField'

interface RecordFormViewProps {
  readonly title: string
  // 新規登録では，区切り文字で区切った名前ごとに記録をまとめて登録できる
  readonly canRegisterMultiple: boolean
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
  canRegisterMultiple,
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
  const formRef = useRef<HTMLFormElement>(null)
  useSaveShortcut({ formRef, isEnabled: !isSaving })
  const names = canRegisterMultiple ? splitRecordNames(values.name) : [values.name.trim()]
  const isMultiple = !values.isNameUnknown && names.length > 1
  // 候補の絞り込みには，まとめて登録する場合も入力中の最後の名前を使う
  const nameInput = canRegisterMultiple ? getLastName(values.name) : values.name
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
    // カテゴリ・タグの推定と名前ごとのメモには，まとめて登録する場合も最初の名前を使う
    const firstName = (canRegisterMultiple ? splitRecordNames(name)[0] : name) ?? ''
    const currentFirstName = names[0] ?? ''
    // 別の名前になると共有するメモも変わるため，編集中の名前ごとのメモを破棄して保存済みのメモを表示する
    const isSameName = normalizeKana(firstName) === normalizeKana(currentFirstName)
    updateValues({
      name,
      ...(isSameName ? {} : { nameMemo: null }),
      ...(isCategorySelectedByUser
        ? {}
        : { categoryId: inferCategoryId({ candidates: nameCandidates, name: firstName }) ?? '' }),
      ...(isTagsSelectedByUser ? {} : { tags: inferTags({ candidates: nameCandidates, name: firstName }) ?? [] }),
    })
  }

  function handleTagsChange(tags: readonly string[]): void {
    setIsTagsSelectedByUser(true)
    updateValues({ tags })
  }

  function handleNameSuggestionSelect(suggestion: string): void {
    handleNameChange(
      canRegisterMultiple ? replaceLastName({ input: values.name, name: suggestion }) : suggestion,
    )
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
      ref={formRef}
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

      <FormField
        label="名前"
        htmlFor="record-name"
        hint={createNameHint({ canRegisterMultiple, isMultiple, names })}
      >
        <SuggestionInput
          id="record-name"
          value={values.name}
          suggestions={filterNameSuggestions({ candidates: nameCandidates, input: nameInput })}
          maxLength={MAX_NAME_LENGTH}
          disabled={values.isNameUnknown}
          onValueChanged={handleNameChange}
          onSuggestionSelected={handleNameSuggestionSelect}
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

      {!values.isNameUnknown && !isMultiple && values.name.trim() !== '' && (
        <NameMemoField
          id="record-name-memo"
          name={names[0] ?? ''}
          memo={values.nameMemo ?? findSavedNameMemo({ memos: nameMemos, name: names[0] ?? '' })}
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
          {createSubmitLabel({ isSaving, recordCount: isMultiple ? names.length : 1 })}
        </Button>
        <Link to="/admin/records" className={buttonRecipe({ variant: 'secondary' })}>
          キャンセル
        </Link>
      </div>
    </form>
  )
}

/**
 * 名前の入力欄の補足を作成する
 * @param canRegisterMultiple まとめて登録できる場合は true
 * @param isMultiple 複数の名前が入力されている場合は true
 * @param names 入力された名前
 * @returns 補足．まとめて登録できない場合は undefined
 */
function createNameHint({
  canRegisterMultiple,
  isMultiple,
  names,
}: {
  canRegisterMultiple: boolean
  isMultiple: boolean
  names: readonly string[]
}): string | undefined {
  if (!canRegisterMultiple) return undefined
  if (isMultiple) return `${names.length} 件の記録をまとめて登録します（${names.join('・')}）`
  return '「，」で区切ると，名前だけが異なる記録をまとめて登録できます'
}

/**
 * 保存ボタンの文言を作成する
 * @param isSaving 保存中の場合は true
 * @param recordCount 保存する記録の件数
 * @returns 保存ボタンの文言
 */
function createSubmitLabel({
  isSaving,
  recordCount,
}: {
  isSaving: boolean
  recordCount: number
}): string {
  if (isSaving) return '保存中…'
  if (recordCount > 1) return `${recordCount} 件の記録を保存する`
  return '保存する'
}
