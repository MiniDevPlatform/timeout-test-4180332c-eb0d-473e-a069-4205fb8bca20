/**
 * MiniDev ONE Template - Pre-built Animations & Effects
 * 
 * Ready-to-use animations for common UI patterns.
 */

import { EASING } from './motion';

// =============================================================================
// ENTRANCE ANIMATIONS
// =============================================================================
export const entranceAnimations = {
  fadeIn: {
    keyframes: [
      { offset: 0, opacity: 0 },
      { offset: 1, opacity: 1 },
    ],
    options: { duration: 400, easing: 'easeOut' },
  },

  fadeInUp: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translateY(20px)' },
      { offset: 1, opacity: 1, transform: 'translateY(0)' },
    ],
    options: { duration: 400, easing: 'easeOut' },
  },

  fadeInDown: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translateY(-20px)' },
      { offset: 1, opacity: 1, transform: 'translateY(0)' },
    ],
    options: { duration: 400, easing: 'easeOut' },
  },

  fadeInLeft: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translateX(20px)' },
      { offset: 1, opacity: 1, transform: 'translateX(0)' },
    ],
    options: { duration: 400, easing: 'easeOut' },
  },

  fadeInRight: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translateX(-20px)' },
      { offset: 1, opacity: 1, transform: 'translateX(0)' },
    ],
    options: { duration: 400, easing: 'easeOut' },
  },

  zoomIn: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'scale(0.8)' },
      { offset: 1, opacity: 1, transform: 'scale(1)' },
    ],
    options: { duration: 400, easing: 'easeOut' },
  },

  bounceIn: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'scale(0.3)' },
      { offset: 0.5, opacity: 1, transform: 'scale(1.05)' },
      { offset: 0.7, transform: 'scale(0.95)' },
      { offset: 1, transform: 'scale(1)' },
    ],
    options: { duration: 600, easing: 'easeOut' },
  },

  slideInUp: {
    keyframes: [
      { offset: 0, transform: 'translateY(100%)' },
      { offset: 1, transform: 'translateY(0)' },
    ],
    options: { duration: 500, easing: 'easeOutCubic' },
  },

  flipInX: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'rotateX(-90deg)' },
      { offset: 1, opacity: 1, transform: 'rotateX(0)' },
    ],
    options: { duration: 500, easing: 'easeOut' },
  },

  flipInY: {
    keyframes: [
      { offset: 0, opacity: 0, transform: 'rotateY(-90deg)' },
      { offset: 1, opacity: 1, transform: 'rotateY(0)' },
    ],
    options: { duration: 500, easing: 'easeOut' },
  },
};

// =============================================================================
// EXIT ANIMATIONS
// =============================================================================
export const exitAnimations = {
  fadeOut: {
    keyframes: [
      { offset: 0, opacity: 1 },
      { offset: 1, opacity: 0 },
    ],
    options: { duration: 300, easing: 'easeIn' },
  },

  fadeOutUp: {
    keyframes: [
      { offset: 0, opacity: 1, transform: 'translateY(0)' },
      { offset: 1, opacity: 0, transform: 'translateY(-20px)' },
    ],
    options: { duration: 300, easing: 'easeIn' },
  },

  fadeOutDown: {
    keyframes: [
      { offset: 0, opacity: 1, transform: 'translateY(0)' },
      { offset: 1, opacity: 0, transform: 'translateY(20px)' },
    ],
    options: { duration: 300, easing: 'easeIn' },
  },

  zoomOut: {
    keyframes: [
      { offset: 0, opacity: 1, transform: 'scale(1)' },
      { offset: 1, opacity: 0, transform: 'scale(0.8)' },
    ],
    options: { duration: 300, easing: 'easeIn' },
  },

  slideOutDown: {
    keyframes: [
      { offset: 0, transform: 'translateY(0)' },
      { offset: 1, transform: 'translateY(100%)' },
    ],
    options: { duration: 300, easing: 'easeInCubic' },
  },
};

