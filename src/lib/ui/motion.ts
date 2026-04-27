/**
 * MiniDev ONE Template - Motion & Animation System
 * 
 * Spring physics, easing functions, gestures, transitions, and animations.
 */

import {} from '@/lib/logger';

// =============================================================================
// EASING FUNCTIONS
// =============================================================================
export interface EasingFunction {
  (t: number): number;
}

export const EASING = {
  // Linear
  linear: (t: number) => t,

  // Quadratic
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quartic
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  // Quintic
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

  // Sinusoidal
  easeInSine: (t: number) => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t: number) => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Exponential
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  // Circular
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  easeOutCirc: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeInOutCirc: (t: number) => {
    if (t < 0.5) return (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2;
    return (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  },

  // Back (overshoot)
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    if (t < 0.5) return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
    return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
  },
  easeInElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3);
  },
  easeInOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2;
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1;
  },

  // Bounce
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeInBounce: (t: number) => 1 - EASING.easeOutBounce(1 - t),
  easeInOutBounce: (t: number) => t < 0.5 ? (1 - EASING.easeOutBounce(1 - 2 * t)) / 2 : (1 + EASING.easeOutBounce(2 * t - 1)) / 2,

  // Spring presets
  spring: (t: number) => 1 - Math.pow(Math.cos(t * Math.PI * 4), 3),
  springIn: (t: number) => Math.pow(t, 3) * Math.cos(t * Math.PI * 4),
  springOut: (t: number) => 1 - Math.pow(1 - t, 3) * Math.abs(Math.sin(t * Math.PI * 4)),
};

// =============================================================================
// SPRING PHYSICS
// =============================================================================
export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  velocity?: number;
  precision?: number;
}

export interface SpringValue {
  value: number;
  velocity: number;
  target: number;
  finished: boolean;
}

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  stiff: { stiffness: 210, damping: 20, mass: 1 },
  slow: { stiffness: 280, damping: 60, mass: 1 },
  molly: { stiffness: 200, damping: 25, mass: 1 },
  dramatic: { stiffness: 200, damping: 10, mass: 1 },
  bouncy: { stiffness: 400, damping: 10, mass: 1 },
  fragile: { stiffness: 100, damping: 15, mass: 1 },
  snappy: { stiffness: 500, damping: 30, mass: 1 },
  none: { stiffness: 0, damping: 1, mass: 1 },
};

export class Spring {
  config: SpringConfig;
  value: SpringValue;

  constructor(config: Partial<SpringConfig> = {}) {
    this.config = {
      stiffness: 170,
      damping: 26,
      mass: 1,
      precision: 0.01,
      ...config,
    };
    this.value = {
      value: 0,
      velocity: 0,
      target: 0,
      finished: true,
    };
  }

  setTarget(target: number): void {
    this.value.target = target;
    this.value.finished = false;
  }

  setValue(value: number): void {
    this.value.value = value;
    this.value.velocity = 0;
  }

  update(deltaTime: number = 1 / 60): SpringValue {
    const { stiffness, damping, mass, precision = 0.01 } = this.config;
    const { value, velocity, target } = this.value;

    // Skip if already finished
    if (this.value.finished && target === value) {
      return this.value;
    }

    // Spring physics
    const displacement = value - target;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * velocity;
    const acceleration = (springForce + dampingForce) / mass;

    let newVelocity = velocity + acceleration * deltaTime;
    let newValue = value + newVelocity * deltaTime;

    // Check if animation should finish
    const isAtRest = 
      Math.abs(newVelocity) < precision &&
      Math.abs(newValue - target) < precision;

    if (isAtRest) {
      newValue = target;
      newVelocity = 0;
      this.value.finished = true;
    }

    this.value.value = newValue;
    this.value.velocity = newVelocity;

    return this.value;
  }

  isFinished(): boolean {
    return this.value.finished;
  }
}

// =============================================================================
// ANIMATION TIMELINE
// =============================================================================
export interface Keyframe {
  offset: number;
  [property: string]: any;
}

export interface AnimationOptions {
  duration: number;
  easing?: EasingFunction | keyof typeof EASING;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  delay?: number;
  endDelay?: number;
}

export class Timeline {
  private animations: Map<string, AnimationState> = new Map();
  private startTime: number = 0;
  private isRunning: boolean = false;
  private rafId: number = 0;
  private onUpdate?: ((states: Map<string, AnimationState>) => void) | undefined;
  private onComplete?: (() => void) | undefined;

  createAnimation(
    id: string,
    keyframes: Keyframe[],
    options: AnimationOptions
  ): AnimationState {
    const easingFn = typeof options.easing === 'string' 
      ? EASING[options.easing as keyof typeof EASING] || EASING.linear
      : options.easing || EASING.linear;

    const state: AnimationState = {
      id,
      keyframes,
      options,
      easing: easingFn,
      progress: 0,
      currentTime: 0,
      phase: 'idle',
    };

    this.animations.set(id, state);
    return state;
  }

