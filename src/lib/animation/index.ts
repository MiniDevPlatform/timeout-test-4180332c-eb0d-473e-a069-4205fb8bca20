/**
 * MiniDev ONE Template - Animation System
 * 
 * Tweening, keyframes, sprites, and transitions.
 */

import { FEATURES } from '@/lib/config';

// =============================================================================
// TYPES
// =============================================================================
type EasingFunction = (t: number) => number;

interface TweenOptions {
  duration: number;
  easing?: EasingFunction;
  loop?: boolean;
  yoyo?: boolean;
  delay?: number;
  onStart?: () => void;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
  onRepeat?: () => void;
}

interface Keyframe {
  time: number;
  value: any;
  easing?: EasingFunction;
}

interface Animation {
  id: string;
  target: any;
  property: string;
  from: any;
  to: any;
  duration: number;
  elapsed: number;
  easing: EasingFunction;
  loop: boolean;
  yoyo: boolean;
  delay: number;
  direction: 1 | -1;
  onStart?: () => void;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
  onRepeat?: () => void;
  active: boolean;
  paused: boolean;
}

// =============================================================================
// EASING FUNCTIONS
// =============================================================================
const Easings = {
  // Linear
  linear: (t: number) => t,

  // Quadratic
  quadIn: (t: number) => t * t,
  quadOut: (t: number) => t * (2 - t),
  quadInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  cubicIn: (t: number) => t * t * t,
  cubicOut: (t: number) => (--t) * t * t + 1,
  cubicInOut: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quartic
  quartIn: (t: number) => t * t * t * t,
  quartOut: (t: number) => 1 - (--t) * t * t * t,
  quartInOut: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  // Quintic
  quintIn: (t: number) => t * t * t * t * t,
  quintOut: (t: number) => 1 + (--t) * t * t * t * t,
  quintInOut: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

  // Sine
  sineIn: (t: number) => 1 - Math.cos(t * Math.PI / 2),
  sineOut: (t: number) => Math.sin(t * Math.PI / 2),
  sineInOut: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Exponential
  expoIn: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  expoOut: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  expoInOut: (t: number) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,

  // Circ
  circIn: (t: number) => 1 - Math.sqrt(1 - t * t),
  circOut: (t: number) => Math.sqrt(1 - (--t) * t),
  circInOut: (t: number) => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1) / 2,

  // Elastic
  elasticIn: (t: number) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3),
  elasticOut: (t: number) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
  elasticInOut: (t: number) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.625) * (2 * Math.PI) / 4.5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.625) * (2 * Math.PI) / 4.5)) / 2 + 1,

  // Back
  backIn: (t: number) => { const c1 = 1.70158; const c3 = c1 + 1; return c3 * t * t * t - c1 * t * t; },
  backOut: (t: number) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * (t - 1) * (t - 1) * (t - 1) + c1 * (t - 1) * (t - 1); },
  backInOut: (t: number) => { const c1 = 1.70158; const c2 = c1 * 1.525; return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2; },

  // Bounce
  bounceOut: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  bounceIn: (t: number) => 1 - Easings.bounceOut(1 - t),
  bounceInOut: (t: number) => t < 0.5 ? (1 - Easings.bounceOut(1 - 2 * t)) / 2 : (1 + Easings.bounceOut(2 * t - 1)) / 2,
};

// =============================================================================
// TWEEN MANAGER
// =============================================================================
class TweenManager {
  private animations: Map<string, Animation> = new Map();
  private globalTimeScale: number = 1;
  private paused: boolean = false;

