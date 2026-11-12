import { css } from 'styled-system/css'

export function AddRecordHint() {
  return (
    <p
      className={css({
        position: 'absolute',
        left: '50%',
        bottom: '8',
        transform: 'translateX(-50%)',
        zIndex: 1,
        px: '4',
        py: '2',
        borderRadius: 'full',
        bg: 'primary',
        color: 'on-primary',
        fontSize: 'sm',
        boxShadow: 'floating',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      })}
    >
      地図をダブルクリックすると，その地点に記録を追加できます
    </p>
  )
}
