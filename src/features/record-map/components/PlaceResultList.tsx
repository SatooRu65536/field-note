import { css } from 'styled-system/css'

import type { Place } from '@/integrations/gsi/placeSearch'

interface PlaceResultListProps {
  readonly places: readonly Place[]
  readonly onPlaceSelected: (place: Place) => void
}

export function PlaceResultList({ places, onPlaceSelected }: PlaceResultListProps) {
  return (
    <section
      aria-label="地名の候補"
      className={css({
        bg: 'white',
        borderRadius: 'lg',
        boxShadow: 'floating',
        overflow: 'hidden',
      })}
    >
      <ul className={css({ listStyle: 'none', maxH: '60', overflowY: 'auto' })}>
        {places.map((place) => (
          <li key={`${place.title}-${place.latitude}-${place.longitude}`}>
            <button
              type="button"
              onClick={() => onPlaceSelected(place)}
              className={css({
                display: 'block',
                w: '100%',
                px: '4',
                py: '2',
                textAlign: 'left',
                fontSize: 'sm',
                cursor: 'pointer',
                _hover: { bg: 'primary-muted' },
                _focusVisible: { bg: 'primary-muted', outline: 'none' },
              })}
            >
              {place.title}
            </button>
          </li>
        ))}
      </ul>
      <p className={css({ px: '4', py: '1', fontSize: 'xs', color: 'muted', borderTopWidth: '1px', borderColor: 'border' })}>
        地名検索：国土地理院
      </p>
    </section>
  )
}
