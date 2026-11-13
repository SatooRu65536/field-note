import { css } from 'styled-system/css'

interface SharedPhotoRecordEmptyProps {
  readonly query: string
}

export function SharedPhotoRecordEmpty({ query }: SharedPhotoRecordEmptyProps) {
  const trimmedQuery = query.trim()
  return (
    <p className={css({ color: 'muted' })}>
      {trimmedQuery === ''
        ? 'まだ記録がありません'
        : `名前に「${trimmedQuery}」を含む記録はありません`}
    </p>
  )
}