  create(target: any, property: string, to: any, options: TweenOptions): string {
    const id = `tween_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const animation: Animation = {
      id,
      target,
      property,
      from: target[property],
      to,
      duration: options.duration * 1000,
      elapsed: 0,
      easing: options.easing || Easings.linear,
      loop: options.loop || false,
      yoyo: options.yoyo || false,
      delay: (options.delay || 0) * 1000,
      direction: 1,
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
      onRepeat: options.onRepeat,
      active: true,
      paused: false,
    };

    this.animations.set(id, animation);
    return id;
  }

  // Shortcut methods
  fadeIn(target: any, duration: number = 0.3, onComplete?: () => void): string {
    target.opacity = 0;
    return this.to(target, 'opacity', 1, { duration, easing: Easings.quadOut, onComplete });
  }

  fadeOut(target: any, duration: number = 0.3, onComplete?: () => void): string {
    return this.to(target, 'opacity', 0, { duration, easing: Easings.quadOut, onComplete });
  }

  scaleTo(target: any, scale: number, duration: number = 0.3): string {
    return this.to(target, 'scale', scale, { duration, easing: Easings.backOut });
  }

  moveTo(target: any, x: number, y: number, duration: number = 0.3): string {
    const idX = this.to(target, 'x', x, { duration, easing: Easings.quadOut });
    const idY = this.to(target, 'y', y, { duration, easing: Easings.quadOut });
    return idX; // Return first, you can track both
  }

  rotateTo(target: any, rotation: number, duration: number = 0.3): string {
    return this.to(target, 'rotation', rotation, { duration, easing: Easings.quadOut });
  }

  shake(target: any, intensity: number = 10, duration: number = 0.5): string {
    const originalX = target.x;
    let elapsed = 0;
    
    const interval = setInterval(() => {
      target.x = originalX + (Math.random() - 0.5) * intensity * 2;
      elapsed += 16;
      if (elapsed >= duration * 1000) {
        target.x = originalX;
        clearInterval(interval);
      }
    }, 16);

    return `shake_${Date.now()}`;
  }

  pulse(target: any, scale: number = 1.1, duration: number = 0.3): string {
    return this.to(target, 'scale', scale, {
      duration,
      easing: Easings.sineInOut,
      yoyo: true,
      loop: true,
    });
  }

  // Generic tween
  to(target: any, property: string, to: any, options: Omit<TweenOptions, 'onComplete'> & { onComplete?: () => void }): string {
    return this.create(target, property, to, options);
  }

  // Timeline
  timeline(steps: Array<{ target: any; property: string; to: any; duration: number; delay?: number }>, options?: { loop?: boolean }): string {
    let currentDelay = 0;
    const ids: string[] = [];

    for (const step of steps) {
      this.create(step.target, step.property, step.to, {
        duration: step.duration,
        delay: (step.delay || 0) + currentDelay,
      });
      currentDelay += step.duration + (step.delay || 0);
      ids.push(`step_${ids.length}`);
    }

    return ids[0]; // Return first ID
  }

  update(dt: number): void {
    if (this.paused) return;

    const scaledDt = dt * 1000 * this.globalTimeScale;

    for (const [id, anim] of this.animations) {
      if (!anim.active || anim.paused) continue;

      // Apply delay
      if (anim.delay > 0) {
        anim.delay -= scaledDt;
        continue;
      }

      anim.elapsed += scaledDt;

      // Calculate progress
      let progress = Math.min(anim.elapsed / anim.duration, 1);

      // Apply easing
      progress = anim.easing(progress);

      // Apply yoyo direction
      if (anim.yoyo && anim.direction === -1) {
        progress = 1 - progress;
      }

      // Interpolate value
      const from = anim.from;
      const to = anim.to;
      let value: any;

      if (typeof from === 'number' && typeof to === 'number') {
        value = from + (to - from) * progress;
      } else if (typeof from === 'string' && typeof to === 'string') {
        // Color interpolation
        value = this.interpolateColor(from, to, progress);
      } else {
        value = progress < 0.5 ? from : to;
      }

      // Apply to target
      anim.target[anim.property] = value;

      // Callback
      anim.onUpdate?.(value);

      // Check completion
      if (anim.elapsed >= anim.duration) {
        if (anim.loop) {
          anim.elapsed = 0;
          if (anim.yoyo) {
            anim.direction = anim.direction === 1 ? -1 : 1;
            [anim.from, anim.to] = [anim.to, anim.from];
          }
          anim.onRepeat?.();
        } else {
          anim.active = false;
          anim.onComplete?.();
        }
      }
    }

    // Clean up completed animations
    for (const [id, anim] of this.animations) {
      if (!anim.active) {
        this.animations.delete(id);
      }
    }
  }

  private interpolateColor(from: string, to: string, progress: number): string {
    const fromRGB = this.hexToRGB(from);
    const toRGB = this.hexToRGB(to);
    
    const r = Math.round(fromRGB.r + (toRGB.r - fromRGB.r) * progress);
    const g = Math.round(fromRGB.g + (toRGB.g - fromRGB.g) * progress);
    const b = Math.round(fromRGB.b + (toRGB.b - fromRGB.b) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRGB(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }

  pause(id?: string): void {
    if (id) {
      this.animations.get(id)!.paused = true;
    } else {
      this.paused = true;
    }
  }

  resume(id?: string): void {
    if (id) {
      this.animations.get(id)!.paused = false;
    } else {
      this.paused = false;
    }
  }

  stop(id: string, complete: boolean = false): void {
    const anim = this.animations.get(id);
    if (anim) {
      if (complete) {
        anim.active = false;
        anim.onComplete?.();
      }
      this.animations.delete(id);
    }
  }

  stopAll(): void {
    this.animations.clear();
  }

  setTimeScale(scale: number): void {
    this.globalTimeScale = scale;
  }

  getTimeScale(): number {
    return this.globalTimeScale;
  }
}

// =============================================================================
// KEYFRAME ANIMATION
// =============================================================================
class KeyframeAnimation {
  private target: any;
  private keyframes: Keyframe[] = [];
  private duration: number = 0;
  private elapsed: number = 0;
  private loop: boolean = false;
  private active: boolean = false;
  private onUpdate?: (values: Record<string, any>) => void;
  private onComplete?: () => void;

  constructor(target: any) {
    this.target = target;
  }

  addKeyframe(property: string, time: number, value: any, easing?: EasingFunction): this {
    this.keyframes.push({ time, value, easing });
    this.duration = Math.max(this.duration, time);
    return this;
  }

  setLoop(loop: boolean): this {
    this.loop = loop;
    return this;
  }

  onUpdate(callback: (values: Record<string, any>) => void): this {
    this.onUpdate = callback;
    return this;
  }

  onComplete(callback: () => void): this {
    this.onComplete = callback;
    return this;
  }

  play(): void {
    this.active = true;
    this.elapsed = 0;
  }

  stop(): void {
    this.active = false;
  }

  update(dt: number): void {
    if (!this.active) return;

    this.elapsed += dt * 1000;

    if (this.elapsed >= this.duration) {
      if (this.loop) {
        this.elapsed = 0;
      } else {
        this.active = false;
        this.onComplete?.();
        return;
      }
    }

    // Find surrounding keyframes for each property
    const values: Record<string, any> = {};
    
    for (const keyframe of this.keyframes) {
      if (keyframe.time <= this.elapsed) {
        values[`kf_${keyframe.time}`] = keyframe.value;
      }
    }

    // Simple interpolation - in production, use proper keyframe logic
    const progress = this.elapsed / this.duration;
    const firstKeyframe = this.keyframes[0];
    const lastKeyframe = this.keyframes[this.keyframes.length - 1];

    if (firstKeyframe && lastKeyframe) {
      this.target.x = this.lerp(firstKeyframe.value.x || 0, lastKeyframe.value.x || 0, progress);
      this.target.y = this.lerp(firstKeyframe.value.y || 0, lastKeyframe.value.y || 0, progress);
      this.target.rotation = this.lerp(firstKeyframe.value.rotation || 0, lastKeyframe.value.rotation || 0, progress);
      this.target.scale = this.lerp(firstKeyframe.value.scale || 1, lastKeyframe.value.scale || 1, progress);
    }

    this.onUpdate?.(values);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}

// =============================================================================
// SPRITE ANIMATION
// =============================================================================
class SpriteAnimation2 {
  private frames: HTMLImageElement[] = [];
  private frameDurations: number[] = [];
  private currentFrame: number = 0;
  private elapsed: number = 0;
  private loop: boolean = true;
  private playing: boolean = false;
  private onComplete?: () => void;
  private onFrameChange?: (frame: number) => void;

  loadFrames(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    })).then(imgs => {
      this.frames = imgs;
    });
  }

  setFrameDuration(index: number, duration: number): this {
    this.frameDurations[index] = duration;
    return this;
  }

  setLoop(loop: boolean): this {
    this.loop = loop;
    return this;
  }

  onComplete(callback: () => void): this {
    this.onComplete = callback;
    return this;
  }

  onFrameChange(callback: (frame: number) => void): this {
    this.onFrameChange = callback;
    return this;
  }

  play(): void {
    this.playing = true;
    this.currentFrame = 0;
    this.elapsed = 0;
  }

  stop(): void {
    this.playing = false;
  }

  reset(): void {
    this.currentFrame = 0;
    this.elapsed = 0;
  }

  update(dt: number): void {
    if (!this.playing || this.frames.length === 0) return;

    const duration = this.frameDurations[this.currentFrame] || 100;
    this.elapsed += dt * 1000;

    if (this.elapsed >= duration) {
      this.elapsed = 0;
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.playing = false;
          this.onComplete?.();
          return;
        }
      }

      this.onFrameChange?.(this.currentFrame);
    }
  }

  getCurrentFrame(): HTMLImageElement | undefined {
    return this.frames[this.currentFrame];
  }

  getCurrentFrameIndex(): number {
    return this.currentFrame;
  }

  isPlaying(): boolean {
    return this.playing;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export { TweenManager, KeyframeAnimation, SpriteAnimation2, Easings };
export default { TweenManager, KeyframeAnimation, Easings };
