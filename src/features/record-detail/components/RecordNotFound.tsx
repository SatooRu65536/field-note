import { NotFoundMessage } from '@/components/ui/NotFoundMessage'

export function RecordNotFound() {
  return (
    <NotFoundMessage
      title="この記録は，どこかに隠れてしまったようです"
      description="落ち葉の下か，岩の陰か…．地図からもう一度探してみましょう．"
    />
  )
}
