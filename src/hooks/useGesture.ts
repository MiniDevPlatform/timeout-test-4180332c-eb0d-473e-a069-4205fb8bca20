/**
 * MiniDev ONE Template - Gesture Hook
 * 
 * Touch gestures, swipe detection, and pinch-to-zoom.
 */

import { useEffect, useRef, useCallback, useState } from 'react';

export interface GestureState {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
  velocity: number;
  distance: number;
  scale: number;
  rotation: number;
  isTap: boolean;
  isDoubleTap: boolean;
  isLongPress: boolean;
}

export interface UseGestureOptions {
  threshold?: number;
  velocityThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

const defaultOptions: UseGestureOptions = {
  threshold: 10,
  velocityThreshold: 0.5,
  longPressDelay: 500,
  doubleTapDelay: 300,
};

/**
 * Hook for detecting touch gestures
 */
export function useGesture(
  targetRef: React.RefObject<HTMLElement>,
  options: UseGestureOptions = {}
) {
  const opts = { ...defaultOptions, ...options };
  
  const [state, setState] = useState<GestureState>({
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    direction: 'none',
    velocity: 0,
    distance: 0,
    scale: 1,
    rotation: 0,
    isTap: false,
    isDoubleTap: false,
    isLongPress: false,
  });

  const startPos = useRef({ x: 0, y: 0, time: 0 });
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const lastTap = useRef(0);
  const longPressTimer = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    lastPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };

    // Long press timer
    longPressTimer.current = window.setTimeout(() => {
      setState(s => ({ ...s, isLongPress: true }));
    }, opts.longPressDelay!);
  }, [opts.longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine direction
    let direction: GestureState['direction'] = 'none';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    // Calculate velocity
    const timeDelta = Date.now() - lastPos.current.time;
    const velocity = timeDelta > 0 ? distance / timeDelta : 0;

    lastPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };

    setState(s => ({
      ...s,
      x: touch.clientX,
      y: touch.clientY,
      deltaX,
      deltaY,
      direction,
      velocity,
      distance,
    }));
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const now = Date.now();
    const { deltaX, deltaY, distance } = state;

    // Check for tap
    const isTap = distance < opts.threshold!;
    
    // Check for double tap
    const isDoubleTap = isTap && (now - lastTap.current) < opts.doubleTapDelay!;
    if (isDoubleTap) {
      lastTap.current = now;
    }

    // Reset state
    setState(s => ({
      ...s,
      deltaX: 0,
      deltaY: 0,
      direction: 'none',
      velocity: 0,
      distance: 0,
      isTap,
      isDoubleTap,
      isLongPress: false,
    }));
  }, [state, opts.threshold, opts.doubleTapDelay]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    target.addEventListener('touchstart', handleTouchStart);
    target.addEventListener('touchmove', handleTouchMove);
    target.addEventListener('touchend', handleTouchEnd);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
    };
  }, [targetRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return state;
}

/**
 * Swipe direction hook
 */
export function useSwipeDirection(
  targetRef: React.RefObject<HTMLElement>,
  threshold: number = 50
) {
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const gesture = useGesture(targetRef);

  useEffect(() => {
    if (gesture.distance > threshold) {
      setDirection(gesture.direction as any);
      setTimeout(() => setDirection(null), 300);
    }
  }, [gesture.direction, gesture.distance, threshold]);

  return direction;
}

/**
 * Pinch zoom hook
 */
export function usePinchZoom(targetRef: React.RefObject<HTMLElement>) {
  const [scale, setScale] = useState(1);
  const initialScale = useRef(1);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialScale.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const newScale = distance / initialScale.current;
        setScale(Math.min(Math.max(newScale, 0.5), 4));
      }
    };

    const handleTouchEnd = () => {
      initialScale.current = 1;
    };

    target.addEventListener('touchstart', handleTouchStart);
    target.addEventListener('touchmove', handleTouchMove);
    target.addEventListener('touchend', handleTouchEnd);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
    };
  }, [targetRef]);

  return scale;
}

export default {
  useGesture,
  useSwipeDirection,
  usePinchZoom,
};