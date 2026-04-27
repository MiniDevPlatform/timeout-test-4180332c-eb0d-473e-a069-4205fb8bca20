/**
 * MiniDev ONE Template - Keyboard Navigation Hook
 * 
 * Keyboard shortcuts, hotkeys, and navigation.
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
  preventDefault?: boolean;
}

export interface UseKeyboardOptions {
  enabled?: boolean;
  capture?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboard(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardOptions = {}
) {
  const { enabled = true, capture = false } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                        event.code === shortcut.key;
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (capture) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    } else {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, capture]);

  return {
    shortcuts,
    enabled,
    capture,
  };
}

/**
 * Hook for single key press detection
 */
export function useKeyPress(targetKey: string, callback: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === targetKey.toLowerCase()) {
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [targetKey, callback]);
}

/**
 * Hook for escape key
 */
export function useEscapeKey(callback: () => void) {
  useKeyPress('Escape', callback);
}

/**
 * Hook for enter key
 */
export function useEnterKey(callback: () => void) {
  useKeyPress('Enter', callback);
}

// Default shortcuts for common actions
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { key: 's', ctrl: true, handler: () => {}, description: 'Save', preventDefault: false },
  { key: 'z', ctrl: true, handler: () => {}, description: 'Undo', preventDefault: false },
  { key: 'y', ctrl: true, handler: () => {}, description: 'Redo', preventDefault: false },
  { key: 'f', ctrl: true, handler: () => {}, description: 'Find', preventDefault: false },
  { key: '/', handler: () => {}, description: 'Search', preventDefault: false },
  { key: 'Escape', handler: () => {}, description: 'Close/Cancel', preventDefault: false },
  { key: 'Tab', handler: () => {}, description: 'Next', preventDefault: false },
  { key: 'Tab', shift: true, handler: () => {}, description: 'Previous', preventDefault: false },
];

export default {
  useKeyboard,
  useKeyPress,
  useEscapeKey,
  useEnterKey,
  DEFAULT_SHORTCUTS,
};