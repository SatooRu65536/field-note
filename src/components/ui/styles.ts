import { css, cva } from 'styled-system/css'

export const buttonRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    borderRadius: 'md',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    transition: 'opacity 0.15s',
    _hover: { opacity: 0.85 },
    _disabled: { opacity: 0.4, cursor: 'not-allowed' },
  },
  variants: {
    variant: {
      primary: { bg: 'primary', color: 'on-primary' },
      secondary: {
        bg: 'white',
        color: 'primary',
        borderWidth: '1px',
        borderColor: 'border',
      },
      danger: { bg: 'danger', color: 'white' },
    },
    size: {
      sm: { h: '8', px: '3', fontSize: 'sm' },
      md: { h: '10', px: '4', fontSize: 'md' },
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export const inputStyles = css({
  w: '100%',
  minH: '10',
  px: '3',
  py: '2',
  borderWidth: '1px',
  borderColor: 'border',
  borderRadius: 'md',
  bg: 'white',
  fontSize: 'md',
  _focusVisible: { outline: '2px solid', outlineColor: 'accent', outlineOffset: '1px' },
  _disabled: { bg: 'primary-muted', color: 'muted' },
})
