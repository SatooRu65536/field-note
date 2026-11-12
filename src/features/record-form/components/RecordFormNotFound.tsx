import { Link } from '@tanstack/react-router'
import { css } from 'styled-system/css'

import { buttonRecipe } from '@/components/ui/styles'

export function RecordFormNotFound() {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '4' })}>
      <p>編集する記録が見つかりません．</p>
      <Link to="/admin/records" className={buttonRecipe({ variant: 'secondary' })}>
        記録の一覧に戻る
      </Link>
    </div>
  )
}
