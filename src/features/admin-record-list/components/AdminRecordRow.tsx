import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

import { Button } from '@/components/ui/Button'
import { DotLabel } from '@/components/ui/DotLabel'
import { UncertainBadge } from '@/components/ui/UncertainBadge'
import { buttonRecipe } from '@/components/ui/styles'
import type { Category } from '@/integrations/field-note-api/categories'
import { formatDiscoveredAt } from '@/integrations/field-note-api/discoveredAt'
import { createPhotoUrl } from '@/integrations/field-note-api/photos'
import { formatRecordName } from '@/integrations/field-note-api/recordName'
import type { RecordSummary } from '@/integrations/field-note-api/records'

interface AdminRecordRowProps {
  readonly record: RecordSummary
  readonly category: Category | undefined
  readonly isDeleting: boolean
  readonly isDeleteDisabled: boolean
  readonly onDeleteRequested: (record: RecordSummary) => void
}

export function AdminRecordRow({
  record,
  category,
  isDeleting,
  isDeleteDisabled,
  onDeleteRequested,
}: AdminRecordRowProps) {
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
        flexWrap: { base: 'wrap', md: 'nowrap' },
      })}
    >
      <div
        className={css({
          w: '16',
          h: '16',
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
      <div className={css({ display: 'flex', gap: '2', flexShrink: 0 })}>
        <Link
          to="/records/$recordId"
          params={{ recordId: record.id }}
          className={buttonRecipe({ variant: 'secondary', size: 'sm' })}
        >
          表示
        </Link>
        <Link
          to="/admin/records/$recordId/edit"
          params={{ recordId: record.id }}
          className={buttonRecipe({ variant: 'secondary', size: 'sm' })}
        >
          編集
        </Link>
        <Button
          variant="danger"
          size="sm"
          disabled={isDeleteDisabled}
          onClick={() => onDeleteRequested(record)}
        >
          {isDeleting ? '削除中…' : '削除'}
        </Button>
      </div>
    </li>
  )
}
