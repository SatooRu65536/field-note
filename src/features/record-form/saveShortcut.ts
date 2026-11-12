/**
 * 押されたキーが保存のショートカット（⌘S または Ctrl+S）か判定する
 * @param key 押されたキー（KeyboardEvent.key）
 * @param ctrlKey Ctrl が押されている場合は true
 * @param metaKey ⌘ が押されている場合は true
 * @param altKey Alt（Option）が押されている場合は true
 * @param shiftKey Shift が押されている場合は true
 * @returns 保存のショートカットの場合に true
 */
export function isSaveShortcut({
  key,
  ctrlKey,
  metaKey,
  altKey,
  shiftKey,
}: {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  shiftKey: boolean
}): boolean {
  // ⌘⇧S（名前を付けて保存）などの別のショートカットと区別するため，⌘ か Ctrl だけとの組み合わせに限る
  return key.toLowerCase() === 's' && (ctrlKey || metaKey) && !altKey && !shiftKey
}
