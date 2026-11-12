import { css } from 'styled-system/css'

import { INPUT_STYLES } from '@/components/ui/styles'
import { MAX_NAME_MEMO_LENGTH } from '@/integrations/field-note-api/recordFormData'

interface NameMemoFieldProps {
  readonly id: string
  readonly name: string
  readonly memo: string
  readonly onMemoChanged: (memo: string) => void
}

export function NameMemoField({ id, name, memo, onMemoChanged }: NameMemoFieldProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
      <label htmlFor={id} className={css({ fontWeight: 'bold', fontSize: 'sm' })}>
        「{name}」のメモ
      </label>
      <textarea
        id={id}
        value={memo}
        rows={3}
        maxLength={MAX_NAME_MEMO_LENGTH}
        placeholder="特徴や見分け方など"
        onChange={(event) => onMemoChanged(event.target.value)}
        className={INPUT_STYLES}
      />
      <p className={css({ fontSize: 'xs', color: 'muted' })}>
        同じ名前の記録すべてで共有されます（ひらがな・カタカナの違いは区別しません）
      </p>
    </div>
  )
}
