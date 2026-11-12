import { NotFoundMessage } from '@/components/ui/NotFoundMessage'

export function RecordNotFound() {
  return (
    <NotFoundMessage
      title="記録が見つかりません"
      description="削除されたか，URL が間違っている可能性があります．"
    />
  )
}
