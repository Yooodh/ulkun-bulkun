'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import styles from './DropdownSelect.module.scss';

export type DropdownSelectOption<Value extends string = string> = {
  value: Value;
  label: string;
};

type DropdownSelectProps<Value extends string> = {
  value: Value;
  options: DropdownSelectOption<Value>[];
  onChange: (value: Value) => void;
  ariaLabel: string;
  displayLabel?: string;
  placeholder?: string;
};

export default function DropdownSelect<Value extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  displayLabel,
  placeholder = '선택하세요',
}: DropdownSelectProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const [pressAnimation, setPressAnimation] = useState<'keyboard' | 'touch' | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const touchPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const initialFocusIndexRef = useRef(0);
  const listboxId = useId();
  const selectedLabel =
    displayLabel ??
    options.find((option) => option.value === value)?.label ??
    placeholder;

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    setPressAnimation((current) => current === 'touch' ? current : null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const focusOption = useCallback((index: number) => {
    if (!options.length) return;
    const wrappedIndex = (index + options.length) % options.length;
    optionRefs.current[wrappedIndex]?.focus();
  }, [options.length]);

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[initialFocusIndexRef.current]?.focus();
  }, [isOpen]);

  const open = (fromKeyboard = false) => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    initialFocusIndexRef.current = selectedIndex >= 0 ? selectedIndex : 0;
    if (fromKeyboard) setPressAnimation('keyboard');
    setIsOpen(true);
  };

  useEffect(() => () => {
    if (touchPressTimerRef.current) clearTimeout(touchPressTimerRef.current);
  }, []);

  useEffect(() => {
    // Close the popover when its data source becomes empty while it is open.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (options.length === 0 && isOpen) close();
  }, [close, isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close(true);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [close, isOpen]);

  return (
    <div className={styles.dropdown} ref={rootRef}>
      <button
        type='button'
        className={`${styles.trigger} ${pressAnimation === 'keyboard' ? styles.keyboardPress : ''} ${pressAnimation === 'touch' ? styles.touchPress : ''}`}
        ref={triggerRef}
        aria-label={`${ariaLabel}: ${selectedLabel}`}
        aria-haspopup='listbox'
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        disabled={options.length === 0}
        onPointerDown={(event) => {
          if (event.pointerType === 'touch') {
            if (touchPressTimerRef.current) clearTimeout(touchPressTimerRef.current);
            setPressAnimation('touch');
            touchPressTimerRef.current = setTimeout(() => {
              setPressAnimation((current) => current === 'touch' ? null : current);
              touchPressTimerRef.current = null;
            }, 160);
          }
        }}
        onClick={() => {
          if (isOpen) {
            close();
            return;
          }
          open();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            open(true);
          }
        }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setPressAnimation(null);
        }}
      >
        {selectedLabel}
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div id={listboxId} className={styles.menu} role='listbox' aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button
              type='button'
              key={option.value}
              role='option'
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              aria-selected={option.value === value}
              className={styles.menuItem}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  focusOption(index + 1);
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  focusOption(index - 1);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  focusOption(0);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  focusOption(options.length - 1);
                } else if (event.key === 'Tab') {
                  close();
                }
              }}
              onClick={() => {
                onChange(option.value);
                close(true);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
