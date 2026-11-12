// 地図画面の検索欄の id．ショートカットでフォーカスを移すために使う
export const RECORD_SEARCH_INPUT_ID = 'record-search-input'

export type ShortcutAction =
  | { readonly type: 'navigate'; readonly to: string }
  | { readonly type: 'focus'; readonly elementId: string }
  | { readonly type: 'help' }

export interface ShortcutDefinition {
  readonly key: string
  readonly description: string
}

// ショートカットの一覧に表示する説明
export const SHORTCUT_DEFINITIONS: readonly ShortcutDefinition[] = [
  { key: 'n', description: '記録を追加' },
  { key: 'l', description: '記録一覧' },
  { key: 'c', description: 'カテゴリ' },
  { key: 'm', description: '地図' },
  { key: 'e', description: '表示中の記録を編集（記録の詳細画面）' },
  { key: '/', description: '検索欄にフォーカス（地図画面）' },
  { key: '⌘S / Ctrl+S', description: '保存（記録の追加・編集画面）' },
  { key: '?', description: 'ショートカットの一覧' },
]

const RECORD_DETAIL_PATH_PATTERN = /^\/records\/([^/]+)\/?$/

/**
 * 押されたキーと表示中の画面から，ショートカットの動作を決める
 * @param key 押されたキー（KeyboardEvent.key）
 * @param pathname 表示中の画面のパス
 * @returns 動作．ショートカットでないキーや，その画面で使えないショートカットの場合は null
 */
export function resolveShortcut({
  key,
  pathname,
}: {
  key: string
  pathname: string
}): ShortcutAction | null {
  switch (key) {
    case 'n':
      return { type: 'navigate', to: '/admin/records/new' }
    case 'l':
      return { type: 'navigate', to: '/admin/records' }
    case 'c':
      return { type: 'navigate', to: '/admin/categories' }
    case 'm':
      return { type: 'navigate', to: '/' }
    case 'e': {
      const recordId = RECORD_DETAIL_PATH_PATTERN.exec(pathname)?.[1]
      return recordId ? { type: 'navigate', to: `/admin/records/${recordId}/edit` } : null
    }
    case '/':
      return pathname === '/' ? { type: 'focus', elementId: RECORD_SEARCH_INPUT_ID } : null
    case '?':
      return { type: 'help' }
    default:
      return null
  }
}

/**
 * キーの入力がショートカットとして扱える状況か判定する
 * @param target キーが押された要素
 * @param hasModifier Ctrl・⌘・Alt のいずれかが押されている場合は true
 * @param isComposing 日本語入力の変換中の場合は true
 * @returns 文字の入力中でなく，修飾キーも押されていない場合に true
 */
export function canHandleShortcut({
  target,
  hasModifier,
  isComposing,
}: {
  target: { readonly tagName?: string; readonly isContentEditable?: boolean } | null
  hasModifier: boolean
  isComposing: boolean
}): boolean {
  if (hasModifier || isComposing) return false
  if (!target) return true
  if (target.isContentEditable) return false
  return !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName ?? '')
}
