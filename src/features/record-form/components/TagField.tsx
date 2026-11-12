import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { css, cx } from 'styled-system/css'

import { INPUT_STYLES } from '@/components/ui/styles'
import {
  MAX_TAG_COUNT,
  normalizeTags,
} from '@/integrations/field-note-api/tags'

interface TagFieldProps {
  readonly id: string
  readonly tags: readonly string[]
  // 過去の記録に付けたタグ．使われた回数の多い順
  readonly candidates: readonly string[]
  readonly onTagsChanged: (tags: readonly string[]) => void
}

const CHIP_STYLES = css({
  display: 'inline-flex',
  alignItems: 'center',
  h: '8',
  px: '3',
  borderRadius: 'full',
  borderWidth: '1px',
  borderColor: 'border',
  bg: 'white',
  fontSize: 'sm',
  cursor: 'pointer',
  _disabled: { opacity: 0.4, cursor: 'not-allowed' },
})

const SELECTED_CHIP_STYLES = css({ bg: 'accent', borderColor: 'accent', color: 'on-accent' })

export function TagField({ id, tags, candidates, onTagsChanged }: TagFieldProps) {
  const [draft, setDraft] = useState('')
  const isFull = tags.length >= MAX_TAG_COUNT
  // 新しく追加したタグも，過去のタグと同じ並びで選択を切り替えられるようにする
  const options = [...new Set([...candidates, ...tags])]

  function handleToggle(tag: string): void {
    onTagsChanged(tags.includes(tag) ? tags.filter((current) => current !== tag) : [...tags, tag])
  }

  function addDraftTags(): void {
    const nextTags = normalizeTags([...tags, ...draft.split(/[,，、\s]+/)])
    onTagsChanged(nextTags.slice(0, MAX_TAG_COUNT))
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // 日本語入力の変換確定の Enter ではタグを追加しない．Safari は確定時に isComposing が false のため keyCode でも判定する
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key !== 'Enter' && event.key !== ',') return
    event.preventDefault()
    addDraftTags()
  }

  function handleBlur(): void {
    addDraftTags()
  }

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
      {options.length > 0 && (
        <ul
          aria-label="タグを選択"
          className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', listStyle: 'none' })}
        >
          {options.map((tag) => {
            const isSelected = tags.includes(tag)
            return (
              <li key={tag}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={!isSelected && isFull}
                  onClick={() => handleToggle(tag)}
                  className={cx(CHIP_STYLES, isSelected && SELECTED_CHIP_STYLES)}
                >
                  #{tag}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <input
        id={id}
        type="text"
        aria-label="新しいタグ"
        value={draft}
        placeholder={isFull ? `タグは ${MAX_TAG_COUNT} 個までです` : '新しいタグを入力して Enter で追加'}
        disabled={isFull}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={INPUT_STYLES}
      />
    </div>
  )
}
