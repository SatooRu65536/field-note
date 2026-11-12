interface UncertainPinMarkProps {
  readonly color: string
}

// 不確かなものを示すピンの中の「?」．MapPin の SVG の中に描く
export function UncertainPinMark({ color }: UncertainPinMarkProps) {
  return (
    <text
      x="16"
      y="21"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fontFamily="sans-serif"
      fill={color}
    >
      ?
    </text>
  )
}
