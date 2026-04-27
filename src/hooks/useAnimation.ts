/**
 * MiniDev ONE Template - Animation Hook
 * 
 * React hooks for animations using the motion system.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { EASING, SPRING_PRESETS, Spring } from '@/lib/ui/motion';

export interface AnimationConfig {
  duration?: number;
  easing?: keyof typeof EASING | ((t: number) => number);
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

/**
 * useAnimation - Animate a value over time
 */
export function useAnimation(
  from: number,
  to: number,
  config: AnimationConfig = {}
) {
  const { duration = 300, easing = 'easeOut', delay = 0 } = config;
  const [value, setValue] = useState(from);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const easingFn = typeof easing === 'function' ? easing : EASING[easing as keyof typeof EASING] || EASING.linear;

    let timeout: number | undefined;
    if (delay > 0) {
      timeout = window.setTimeout(() => {
        startAnimation();
      }, delay);
    } else {
      startAnimation();
    }

    function startAnimation() {
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - (startTimeRef.current || 0);
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFn(progress);

        const currentValue = from + (to - from) * easedProgress;
        setValue(currentValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (timeout) clearTimeout(timeout);
    };
  }, [from, to, duration, easing, delay]);

  return value;
}

/**
 * useSpring - Spring-based animation
 */
export function useSpring(
  target: number,
  config: SpringConfig = {}
) {
  const spring = useRef(new Spring(config));
  const [value, setValue] = useState(target);

  useEffect(() => {
    spring.current.setTarget(target);
  }, [target]);

  useEffect(() => {
    let frameId: number;

    const update = () => {
      const state = spring.current.update(1 / 60);
      setValue(state.value);

      if (!state.finished) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return value;
}

/**
 * useInView - Detect when element is in viewport
 */
export function useInView(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);

  return isInView;
}

/**
 * useIntersection - Intersection observer hook
 */
export function useIntersection(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
      },
      options
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);

  return entry;
}

/**
 * useStagger - Staggered animation helper
 */
export function useStagger<T>(
  items: T[],
  config: {
    delay?: number;
    stagger?: number;
    duration?: number;
  } = {}
) {
  const { delay = 0, stagger = 100, duration = 300 } = config;
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => {
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, index]));
        }, index * stagger);
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [items, delay, stagger]);

  return visibleItems;
}

/**
 * useHover animation
 */
export function useHover(ref: React.RefObject<HTMLElement>) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);

    return () => {
      element.removeEventListener('mouseenter', onEnter);
      element.removeEventListener('mouseleave', onLeave);
    };
  }, [ref]);

  return isHovered;
}

/**
 * useFocus animation
 */
export function useFocus(ref: React.RefObject<HTMLElement>) {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);

    element.addEventListener('focus', onFocus);
    element.addEventListener('blur', onBlur);

    return () => {
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
    };
  }, [ref]);

  return isFocused;
}

/**
 * useScrollProgress - Track scroll progress
 */
export function useScrollProgress(
  ref?: React.RefObject<HTMLElement>
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref?.current) {
        const element = ref.current;
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;

        const scrolled = windowHeight - elementTop;
        const total = windowHeight + elementHeight;
        const progress = Math.max(0, Math.min(1, scrolled / total));

        setProgress(progress);
      } else {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = scrollHeight > 0 ? scrolled / scrollHeight : 0;
        setProgress(Math.max(0, Math.min(1, progress)));
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
}

/**
 * useParallax - Parallax effect
 */
export function useParallax(
  ref: React.RefObject<HTMLElement>,
  speed: number = 0.5
) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenterY = window.innerHeight / 2;
      const distance = centerY - viewportCenterY;

      setOffset(distance * speed * -1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, speed]);

  return offset;
}

export default {
  useAnimation,
  useSpring,
  useInView,
  useIntersection,
  useStagger,
  useHover,
  useFocus,
  useScrollProgress,
  useParallax,
};