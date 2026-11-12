import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

interface FieldGroupProps {
  readonly legend: string
  readonly children: ReactNode
}

export function FieldGroup({ legend, children }: FieldGroupProps) {
  return (
    <fieldset className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
      <legend className={css({ fontWeight: 'bold', fontSize: 'sm', mb: '1.5' })}>{legend}</legend>
      {children}
    </fieldset>
  )
}
