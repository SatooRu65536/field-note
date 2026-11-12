import { css } from 'styled-system/css'

import { formatDiscoveredAt } from '@/integrations/field-note-api/discoveredAt'

interface DiscoveredDateProps {
  readonly discoveredAt: Date
}

export function DiscoveredDate({ discoveredAt }: DiscoveredDateProps) {
  return (
    <time dateTime={discoveredAt.toISOString()} className={css({ fontSize: 'sm', color: 'muted' })}>
      {formatDiscoveredAt(discoveredAt)} に発見
    </time>
  )
}
