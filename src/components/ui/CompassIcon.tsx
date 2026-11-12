interface CompassIconProps {
  // 地図の回転に合わせて針を回す角度
  readonly rotate?: number
}

export function CompassIcon({ rotate = 0 }: CompassIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M12 2l4 10h-8z" fill="#d11d20" />
      <path d="M12 22l-4-10h8z" fill="currentColor" />
    </svg>
  )
}
