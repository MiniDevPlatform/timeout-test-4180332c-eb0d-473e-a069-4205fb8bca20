/**
 * MiniDev ONE Template - Clipboard Hook
 * 
 * Copy/paste functionality with permissions.
 */

import { useState, useCallback, useEffect } from 'react';

export interface UseClipboardOptions {
  timeout?: number;
  format?: string;
}

export interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  paste: () => Promise<string | null>;
  copied: boolean;
  error: Error | null;
  isSupported: boolean;
}

/**
 * useClipboard - Copy to clipboard with feedback
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, format = 'text/plain' } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'clipboard' in navigator);
  }, []);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!isSupported) {
      setError(new Error('Clipboard API not supported'));
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);

      if (timeout > 0) {
        setTimeout(() => setCopied(false), timeout);
      }

      return true;
    } catch (err) {
      // Fallback for older browsers
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        setCopied(true);
        setError(null);

        if (timeout > 0) {
          setTimeout(() => setCopied(false), timeout);
        }

        return true;
      } catch (fallbackError) {
        setError(err as Error);
        return false;
      }
    }
  }, [isSupported, timeout]);

  const paste = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      setError(new Error('Clipboard API not supported'));
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, [isSupported]);

  return { copy, paste, copied, error, isSupported };
}

/**
 * useCopy - Simple copy with feedback
 */
export function useCopy(timeout: number = 2000): [string | null, (text: string) => Promise<void>, () => void] {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, []);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), timeout);
      return () => clearTimeout(timer);
    }
  }, [copied, timeout]);

  return [copied, copy, () => setCopied(null)];
}

/**
 * useCopyToClipboard - Copy to clipboard with state
 */
export function useCopyToClipboard(
  options: { timeout?: number } = {}
): {
  text: string | null;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
} {
  const [text, setText] = useState<string | null>(null);
  const { copy: doCopy, copied, error } = useClipboard({ timeout: options.timeout });

  const copy = useCallback(async (textToCopy: string): Promise<boolean> => {
    const success = await doCopy(textToCopy);
    if (success) {
      setText(textToCopy);
    }
    return success;
  }, [doCopy]);

  const reset = useCallback(() => {
    setText(null);
  }, []);

  return { text, copy, reset };
}

export default {
  useClipboard,
  useCopy,
  useCopyToClipboard,
};