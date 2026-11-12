import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { css } from 'styled-system/css'

import { INPUT_STYLES } from '@/components/ui/styles'
import {
  MAX_TAG_COUNT,
  MAX_TAG_LENGTH,
  normalizeTags,
} from '@/integrations/field-note-api/tags'

interface TagFieldProps {
  readonly id: string
  readonly tags: readonly string[]
  readonly onTagsChanged: (tags: readonly string[]) => void
}

export function TagField({ id, tags, onTagsChanged }: TagFieldProps) {
  const [draft, setDraft] = useState('')

  const isFull = tags.length >= MAX_TAG_COUNT

  function addDraftTags(): void {
    const nextTags = normalizeTags([...tags, ...draft.split(/[,，、\s]+/)])
    onTagsChanged(nextTags.slice(0, MAX_TAG_COUNT))
    setDraft('')
  }

  function handleBlur(): void {
    addDraftTags()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // 日本語入力の変換確定の Enter ではタグを追加しない
    if (event.nativeEvent.isComposing) return
    if (event.key !== 'Enter' && event.key !== ',') return
    event.preventDefault()
    addDraftTags()
  }

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
      {tags.length > 0 && (
        <ul className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', listStyle: 'none' })}>
          {tags.map((tag) => (
            <li
              key={tag}
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1',
                pl: '2.5',
                pr: '1',
                py: '0.5',
                borderRadius: 'full',
                bg: 'accent-muted',
                color: 'accent',
                fontSize: 'sm',
              })}
            >
              #{tag}
              <button
                type="button"
                aria-label={`タグ「${tag}」を削除`}
                onClick={() => onTagsChanged(tags.filter((current) => current !== tag))}
                className={css({ px: '1', cursor: 'pointer' })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="text"
        value={draft}
        maxLength={MAX_TAG_LENGTH}
        placeholder={isFull ? `タグは ${MAX_TAG_COUNT} 個までです` : '入力して Enter で追加'}
        disabled={isFull}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={INPUT_STYLES}
      />
    </div>
  )
}
