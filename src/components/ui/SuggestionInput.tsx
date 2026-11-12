import { useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { css, cx } from 'styled-system/css'

import { INPUT_STYLES } from './styles'

interface SuggestionInputProps {
  readonly id: string
  readonly value: string
  readonly suggestions: readonly string[]
  readonly maxLength?: number
  readonly disabled?: boolean
  readonly onValueChanged: (value: string) => void
}

const OPTION_STYLES = css({
  px: '3',
  py: '2',
  cursor: 'pointer',
  _hover: { bg: 'primary-muted' },
})

const ACTIVE_OPTION_STYLES = css({ bg: 'primary-muted' })

export function SuggestionInput({
  id,
  value,
  suggestions,
  maxLength,
  disabled = false,
  onValueChanged,
}: SuggestionInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listboxId = `${id}-suggestions`
  const isOpen = isFocused && !isDismissed && suggestions.length > 0

  function handleChange(nextValue: string): void {
    setIsDismissed(false)
    setActiveIndex(-1)
    onValueChanged(nextValue)
  }

  function handleSelect(suggestion: string): void {
    setIsDismissed(true)
    setActiveIndex(-1)
    onValueChanged(suggestion)
  }

  function handleOptionMouseDown({
    event,
    suggestion,
  }: {
    event: MouseEvent<HTMLLIElement>
    suggestion: string
  }): void {
    // クリックで入力欄のフォーカスが外れて候補が閉じる前に選択する
    event.preventDefault()
    handleSelect(suggestion)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // Safari は日本語入力の変換確定時に isComposing が false のため keyCode でも判定する
    if (!isOpen || event.nativeEvent.isComposing || event.keyCode === 229) return
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % suggestions.length)
        return
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
        return
      case 'Enter': {
        const suggestion = suggestions[activeIndex]
        if (suggestion === undefined) return
        // フォーム全体を送信せず，候補の選択だけを行う
        event.preventDefault()
        handleSelect(suggestion)
        return
      }
      case 'Escape':
        setIsDismissed(true)
        return
    }
  }

  return (
    <div className={css({ position: 'relative' })}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={INPUT_STYLES}
      />
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="候補"
          className={css({
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            zIndex: 10,
            mt: '1',
            py: '1',
            bg: 'white',
            borderWidth: '1px',
            borderColor: 'border',
            borderRadius: 'md',
            boxShadow: 'floating',
            listStyle: 'none',
            maxH: '60',
            overflowY: 'auto',
          })}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cx(OPTION_STYLES, index === activeIndex && ACTIVE_OPTION_STYLES)}
              onMouseDown={(event) => handleOptionMouseDown({ event, suggestion })}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
