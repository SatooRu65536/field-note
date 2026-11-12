import { css } from 'styled-system/css'
import type { ReactNode } from 'react'

interface FormFieldProps {
  readonly label: string
  readonly htmlFor: string
  readonly hint?: string
  readonly children: ReactNode
}

export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '1.5' })}>
      <label htmlFor={htmlFor} className={css({ fontWeight: 'bold', fontSize: 'sm' })}>
        {label}
      </label>
      {children}
      {hint && <p className={css({ fontSize: 'xs', color: 'muted' })}>{hint}</p>}
    </div>
  )
}
