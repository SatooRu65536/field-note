import { describe, expect, it } from 'vitest'

import { canHandleShortcut, RECORD_SEARCH_INPUT_ID, resolveShortcut } from './shortcuts'

describe('resolveShortcut', () => {
  it.each([
    ['n', '/admin/records/new'],
    ['l', '/admin/records'],
    ['c', '/admin/categories'],
    ['m', '/'],
  ])('%s で %s に移動する', (key, to) => {
    // Act
    const action = resolveShortcut({ key, pathname: '/records/record-1' })

    // Assert
    expect(action).toEqual({ type: 'navigate', to })
  })

  it('記録の詳細画面で e を押すと，その記録の編集画面に移動する', () => {
    // Act
    const action = resolveShortcut({ key: 'e', pathname: '/records/record-1' })

    // Assert
    expect(action).toEqual({ type: 'navigate', to: '/admin/records/record-1/edit' })
  })

  it('記録の詳細画面以外では e を使えない', () => {
    // Act
    const action = resolveShortcut({ key: 'e', pathname: '/admin/records' })

    // Assert
    expect(action).toBeNull()
  })

  it('地図画面で f を押すと検索欄にフォーカスする', () => {
    // Act
    const action = resolveShortcut({ key: 'f', pathname: '/' })

    // Assert
    expect(action).toEqual({ type: 'focus', elementId: RECORD_SEARCH_INPUT_ID })
  })

  it('地図画面以外では f を使えない', () => {
    // Act
    const action = resolveShortcut({ key: 'f', pathname: '/admin/records' })

    // Assert
    expect(action).toBeNull()
  })

  it('? でショートカットの一覧を表示する', () => {
    // Act
    const action = resolveShortcut({ key: '?', pathname: '/' })

    // Assert
    expect(action).toEqual({ type: 'help' })
  })

  it('割り当てのないキーは null を返す', () => {
    // Act
    const action = resolveShortcut({ key: 'x', pathname: '/' })

    // Assert
    expect(action).toBeNull()
  })
})

describe('canHandleShortcut', () => {
  it('入力欄以外でキーを押した場合は true を返す', () => {
    // Act
    const result = canHandleShortcut({
      target: { tagName: 'BODY' },
      hasModifier: false,
      isComposing: false,
    })

    // Assert
    expect(result).toBe(true)
  })

  it.each([
    ['input', { tagName: 'INPUT' }, false, false],
    ['textarea', { tagName: 'TEXTAREA' }, false, false],
    ['select', { tagName: 'SELECT' }, false, false],
    ['編集可能な要素', { tagName: 'DIV', isContentEditable: true }, false, false],
    ['修飾キーを押している', { tagName: 'BODY' }, true, false],
    ['日本語入力の変換中', { tagName: 'BODY' }, false, true],
  ])('%sの場合は false を返す', (_, target, hasModifier, isComposing) => {
    // Act
    const result = canHandleShortcut({ target, hasModifier, isComposing })

    // Assert
    expect(result).toBe(false)
  })
})