  play(id?: string): void {
    if (id) {
      const anim = this.animations.get(id);
      if (anim && anim.phase !== 'running') {
        anim.phase = 'running';
        anim.currentTime = 0;
        anim.progress = 0;
      }
    } else {
      this.isRunning = true;
      this.startTime = performance.now();
      this.tick();
    }
  }

  pause(id?: string): void {
    if (id) {
      const anim = this.animations.get(id);
      if (anim) anim.phase = 'paused';
    } else {
      this.isRunning = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  stop(id?: string): void {
    if (id) {
      const anim = this.animations.get(id);
      if (anim) {
        anim.phase = 'idle';
        anim.progress = 0;
        anim.currentTime = 0;
      }
    } else {
      this.pause();
      this.animations.forEach(a => {
        a.phase = 'idle';
        a.progress = 0;
        a.currentTime = 0;
      });
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;

    let allComplete = true;

    this.animations.forEach((anim) => {
      if (anim.phase !== 'running') return;

      const { duration, delay = 0, iterations = 1, direction = 'normal' } = anim.options;
      let time = elapsed - delay;

      if (time < 0) return;
      allComplete = false;

      // Calculate progress
      let progress = Math.min(time / duration, iterations);
      
      if (iterations !== 1) {
        progress = progress % 1;
        if (direction === 'reverse') {
          progress = 1 - progress;
        } else if (direction === 'alternate') {
          const iteration = Math.floor(time / duration);
          if (iteration % 2 === 1) progress = 1 - progress;
        }
      }

      anim.progress = progress;
      anim.currentTime = time;

      if (progress >= 1) {
        anim.phase = 'complete';
      }
    });

    this.onUpdate?.(this.animations);

    if (allComplete) {
      this.isRunning = false;
      this.onComplete?.();
    } else {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  on(event: 'update' | 'complete', callback: (...args: any[]) => void): void {
    if (event === 'update') {
      this.onUpdate = callback as any;
    } else {
      this.onComplete = callback as any;
    }
  }

  getState(id: string): AnimationState | undefined {
    return this.animations.get(id);
  }
}

interface AnimationState {
  id: string;
  keyframes: Keyframe[];
  options: AnimationOptions;
  easing: EasingFunction;
  progress: number;
  currentTime: number;
  phase: 'idle' | 'running' | 'paused' | 'complete';
}

// =============================================================================
// CSS TRANSITIONS
// =============================================================================
export class TransitionManager {
  private elements: Map<HTMLElement, TransitionState> = new Map();

  transition(
    element: HTMLElement,
    properties: Record<string, { from: any; to: any; duration: number; easing?: EasingFunction }>,
    onComplete?: (() => void) | undefined
  ): void {
    const state: TransitionState = {
      element,
      properties,
      startTime: performance.now(),
      duration: Math.max(...Object.values(properties).map(p => p.duration)),
      onComplete,
    };

    // Set initial values
    Object.entries(properties).forEach(([prop, { from }]) => {
      this.setStyle(element, prop, from);
    });

    // Force reflow
    element.offsetHeight;

    this.elements.set(element, state);
    this.tick();
  }

  private setStyle(el: HTMLElement, prop: string, value: any): void {
    const camelProp = prop.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
    (el.style as any)[camelProp] = value;
  }

  private tick = (): void => {
    const now = performance.now();
    const toRemove: HTMLElement[] = [];

    this.elements.forEach((state, element) => {
      const elapsed = now - state.startTime;
      const progress = Math.min(elapsed / state.duration, 1);

      Object.entries(state.properties).forEach(([prop, config]) => {
        const easedProgress = config.easing ? config.easing(progress) : progress;
        const value = this.interpolate(config.from, config.to, easedProgress);
        this.setStyle(element, prop, value);
      });

      if (progress >= 1) {
        toRemove.push(element);
        state.onComplete?.();
      }
    });

    toRemove.forEach(el => this.elements.delete(el));

    if (this.elements.size > 0) {
      requestAnimationFrame(this.tick);
    }
  };

  private interpolate(from: any, to: any, progress: number): any {
    if (typeof from === 'number' && typeof to === 'number') {
      return from + (to - from) * progress;
    }
    if (typeof from === 'string' && from.startsWith('rgb') && typeof to === 'string') {
      // Parse and interpolate colors
      const fromRgb = this.parseRgb(from);
      const toRgb = this.parseRgb(to);
      if (fromRgb && toRgb) {
        const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress);
        const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress);
        const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return progress < 0.5 ? from : to;
  }

  private parseRgb(str: string): { r: number; g: number; b: number } | null {
    const match = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match ? { r: +match[1], g: +match[2], b: +match[3] } : null;
  }
}

interface TransitionState {
  element: HTMLElement;
  properties: Record<string, { from: any; to: any; duration: number; easing?: EasingFunction }>;
  startTime: number;
  duration: number;
  onComplete?: (() => void) | undefined;
}

// =============================================================================
// ANIMATED LIST
// =============================================================================
export class AnimatedList {
  private container: HTMLElement;
  private items: HTMLElement[] = [];
  private spring: Spring;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.spring = new Spring(SPRING_PRESETS.snappy);
  }

  add(element: HTMLElement, options: { animated?: boolean } = {}): void {
    this.container.appendChild(element);
    this.items.push(element);

    if (options.animated) {
      const rect = element.getBoundingClientRect();
      element.style.transform = `translateY(-${rect.height}px)`;
      element.style.opacity = '0';
      
      requestAnimationFrame(() => {
        this.animateIn(element);
      });
    }
  }

  remove(element: HTMLElement, options: { animated?: boolean } = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!options.animated) {
        this.container.removeChild(element);
        this.items = this.items.filter(el => el !== element);
        resolve();
        return;
      }

      this.animateOut(element).then(() => {
        this.container.removeChild(element);
        this.items = this.items.filter(el => el !== element);
        resolve();
      });
    });
  }

  reorder(options: { animated?: boolean } = {}): void {
    if (options.animated) {
      this.items.forEach((item, i) => {
        item.style.transition = 'transform 0.3s ease';
        item.style.transform = '';
      });
    }
  }

  private animateIn(element: HTMLElement): void {
    const startTime = performance.now();
    const duration = 300;
    const startY = parseInt(element.style.transform.match(/-?\d+/)?.[0] || '0');

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = EASING.easeOutCubic(progress);

      element.style.transform = `translateY(${startY * (1 - eased)}px)`;
      element.style.opacity = String(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private animateOut(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 200;
      const startOpacity = parseFloat(element.style.opacity || '1');

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = EASING.easeInCubic(progress);

        element.style.opacity = String(startOpacity * (1 - eased));
        element.style.transform = `scale(${1 - eased * 0.2})`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
}

// =============================================================================
// STAGGER ANIMATIONS
// =============================================================================
export class StaggerAnimation {
  private items: HTMLElement[] = [];
  private config: {
    duration: number;
    stagger: number;
    easing: EasingFunction;
    direction: 'in' | 'out' | 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  };

  constructor(items: HTMLElement[], config: Partial<typeof StaggerAnimation.defaultConfig> = {}) {
    this.items = items;
    this.config = { ...StaggerAnimation.defaultConfig, ...config };
  }

  static defaultConfig = {
    duration: 400,
    stagger: 100,
    easing: EASING.easeOutCubic,
    direction: 'up' as const,
  };

  play(): void {
    this.items.forEach((item, index) => {
      setTimeout(() => this.animateItem(item), index * this.config.stagger);
    });
  }

  private animateItem(element: HTMLElement): void {
    const { duration, easing, direction } = this.config;
    const startTime = performance.now();
    
    const transforms: Record<string, { from: string; to: string }> = {
      up: { from: 'translateY(30px)', to: 'translateY(0)' },
      down: { from: 'translateY(-30px)', to: 'translateY(0)' },
      left: { from: 'translateX(30px)', to: 'translateX(0)' },
      right: { from: 'translateX(-30px)', to: 'translateX(0)' },
      scale: { from: 'scale(0.8)', to: 'scale(1)' },
      fade: { from: '0', to: '1' },
      in: { from: 'scale(0) rotate(-10deg)', to: 'scale(1) rotate(0)' },
      out: { from: 'scale(1) rotate(0)', to: 'scale(0) rotate(10deg)' },
    };

    const transform = transforms[direction] || transforms.up;
    
    if (direction === 'fade') {
      element.style.opacity = '0';
    } else {
      element.style.transform = transform.from;
    }
    element.style.opacity = '0';

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);

      if (direction === 'fade') {
        element.style.opacity = String(eased);
      } else {
        element.style.transform = transform.to;
        element.style.opacity = String(eased);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
}

// =============================================================================
// PREFERENCES
// =============================================================================
export class MotionPreference {
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static get(): 'full' | 'reduced' | 'none' {
    if (typeof window === 'undefined') return 'full';
    if (this.prefersReducedMotion()) return 'reduced';
    return 'full';
  }

  static onChange(callback: (prefers: 'full' | 'reduced' | 'none') => void): () => void {
    if (typeof window === 'undefined') return () => {};
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => callback(this.get());
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  EASING,
  Spring,
  SPRING_PRESETS,
  Timeline,
  TransitionManager,
  AnimatedList,
  StaggerAnimation,
  MotionPreference,
};