// =============================================================================
// ATTENTION ANIMATIONS
// =============================================================================
export const attentionAnimations = {
  pulse: {
    keyframes: [
      { offset: 0, transform: 'scale(1)', opacity: 1 },
      { offset: 0.5, transform: 'scale(1.05)', opacity: 0.8 },
      { offset: 1, transform: 'scale(1)', opacity: 1 },
    ],
    options: { duration: 1000, iterations: Infinity },
  },

  bounce: {
    keyframes: [
      { offset: 0, transform: 'translateY(0)' },
      { offset: 0.5, transform: 'translateY(-10px)' },
      { offset: 1, transform: 'translateY(0)' },
    ],
    options: { duration: 600, iterations: Infinity },
  },

  shake: {
    keyframes: [
      { offset: 0, transform: 'translateX(0)' },
      { offset: 0.25, transform: 'translateX(-5px)' },
      { offset: 0.5, transform: 'translateX(5px)' },
      { offset: 0.75, transform: 'translateX(-5px)' },
      { offset: 1, transform: 'translateX(0)' },
    ],
    options: { duration: 400, iterations: Infinity },
  },

  wobble: {
    keyframes: [
      { offset: 0, transform: 'rotate(0deg)' },
      { offset: 0.25, transform: 'rotate(-3deg)' },
      { offset: 0.75, transform: 'rotate(3deg)' },
      { offset: 1, transform: 'rotate(0deg)' },
    ],
    options: { duration: 500, iterations: Infinity },
  },

  swing: {
    keyframes: [
      { offset: 0, transform: 'rotate(0deg)', transformOrigin: 'top center' },
      { offset: 0.5, transform: 'rotate(15deg)', transformOrigin: 'top center' },
      { offset: 1, transform: 'rotate(0deg)', transformOrigin: 'top center' },
    ],
    options: { duration: 800, iterations: Infinity },
  },

  ping: {
    keyframes: [
      { offset: 0, transform: 'scale(1)', opacity: 1 },
      { offset: 1, transform: 'scale(2)', opacity: 0 },
    ],
    options: { duration: 1000, iterations: Infinity, easing: 'easeOut' },
  },

  spin: {
    keyframes: [{ offset: 0, transform: 'rotate(0deg)' }, { offset: 1, transform: 'rotate(360deg)' }],
    options: { duration: 1000, iterations: Infinity },
  },

  jello: {
    keyframes: [
      { offset: 0, transform: 'scale3d(1, 1, 1)' },
      { offset: 0.111, transform: 'scale3d(1.05, 0.95, 1)' },
      { offset: 0.222, transform: 'scale3d(0.95, 1.05, 1)' },
      { offset: 0.333, transform: 'scale3d(1.05, 0.95, 1)' },
      { offset: 0.444, transform: 'scale3d(0.95, 1.05, 1)' },
      { offset: 0.555, transform: 'scale3d(1.02, 0.98, 1)' },
      { offset: 0.666, transform: 'scale3d(0.98, 1.02, 1)' },
      { offset: 0.777, transform: 'scale3d(1.01, 0.99, 1)' },
      { offset: 1, transform: 'scale3d(1, 1, 1)' },
    ],
    options: { duration: 900, iterations: Infinity },
  },
};

// =============================================================================
// INTERACTION ANIMATIONS
// =============================================================================
export const interactionAnimations = {
  hoverLift: {
    styles: {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    transition: { duration: 200, easing: 'easeOut' },
  },

  hoverGrow: {
    styles: { transform: 'scale(1.02)' },
    transition: { duration: 200, easing: 'easeOut' },
  },

  hoverShrink: {
    styles: { transform: 'scale(0.98)' },
    transition: { duration: 200, easing: 'easeIn' },
  },

  press: {
    styles: { transform: 'scale(0.95)' },
    transition: { duration: 100, easing: 'easeIn' },
  },

  ripple: {
    transition: { duration: 600, easing: 'easeOut' },
    selector: '.ripple-effect',
    styles: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.5)',
      transform: 'scale(0)',
      animation: 'ripple 0.6s linear',
    },
  },
};

// =============================================================================
// BACKGROUND EFFECTS
// =============================================================================
export const backgroundEffects = {
  gradientShift: {
    background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    backgroundSize: '400% 400%',
    animation: 'gradient 15s ease infinite',
  },

  shimmer: {
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
  },

  pulse: {
    background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.05) 100%)',
    animation: 'pulse 2s infinite',
  },

  float: {
    animation: 'float 3s ease-in-out infinite',
  },
};

