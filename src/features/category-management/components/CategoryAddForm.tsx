import { useState } from 'react'
import type { FormEvent } from 'react'
import { css } from 'styled-system/css'

import { Button } from '@/components/ui/Button'
import { INPUT_STYLES } from '@/components/ui/styles'
import { MAX_CATEGORY_NAME_LENGTH } from '@/integrations/field-note-api/adminCategories'

interface CategoryAddFormProps {
  readonly isRunning: boolean
  readonly onCategoryAdded: (category: { name: string; color: string }) => void
}

const DEFAULT_COLOR = '#2f7d4f'

export function CategoryAddForm({ isRunning, onCategoryAdded }: CategoryAddFormProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (name.trim() === '') return
    onCategoryAdded({ name: name.trim(), color })
    setName('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="カテゴリを追加"
      className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
    >
      <input
        type="color"
        aria-label="追加するカテゴリの色"
        value={color}
        onChange={(event) => setColor(event.target.value)}
        className={css({ w: '10', h: '10', flexShrink: 0, cursor: 'pointer' })}
      />
      <input
        type="text"
        aria-label="追加するカテゴリの名前"
        placeholder="新しいカテゴリの名前"
        value={name}
        maxLength={MAX_CATEGORY_NAME_LENGTH}
        onChange={(event) => setName(event.target.value)}
        className={INPUT_STYLES}
      />
      <Button type="submit" disabled={isRunning || name.trim() === ''}>
        追加
      </Button>
    </form>
  )
}
