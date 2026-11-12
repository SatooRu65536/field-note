import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

import { DotLabel } from '@/components/ui/DotLabel'
import { buttonRecipe } from '@/components/ui/styles'
import type { Category } from '@/integrations/field-note-api/categories'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'
import { formatRecordName } from '@/integrations/field-note-api/records'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import { formatDateTime } from '@/integrations/intl/formatDateTime'

interface RecordPreviewCardProps {
  readonly record: RecordSummary
  readonly category: Category | undefined
  readonly onClosed: () => void
}

export function RecordPreviewCard({ record, category, onClosed }: RecordPreviewCardProps) {
  return (
    <section
      aria-label="選択した記録"
      className={css({
        position: 'absolute',
        left: '4',
        right: '4',
        bottom: '8',
        zIndex: 1,
        maxW: '420px',
        mx: 'auto',
        display: 'flex',
        gap: '3',
        p: '3',
        bg: 'white',
        borderRadius: 'xl',
        boxShadow: 'floating',
      })}
    >
      {record.thumbnailPhotoId && (
        <img
          src={createPhotoUrl(record.thumbnailPhotoId)}
          alt=""
          className={css({
            w: '24',
            h: '24',
            flexShrink: 0,
            objectFit: 'cover',
            borderRadius: 'md',
            bg: 'primary-muted',
          })}
        />
      )}
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5', minW: '0', flex: '1' })}>
        <div className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
          <h2 className={css({ fontWeight: 'bold', fontSize: 'lg', flex: '1', truncate: true })}>
            {formatRecordName(record.name)}
          </h2>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClosed}
            className={css({ color: 'muted', cursor: 'pointer', px: '1', fontSize: 'lg', lineHeight: '1' })}
          >
            ×
          </button>
        </div>
        {category && <DotLabel name={category.name} color={category.color} />}
        <p className={css({ fontSize: 'sm', color: 'muted' })}>
          {formatDateTime(record.discoveredAt)}
        </p>
        <Link
          to="/records/$recordId"
          params={{ recordId: record.id }}
          className={buttonRecipe({ size: 'sm' })}
        >
          詳細を見る
        </Link>
      </div>
    </section>
  )
}
