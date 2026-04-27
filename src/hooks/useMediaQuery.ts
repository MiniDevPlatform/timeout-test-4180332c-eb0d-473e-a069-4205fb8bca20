/**
 * MiniDev ONE Template - Media Query Hooks
 * 
 * Responsive design hooks for breakpoints and media queries.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'>('md');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('xxxl');
      else if (width >= 1280) setBreakpoint('xxl');
      else if (width >= 1024) setBreakpoint('xl');
      else if (width >= 768) setBreakpoint('lg');
      else if (width >= 640) setBreakpoint('md');
      else if (width >= 480) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Hook to detect if screen is mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * Hook to detect if screen is tablet
 */
export function useIsTablet(breakpoint: number = 1024): boolean {
  return useMediaQuery(`(min-width: ${breakpoint}px) and (max-width: 1279px)`);
}

/**
 * Hook to detect if screen is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: 1280px)`);
}

/**
 * Hook to detect if screen is in dark mode
 */
export function useIsDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook to detect hover capability
 */
export function useCanHover(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

/**
 * Hook to detect touch capability
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/**
 * Hook to get viewport size
 */
export function useViewportSize(): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

/**
 * Hook to get document direction (RTL/LTR)
 */
export function useDirection(): 'ltr' | 'rtl' {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateDirection = () => {
      setDirection(document.dir === 'rtl' ? 'rtl' : 'ltr');
    };

    updateDirection();

    // Watch for direction changes
    const observer = new MutationObserver(updateDirection);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });

    return () => observer.disconnect();
  }, []);

  return direction;
}

/**
 * Hook for responsive values
 */
export function useResponsiveValue<T>(
  values: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl', T>>,
  defaultValue: T
): T {
  const breakpoint = useBreakpoint();
  const order: Array<keyof typeof values> = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];
  
  // Find the appropriate value for current breakpoint or lower
  const breakpoints = order.slice(0, order.indexOf(breakpoint) + 1);
  
  for (const bp of breakpoints.reverse()) {
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return defaultValue;
}

// Breakpoint constants
export const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 640,
  lg: 768,
  xl: 1024,
  xxl: 1280,
  xxxl: 1536,
} as const;

// Media query strings
export const MEDIA_QUERIES = {
  xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS.xxl - 1}px)`,
  xxl: `(min-width: ${BREAKPOINTS.xxl}px) and (max-width: ${BREAKPOINTS.xxxl - 1}px)`,
  xxxl: `(min-width: ${BREAKPOINTS.xxxl}px)`,
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  hover: '(hover: hover) and (pointer: fine)',
  touch: '(pointer: coarse)',
} as const;

export default {
  useMediaQuery,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsDarkMode,
  usePrefersReducedMotion,
  useCanHover,
  useIsTouchDevice,
  useViewportSize,
  useDirection,
  useResponsiveValue,
  BREAKPOINTS,
  MEDIA_QUERIES,
};