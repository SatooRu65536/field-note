import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

import { DotLabel } from '@/components/ui/DotLabel'
import type { Category } from '@/integrations/field-note-api/categories'
import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordDetail } from '@/integrations/field-note-api/records'
import { formatDateTime } from '@/integrations/intl/formatDateTime'

import { PhotoGallery } from './PhotoGallery'

interface RecordDetailViewProps {
  readonly record: RecordDetail
  readonly category: Category | undefined
  // 発見場所の地図．地図はブラウザでのみ描画するため，呼び出し側から渡す
  readonly locationMap: ReactNode
}

const sectionTitleStyles = css({ fontWeight: 'bold', fontSize: 'md', mb: '2' })

export function RecordDetailView({ record, category, locationMap }: RecordDetailViewProps) {
  const name = formatRecordName(record.name)

  return (
    <article className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      <header className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
        <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>{name}</h1>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3', flexWrap: 'wrap' })}>
          {category && <DotLabel name={category.name} color={category.color} />}
          <time
            dateTime={record.discoveredAt.toISOString()}
            className={css({ fontSize: 'sm', color: 'muted' })}
          >
            {formatDateTime(record.discoveredAt)} に発見
          </time>
        </div>
      </header>

      <PhotoGallery photoIds={record.photoIds} alt={name} />

      {record.description !== '' && (
        <section>
          <h2 className={sectionTitleStyles}>説明</h2>
          <p className={css({ whiteSpace: 'pre-wrap', lineHeight: '1.8' })}>
            {record.description}
          </p>
        </section>
      )}

      {record.tags.length > 0 && (
        <section>
          <h2 className={sectionTitleStyles}>タグ</h2>
          <ul className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', listStyle: 'none' })}>
            {record.tags.map((tag) => (
              <li
                key={tag}
                className={css({
                  px: '2.5',
                  py: '1',
                  borderRadius: 'full',
                  bg: 'accent-muted',
                  color: 'accent',
                  fontSize: 'sm',
                })}
              >
                #{tag}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className={sectionTitleStyles}>発見場所</h2>
        {locationMap}
        <p className={css({ mt: '2', fontSize: 'xs', color: 'muted' })}>
          緯度 {record.latitude.toFixed(6)}，経度 {record.longitude.toFixed(6)}
        </p>
      </section>
    </article>
  )
}
