import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

import { buttonRecipe } from '@/components/ui/styles'

export function RecordNotFound() {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '4' })}>
      <p>記録が見つかりません．削除されたか，非公開になった可能性があります．</p>
      <Link to="/" className={buttonRecipe({ variant: 'secondary' })}>
        地図に戻る
      </Link>
    </div>
  )
}
