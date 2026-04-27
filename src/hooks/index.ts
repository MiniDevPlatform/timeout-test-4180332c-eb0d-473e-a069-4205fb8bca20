/**
 * MiniDev ONE Template - Hooks Index
 * 
 * React hooks for common functionality.
 */

export { useLocalStorage } from './useLocalStorage';
export { useTheme } from './useTheme';
export { useGamepad } from './useGamepad';
export { useKeyboard } from './useKeyboard';
export { useGesture, useSwipeDirection, usePinchZoom } from './useGesture';
export { useForm, validators, validateSchema } from './useForm';
export { useAnimation, useSpring, useInView, useIntersection, useStagger, useHover, useFocus, useScrollProgress, useParallax } from './useAnimation';
export { useMediaQuery, useBreakpoint, useIsMobile, useIsTablet, useIsDesktop, useIsDarkMode, usePrefersReducedMotion, useCanHover, useIsTouchDevice, useViewportSize, useDirection, useResponsiveValue } from './useMediaQuery';
export { useAsync, useAsyncCallback, useRequest, useDebounce, useDebouncedCallback, useThrottle, useInterval, useTimeout, usePrevious, useLocalStorage, useSessionStorage } from './useAsync';
export { useDrag, useSortable, useDropZone, useDraggable } from './useDrag';
export { useClipboard, useCopy, useCopyToClipboard } from './useClipboard';
export { useWebSocket, useRealtime } from './useWebSocket';
export { useClickOutside, useClickAway } from './useClickOutside';

// =============================================================================
// USE STATE
// =============================================================================
import { useState, useEffect, useCallback } from 'react';

/**
 * useDebounce - Debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useWindowSize - Get window dimensions
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}

/**
 * useInterval - Call a function on an interval
 */
export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

/**
 * useTimeout - Call a function after a delay
 */
export function useTimeout(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(callback, delay);
    return () => clearTimeout(id);
  }, [callback, delay]);
}

/**
 * useToggle - Toggle a boolean
 */
export function useToggle(initial: boolean = false): [boolean, () => void] {
  return useState(initial);
}

/**
 * useAsync - Handle async operations
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
    } catch (e) {
      setError(e as Error);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { execute, status, value, error };
}

/**
 * useMediaQuery - Check if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * useKeyPress - Listen for key press
 */
export function useKeyPress(targetKey: string) {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.key === targetKey) setKeyPressed(true);
    };
    const upHandler = (e: KeyboardEvent) => {
      if (e.key === targetKey) setKeyPressed(false);
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}

/**
 * useCopyToClipboard - Copy text to clipboard
 */
export function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return [copied, copy];
}

/**
 * useFetch - Fetch data with loading/error states
 */
export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error, refetch: () => setData(null) };
}

/**
 * useHover - Track hover state
 */
export function useHover(): [React.RefObject<any>, boolean] {
  const [hovered, setHovered] = useState(false);
  const ref = { current: null } as React.RefObject<any>;

  useEffect(() => {
    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    ref.current?.addEventListener('mouseenter', handleMouseEnter);
    ref.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ref.current?.removeEventListener('mouseenter', handleMouseEnter);
      ref.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  return [ref, hovered];
}

export default {
  useDebounce,
  useWindowSize,
  useInterval,
  useTimeout,
  useToggle,
  useAsync,
  useMediaQuery,
  useKeyPress,
  useCopyToClipboard,
  useFetch,
  useHover,
};
