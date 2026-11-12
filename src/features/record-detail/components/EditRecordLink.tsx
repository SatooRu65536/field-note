import { Link } from '@tanstack/react-router'

import { buttonRecipe } from '@/components/ui/styles'

interface EditRecordLinkProps {
  readonly recordId: string
}

export function EditRecordLink({ recordId }: EditRecordLinkProps) {
  return (
    <Link
      to="/admin/records/$recordId/edit"
      params={{ recordId }}
      className={buttonRecipe({ variant: 'secondary', size: 'sm' })}
    >
      編集
    </Link>
  )
}
