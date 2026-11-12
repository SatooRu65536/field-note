import { useEffect, useRef } from 'react'
import { css } from 'styled-system/css'

import { Button } from '@/components/ui/Button'

import type { ShortcutDefinition } from '../shortcuts'

interface ShortcutHelpDialogProps {
  readonly shortcuts: readonly ShortcutDefinition[]
  readonly onClosed: () => void
}

export function ShortcutHelpDialog({ shortcuts, onClosed }: ShortcutHelpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // モーダルとして開くには DOM の showModal を呼ぶ必要があるため，表示したときに一度だけ開く
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="shortcut-help-title"
      onClose={onClosed}
      className={css({
        m: 'auto',
        p: '6',
        w: '90vw',
        maxW: '420px',
        borderRadius: 'xl',
        boxShadow: 'floating',
        _backdrop: { bg: 'rgba(0, 0, 0, 0.3)' },
      })}
    >
      <h2 id="shortcut-help-title" className={css({ fontSize: 'lg', fontWeight: 'bold', mb: '4' })}>
        キーボードショートカット
      </h2>
      <dl className={css({ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2', alignItems: 'center' })}>
        {shortcuts.map(({ key, description }) => (
          <div key={key} className={css({ display: 'contents' })}>
            <dt>
              <kbd
                className={css({
                  display: 'inline-block',
                  minW: '7',
                  px: '2',
                  py: '0.5',
                  borderWidth: '1px',
                  borderColor: 'border',
                  borderRadius: 'sm',
                  bg: 'primary-muted',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                })}
              >
                {key}
              </kbd>
            </dt>
            <dd className={css({ fontSize: 'sm' })}>{description}</dd>
          </div>
        ))}
      </dl>
      <form method="dialog" className={css({ mt: '6', display: 'flex', justifyContent: 'end' })}>
        <Button type="submit" variant="secondary" size="sm">
          閉じる
        </Button>
      </form>
    </dialog>
  )
}
