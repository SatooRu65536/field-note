import { css } from 'styled-system/css'

import { Button } from '@/components/ui/Button'
import { DotLabel } from '@/components/ui/DotLabel'
import { UncertainBadge } from '@/components/ui/UncertainBadge'
import type { Category } from '@/integrations/field-note-api/categories'
import { formatDiscoveredAt } from '@/integrations/field-note-api/discoveredAt'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'
import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordSummary } from '@/integrations/field-note-api/records'

interface SharedPhotoRecordRowProps {
  readonly record: RecordSummary
  readonly category: Category | undefined
  readonly isAdding: boolean
  readonly isAddDisabled: boolean
  readonly onAddRequested: (recordId: string) => void
}

export function SharedPhotoRecordRow({
  record,
  category,
  isAdding,
  isAddDisabled,
  onAddRequested,
}: SharedPhotoRecordRowProps) {
  return (
    <li
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        p: '3',
        bg: 'white',
        borderRadius: 'lg',
        borderWidth: '1px',
        borderColor: 'border',
      })}
    >
      <div
        className={css({
          w: '14',
          h: '14',
          flexShrink: 0,
          borderRadius: 'md',
          overflow: 'hidden',
          bg: 'primary-muted',
        })}
      >
        {record.thumbnailPhotoId && (
          <img
            src={createPhotoUrl(record.thumbnailPhotoId)}
            alt=""
            loading="lazy"
            className={css({ w: '100%', h: '100%', objectFit: 'cover' })}
          />
        )}
      </div>
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '1', flex: '1', minW: '0' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <span className={css({ fontWeight: 'bold', truncate: true })}>
            {formatRecordName(record.name)}
          </span>
          {record.discoveredAt === null && <UncertainBadge label="未発見" />}
        </div>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap' })}>
          {category && <DotLabel name={category.name} color={category.color} />}
          <span className={css({ fontSize: 'xs', color: 'muted' })}>
            {formatDiscoveredAt(record.discoveredAt)}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        disabled={isAddDisabled}
        onClick={() => onAddRequested(record.id)}
        className={css({ flexShrink: 0 })}
      >
        {isAdding ? '追加中…' : '追加'}
      </Button>
    </li>
  )
}
