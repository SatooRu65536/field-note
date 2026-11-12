import { useState } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import { IconButton } from '@/components/ui/IconButton'
import { ShareIcon } from '@/components/ui/ShareIcon'

import { RECORD_MAP_ID } from '../constants'
import { createMapShareUrl } from '../mapUrl'

interface ShareMapButtonProps {
  readonly selectedRecordId: string | null
}

// コピーした旨の表示を消すまでの時間
const NOTICE_DURATION_MS = 2000

export function ShareMapButton({ selectedRecordId }: ShareMapButtonProps) {
  const { [RECORD_MAP_ID]: map } = useMap()
  const [notice, setNotice] = useState<string | null>(null)

  function showNotice(message: string): void {
    setNotice(message)
    setTimeout(() => setNotice(null), NOTICE_DURATION_MS)
  }

  async function handleShare(): Promise<void> {
    if (!map) return
    const center = map.getCenter()
    const url = createMapShareUrl({
      origin: window.location.origin,
      view: { latitude: center.lat, longitude: center.lng, zoom: map.getZoom() },
      recordId: selectedRecordId,
    })
    try {
      await navigator.clipboard.writeText(url)
      showNotice('この場所のリンクをコピーしました')
    } catch (error) {
      console.warn('リンクをコピーできませんでした', error)
      showNotice('リンクをコピーできませんでした')
    }
  }

  return (
    <div className={css({ position: 'relative' })}>
      <IconButton icon={<ShareIcon />} aria-label="この場所のリンクをコピー" onClick={handleShare} />
      {notice && (
        <p
          role="status"
          className={css({
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            mr: '2',
            px: '3',
            py: '1.5',
            borderRadius: 'full',
            bg: 'primary',
            color: 'on-primary',
            fontSize: 'xs',
            whiteSpace: 'nowrap',
            boxShadow: 'floating',
          })}
        >
          {notice}
        </p>
      )}
    </div>
  )
}