// =============================================================================
// TEXT EFFECTS
// =============================================================================
export const textEffects = {
  typewriter: {
    animation: 'typewriter 3s steps(30) 1s forwards, blink 0.75s step-end infinite',
  },

  typewriterSmooth: {
    animation: 'typewriter 2s steps(20) forwards',
  },

  gradient: {
    background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)',
    backgroundSize: '200% auto',
    animation: 'gradient 3s linear infinite',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  blurIn: {
    animation: 'blurIn 0.5s ease-out forwards',
  },

  splitIn: {
    animation: 'splitIn 0.5s ease-out forwards',
  },
};

// =============================================================================
// LOADING ANIMATIONS
// =============================================================================
export const loadingAnimations = {
  dots: {
    html: `<span class="loading-dots"><span></span><span></span><span></span></span>`,
    styles: `
      .loading-dots { display: inline-flex; gap: 4px; }
      .loading-dots span { width: 8px; height: 8px; background: currentColor; border-radius: 50%; animation: dot-bounce 1.4s infinite ease-in-out both; }
      .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    `,
  },

  spinner: {
    html: `<div class="loading-spinner"></div>`,
    styles: `
      .loading-spinner { width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  },

  bars: {
    html: `<div class="loading-bars"><span></span><span></span><span></span><span></span></div>`,
    styles: `
      .loading-bars { display: inline-flex; gap: 4px; align-items: flex-end; }
      .loading-bars span { width: 4px; height: 16px; background: currentColor; animation: bar-bounce 1s infinite ease-in-out; }
      .loading-bars span:nth-child(1) { animation-delay: -0.4s; }
      .loading-bars span:nth-child(2) { animation-delay: -0.3s; }
      .loading-bars span:nth-child(3) { animation-delay: -0.2s; }
      .loading-bars span:nth-child(4) { animation-delay: -0.1s; }
      @keyframes bar-bounce { 0%, 100% { height: 8px; } 50% { height: 16px; } }
    `,
  },

  pulse: {
    html: `<div class="loading-pulse"></div>`,
    styles: `
      .loading-pulse { width: 24px; height: 24px; background: currentColor; border-radius: 50%; animation: pulse 1s infinite ease-in-out; }
      @keyframes pulse { 0%, 100% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } }
    `,
  },
};

// =============================================================================
// ANIMATION CONTROLLER
// =============================================================================
export class AnimationController {
  private elements: Map<HTMLElement, string> = new Map();
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.injectStyles();
  }

  private injectStyles(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes shimmer {
        100% { background-position: -200% 0; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
      }
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      @keyframes blink {
        50% { border-color: transparent; }
      }
      @keyframes blurIn {
        from { filter: blur(10px); opacity: 0; }
        to { filter: blur(0); opacity: 1; }
      }
      @keyframes splitIn {
        from { clip-path: inset(0 100% 0 0); }
        to { clip-path: inset(0 0 0 0); }
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  animate(element: HTMLElement, animation: keyof typeof entranceAnimations | keyof typeof exitAnimations | keyof typeof attentionAnimations, options: { duration?: number; delay?: number; onComplete?: () => void } = {}): void {
    const animations = { ...entranceAnimations, ...exitAnimations, ...attentionAnimations };
    const config = animations[animation as keyof typeof animations];

    if (!config) {
      console.warn(`Animation "${animation}" not found`);
      return;
    }

    const duration = options.duration ?? config.options.duration;
    const delay = options.delay ?? 0;
    const easing = (config.options as any).easing || 'ease';
    const initialTransform = (config.keyframes[0] as any).transform || '';

    element.style.opacity = '0';
    element.style.transform = initialTransform;
    element.style.transition = 'none';

    setTimeout(() => {
      element.style.opacity = '';
      element.style.transform = '';
      element.style.transition = `all ${duration}ms ${easing}`;

      setTimeout(() => {
        options.onComplete?.();
      }, duration);
    }, delay);
  }

  staggerAnimate(elements: HTMLElement[], animation: keyof typeof entranceAnimations, options: { stagger?: number; duration?: number } = {}): void {
    const { stagger = 100, duration = 400 } = options;

    elements.forEach((el, index) => {
      this.animate(el, animation, { delay: index * stagger, duration });
    });
  }

  applyHoverEffect(element: HTMLElement, effect: keyof typeof interactionAnimations): void {
    const config = interactionAnimations[effect];
    if (!config) return;

    if (config.transition) {
      element.style.transition = `all ${config.transition.duration}ms ${config.transition.easing}`;
    }

    element.addEventListener('mouseenter', () => {
      if (config.styles) {
        Object.assign(element.style, config.styles);
      }
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
      element.style.boxShadow = '';
    });
  }

  applyBackgroundEffect(element: HTMLElement, effect: keyof typeof backgroundEffects): void {
    const config = backgroundEffects[effect];
    Object.assign(element.style, config);
  }

  applyTextEffect(element: HTMLElement, effect: keyof typeof textEffects): void {
    const config = textEffects[effect];
    Object.assign(element.style, config);
  }

  loading(type: keyof typeof loadingAnimations): string {
    return loadingAnimations[type].html;
  }
}

// =============================================================================
// MORPH ANIMATIONS
// =============================================================================
export class MorphAnimation {
  private element: HTMLElement;
  private morphs: Map<string, { path: string; duration: number }> = new Map();

  constructor(element: HTMLElement) {
    this.element = element;
  }

  addMorph(name: string, path: string, duration: number = 300): void {
    this.morphs.set(name, { path, duration });
  }

  morph(name: string, options: { easing?: string; onComplete?: () => void } = {}): void {
    const morph = this.morphs.get(name);
    if (!morph) return;

    const { easing = 'easeInOut', onComplete } = options;

    if (this.element.tagName === 'svg') {
      // SVG path morphing
      this.element.style.transition = `d ${morph.duration}ms ${easing}`;
      (this.element as unknown as SVGPathElement).setAttribute('d', morph.path);
    } else {
      // CSS shape morphing
      this.element.style.transition = `all ${morph.duration}ms ${easing}`;
      // Apply as clip-path or other CSS property
    }

    setTimeout(() => {
      onComplete?.();
    }, morph.duration);
  }
}

// =============================================================================
// PARALLAX EFFECT
// =============================================================================
export class ParallaxEffect {
  private container: HTMLElement;
  private layers: Map<HTMLElement, number> = new Map();
  private rafId: number = 0;
  private enabled: boolean = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    const layerElements = this.container.querySelectorAll('[data-parallax]');
    layerElements.forEach((el) => {
      const speed = parseFloat((el as HTMLElement).dataset.parallax || '0.5');
      this.layers.set(el as HTMLElement, speed);
    });

    this.bindScroll();
  }

  private bindScroll(): void {
    const onScroll = () => {
      if (!this.enabled) return;

      const rect = this.container.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenterY = window.innerHeight / 2;
      const offset = centerY - viewportCenterY;

      this.layers.forEach((speed, element) => {
        const translateY = offset * speed * -1;
        element.style.transform = `translateY(${translateY}px)`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.layers.clear();
  }
}

// =============================================================================
// SCROLL REVEAL
// =============================================================================
export class ScrollReveal {
  private container: HTMLElement | Document;
  private observer: IntersectionObserver | null = null;
  private animated: Set<Element> = new Set();

  constructor(container: HTMLElement | Document = document) {
    this.container = container;
    this.init();
  }

  private init(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animated.has(entry.target)) {
            this.animated.add(entry.target);
            this.animate(entry.target as HTMLElement);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = (this.container as HTMLElement).querySelectorAll('[data-reveal]');
    elements.forEach((el) => this.observer?.observe(el));
  }

  private animate(element: HTMLElement): void {
    const animation = (element as HTMLElement).dataset.reveal || 'fadeInUp';
    const duration = parseInt((element as HTMLElement).dataset.revealDuration || '400');
    const delay = parseInt((element as HTMLElement).dataset.revealDelay || '0');

    element.style.opacity = '0';
    element.style.transition = `all ${duration}ms ease ${delay}ms`;

    requestAnimationFrame(() => {
      element.style.opacity = '';
    });
  }

  observe(element: HTMLElement): void {
    this.observer?.observe(element);
  }

  destroy(): void {
    this.observer?.disconnect();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  entranceAnimations,
  exitAnimations,
  attentionAnimations,
  interactionAnimations,
  backgroundEffects,
  textEffects,
  loadingAnimations,
  AnimationController,
  MorphAnimation,
  ParallaxEffect,
  ScrollReveal,
};