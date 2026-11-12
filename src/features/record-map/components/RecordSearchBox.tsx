import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { css } from 'styled-system/css'

import {
  MAX_SEARCH_QUERY_LENGTH,
  publicRecordSearchQueryOptions,
} from '@/integrations/field-note-api/records'
import type { RecordSummary } from '@/integrations/field-note-api/records'
import { FOCUS_ZOOM, MAP_TRANSITION_DURATION_MS } from '@/integrations/maplibre/constants'

import { RECORD_MAP_ID } from '../constants'
import { findNearestRecord } from '../nearestRecord'

interface RecordSearchBoxProps {
  readonly categoryIds: readonly string[]
  // 検索中の結果の件数．検索していない場合は null
  readonly resultCount: number | null
  readonly onSearched: (search: { query: string; nearestRecord: RecordSummary | null }) => void
  readonly onCleared: () => void
}

export function RecordSearchBox({
  categoryIds,
  resultCount,
  onSearched,
  onCleared,
}: RecordSearchBoxProps) {
  const { [RECORD_MAP_ID]: map } = useMap()
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const query = input.trim()
    if (query === '') {
      onCleared()
      return
    }

    setIsSearching(true)
    const records = await queryClient.fetchQuery(
      publicRecordSearchQueryOptions({ query, categoryIds }),
    )
    setIsSearching(false)

    // 検索した時点で見ていた場所から最も近い記録へ移動する
    const center = map?.getCenter()
    const nearestRecord = center
      ? findNearestRecord({ records, center: { latitude: center.lat, longitude: center.lng } })
      : null
    if (map && nearestRecord) {
      map.flyTo({
        center: [nearestRecord.longitude, nearestRecord.latitude],
        zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
        duration: MAP_TRANSITION_DURATION_MS,
      })
    }
    onSearched({ query, nearestRecord })
  }

  function handleClear(): void {
    setInput('')
    onCleared()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={css({
        position: 'absolute',
        top: '4',
        left: '4',
        right: '20',
        zIndex: 2,
        maxW: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          h: '11',
          pl: '4',
          pr: '1',
          borderRadius: 'full',
          bg: 'white',
          boxShadow: 'floating',
        })}
      >
        <input
          type="search"
          aria-label="名前・タグで検索"
          placeholder="名前・タグで検索"
          value={input}
          maxLength={MAX_SEARCH_QUERY_LENGTH}
          onChange={(event) => setInput(event.target.value)}
          className={css({ flex: '1', minW: '0', h: '100%', fontSize: 'md', outline: 'none' })}
        />
        {resultCount !== null && (
          <button
            type="button"
            onClick={handleClear}
            className={css({ px: '2', fontSize: 'sm', color: 'muted', cursor: 'pointer' })}
          >
            クリア
          </button>
        )}
        <button
          type="submit"
          disabled={isSearching}
          className={css({
            h: '9',
            px: '4',
            borderRadius: 'full',
            bg: 'primary',
            color: 'on-primary',
            fontSize: 'sm',
            fontWeight: 'bold',
            cursor: 'pointer',
            _disabled: { opacity: 0.5 },
          })}
        >
          検索
        </button>
      </div>
      {resultCount !== null && (
        <p
          role="status"
          className={css({
            alignSelf: 'start',
            px: '3',
            py: '1',
            borderRadius: 'full',
            bg: 'white',
            boxShadow: 'floating',
            fontSize: 'xs',
          })}
        >
          {resultCount === 0 ? '見つかりませんでした' : `${resultCount} 件見つかりました（最寄りへ移動）`}
        </p>
      )}
    </form>
  )
}
