import { cx } from 'styled-system/css'
import type { ComponentPropsWithoutRef } from 'react'

import { buttonRecipe } from './styles'

type ButtonRecipeProps = NonNullable<Parameters<typeof buttonRecipe>[0]>

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  readonly variant?: ButtonRecipeProps['variant']
  readonly size?: ButtonRecipeProps['size']
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonRecipe({ variant, size }), className)}
      {...props}
    />
  )
}
