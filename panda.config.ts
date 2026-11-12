import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{ts,tsx}'],
  exclude: [],
  jsxFramework: 'react',
  theme: {
    extend: {
      tokens: {
        radii: {
          base: { value: '0.625rem' },
        },
        shadows: {
          floating: {
            value:
              '0 1px 1px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(0, 0, 0, 0.1)',
          },
        },
        fonts: {
          sans: {
            value:
              "system-ui, -apple-system, 'Hiragino Sans', 'Noto Sans JP', sans-serif",
          },
        },
      },
      semanticTokens: {
        colors: {
          primary: { value: '#000000' },
          'on-primary': { value: '#ffffff' },
          'primary-muted': { value: '#f0f0f0' },
          accent: { value: '#2f7d4f' },
          'on-accent': { value: '#ffffff' },
          'accent-muted': { value: '#e3f1e8' },
          danger: { value: '#d11d20' },
          'danger-muted': { value: '#ffdcdc' },
          muted: { value: '#6b6b6b' },
          border: { value: '#dcdcdc' },
          // 地図タイルの読み込み前に表示する背景色
          'map-background': { value: '#fcfcfc' },
        },
        radii: {
          sm: { value: 'calc({radii.base} * 0.6)' },
          md: { value: 'calc({radii.base} * 0.8)' },
          lg: { value: '{radii.base}' },
          xl: { value: 'calc({radii.base} * 1.4)' },
        },
      },
    },
  },
  outdir: 'styled-system',
})
