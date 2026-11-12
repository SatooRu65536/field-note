import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { adminStatusQueryOptions } from '@/integrations/field-note-api/adminStatus'

import { ShortcutHelpDialog } from './components/ShortcutHelpDialog'
import { useAdminShortcuts } from './hooks/useAdminShortcuts'
import { SHORTCUT_DEFINITIONS } from './shortcuts'

export { RECORD_SEARCH_INPUT_ID } from './shortcuts'

export function AdminShortcuts() {
  const { data: isAdmin = false } = useQuery(adminStatusQueryOptions())
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  // キー入力の購読を描画のたびに張り直さないよう，関数を使い回す
  const handleHelpRequest = useCallback(() => setIsHelpOpen(true), [])

  useAdminShortcuts({ isEnabled: isAdmin, onHelpRequested: handleHelpRequest })

  return (
    isHelpOpen && (
      <ShortcutHelpDialog
        shortcuts={SHORTCUT_DEFINITIONS}
        onClosed={() => setIsHelpOpen(false)}
      />
    )
  )
}
