import { useEffect } from 'react'
import type { RefObject } from 'react'

import { isSaveShortcut } from '../saveShortcut'

/**
 * ⌘S・Ctrl+S でフォームを送信する
 * @param formRef 送信するフォーム
 * @param isEnabled 受け付ける場合は true．保存中は false にして二重に送信しない
 */
export function useSaveShortcut({
  formRef,
  isEnabled,
}: {
  formRef: RefObject<HTMLFormElement | null>
  isEnabled: boolean
}): void {
  // キー入力はブラウザのイベントのため，フォームの表示中だけ購読する
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!isSaveShortcut(event)) return
      // ブラウザの「ページを保存」を開かせない
      event.preventDefault()
      // 入力欄の検証や送信の処理を通常の送信と揃えるため，フォームの送信として扱う
      formRef.current?.requestSubmit()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [formRef, isEnabled])
}
