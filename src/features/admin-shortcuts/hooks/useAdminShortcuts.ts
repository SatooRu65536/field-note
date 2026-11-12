import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { canHandleShortcut, resolveShortcut } from '../shortcuts'

/**
 * 管理者向けのキーボードショートカットを受け付ける
 * @param isEnabled 受け付ける場合は true
 * @param onHelpRequested ショートカットの一覧を求められたときに呼ぶ関数
 */
export function useAdminShortcuts({
  isEnabled,
  onHelpRequested,
}: {
  isEnabled: boolean
  onHelpRequested: () => void
}): void {
  const router = useRouter()

  // キー入力はブラウザのイベントのため，画面の表示中だけ購読する
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target instanceof HTMLElement ? event.target : null
      const canHandle = canHandleShortcut({
        target,
        hasModifier: event.ctrlKey || event.metaKey || event.altKey,
        isComposing: event.isComposing,
      })
      if (!canHandle) return

      const action = resolveShortcut({ key: event.key, pathname: router.state.location.pathname })
      if (!action) return
      event.preventDefault()

      switch (action.type) {
        case 'navigate':
          // 移動先はパスを組み立てた文字列のため，型付きの navigate ではなく履歴に直接積む
          router.history.push(action.to)
          return
        case 'focus':
          document.getElementById(action.elementId)?.focus()
          return
        case 'help':
          onHelpRequested()
          return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled, onHelpRequested, router])
}
