/**
 * MiniDev ONE Template - Design System
 * 
 * Comprehensive design tokens, themes, and component styles.
 */

import {} from '@/lib/config';

// =============================================================================
// DESIGN TOKENS
// =============================================================================
export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
      serif: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
      '6xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    px: string;
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
    32: string;
    40: string;
    48: string;
    56: string;
    64: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  shadows: {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

// =============================================================================
// COLOR UTILITIES
// =============================================================================
export class ColorUtils {
  // Hex to RGB
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  // RGB to Hex
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Lighten
  static lighten(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    const amount = Math.round(2.55 * percent);
    
    return this.rgbToHex(
      Math.min(255, r + amount),
      Math.min(255, g + amount),
      Math.min(255, b + amount)
    );
  }

  // Darken
  static darken(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    const amount = Math.round(2.55 * percent);
    
    return this.rgbToHex(
      Math.max(0, r - amount),
      Math.max(0, g - amount),
      Math.max(0, b - amount)
    );
  }

  // Alpha
  static withAlpha(hex: string, alpha: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  // Contrast
  static getContrastColor(hex: string): 'white' | 'black' {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 'black';

    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  }

  // Random color
  static random(saturation: number = 70, lightness: number = 50): string {
    const h = Math.random() * 360;
    return `hsl(${h}, ${saturation}%, ${lightness}%)`;
  }

  // Gradient
  static gradient(colors: string[], angle: number = 0): string {
    return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
  }
}

// =============================================================================
// DESIGN SYSTEM CLASS
// =============================================================================
export class DesignSystem {
  private container: HTMLElement | null = null;
  private tokens: DesignTokens;

  constructor() {
    this.tokens = this.getDefaultTokens();
  }

  private getDefaultTokens(): DesignTokens {
    return {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textMuted: '#64748b',
        border: '#e2e8f0',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      typography: {
        fontFamily: {
          sans: 'Inter, system-ui, sans-serif',
          mono: 'JetBrains Mono, Consolas, monospace',
          serif: 'Georgia, Cambria, serif',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
      spacing: {
        px: '1px',
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
        40: '10rem',
        48: '12rem',
        56: '14rem',
        64: '16rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      shadows: {
        none: 'none',
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      transitions: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      breakpoints: {
        xs: '320px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    };
  }

  // Apply tokens to element
  apply(element: HTMLElement, options: { tokens?: Partial<DesignTokens>; mode?: 'light' | 'dark' } = {}): void {
    const { tokens = {}, mode } = options;
    this.container = element;
    this.tokens = { ...this.tokens, ...tokens };

    const colors = mode === 'dark' ? this.getDarkColors() : this.tokens.colors;

    element.style.setProperty('--color-primary', colors.primary);
    element.style.setProperty('--color-secondary', colors.secondary);
    element.style.setProperty('--color-accent', colors.accent);
    element.style.setProperty('--color-background', colors.background);
    element.style.setProperty('--color-surface', colors.surface);
    element.style.setProperty('--color-text', colors.text);
    element.style.setProperty('--color-text-muted', colors.textMuted);
    element.style.setProperty('--color-border', colors.border);
    element.style.setProperty('--color-success', colors.success);
    element.style.setProperty('--color-warning', colors.warning);
    element.style.setProperty('--color-error', colors.error);
    element.style.setProperty('--color-info', colors.info);

    // Font families
    element.style.setProperty('--font-sans', this.tokens.typography.fontFamily.sans);
    element.style.setProperty('--font-mono', this.tokens.typography.fontFamily.mono);

    // Spacing
    Object.entries(this.tokens.spacing).forEach(([key, value]) => {
      element.style.setProperty(`--spacing-${key}`, value);
    });

    // Border radius
    Object.entries(this.tokens.borderRadius).forEach(([key, value]) => {
      element.style.setProperty(`--radius-${key}`, value);
    });

    // Shadows
    Object.entries(this.tokens.shadows).forEach(([key, value]) => {
      element.style.setProperty(`--shadow-${key}`, value);
    });

    // Transitions
    Object.entries(this.tokens.transitions).forEach(([key, value]) => {
      element.style.setProperty(`--transition-${key}`, value);
    });
  }

  private getDarkColors(): DesignTokens['colors'] {
    return {
      primary: '#818cf8',
      secondary: '#a78bfa',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    };
  }

  // Generate CSS string
  generateCSS(): string {
    return `
      :root {
        --color-primary: ${this.tokens.colors.primary};
        --color-secondary: ${this.tokens.colors.secondary};
        --color-accent: ${this.tokens.colors.accent};
        --color-background: ${this.tokens.colors.background};
        --color-surface: ${this.tokens.colors.surface};
        --color-text: ${this.tokens.colors.text};
        --color-text-muted: ${this.tokens.colors.textMuted};
        --color-border: ${this.tokens.colors.border};
        --color-success: ${this.tokens.colors.success};
        --color-warning: ${this.tokens.colors.warning};
        --color-error: ${this.tokens.colors.error};
        --color-info: ${this.tokens.colors.info};
        
        --font-sans: ${this.tokens.typography.fontFamily.sans};
        --font-mono: ${this.tokens.typography.fontFamily.mono};
        
        --radius-sm: ${this.tokens.borderRadius.sm};
        --radius-md: ${this.tokens.borderRadius.md};
        --radius-lg: ${this.tokens.borderRadius.lg};
        --radius-xl: ${this.tokens.borderRadius.xl};
        --radius-full: ${this.tokens.borderRadius.full};
        
        --shadow-sm: ${this.tokens.shadows.sm};
        --shadow-md: ${this.tokens.shadows.md};
        --shadow-lg: ${this.tokens.shadows.lg};
        --shadow-xl: ${this.tokens.shadows.xl};
        
        --transition-fast: ${this.tokens.transitions.fast};
        --transition-normal: ${this.tokens.transitions.normal};
        --transition-slow: ${this.tokens.transitions.slow};
      }
    `;
  }
}

// =============================================================================
// GRADIENT UTILITIES
// =============================================================================
export class GradientUtils {
  // Linear gradient
  static linear(colors: string[], angle: number = 0): string {
    return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
  }

  // Radial gradient
  static radial(colors: string[], shape: 'circle' | 'ellipse' = 'ellipse'): string {
    return `radial-gradient(${shape}, ${colors.join(', ')})`;
  }

  // Conic gradient
  static conic(colors: string[], fromAngle: number = 0): string {
    return `conic-gradient(from ${fromAngle}deg, ${colors.join(', ')})`;
  }

  // Mesh gradient (visual approximation)
  static mesh(colors: string[]): string {
    return `radial-gradient(at 40% 50%, ${colors[0] || '#6366f1'} 0, transparent 50%),
            radial-gradient(at 80% 0%, ${colors[1] || '#8b5cf6'} 0, transparent 50%),
            radial-gradient(at 0% 100%, ${colors[2] || '#06b6d4'} 0, transparent 50%),
            radial-gradient(at 80% 100%, ${colors[3] || '#22c55e'} 0, transparent 50%)`;
  }

  // Preset gradients
  static presets = {
    sunset: ['#f97316', '#ef4444', '#ec4899'],
    ocean: ['#06b6d4', '#3b82f6', '#8b5cf6'],
    forest: ['#22c55e', '#10b981', '#059669'],
    aurora: ['#6366f1', '#8b5cf6', '#ec4899'],
    midnight: ['#1e1b4b', '#312e81', '#4c1d95'],
    sunrise: ['#fbbf24', '#f97316', '#ef4444'],
    arctic: ['#e0f2fe', '#7dd3fc', '#38bdf8'],
    galaxy: ['#581c87', '#7c3aed', '#a855f7'],
    flame: ['#ef4444', '#f97316', '#fbbf24'],
    mint: ['#10b981', '#34d399', '#6ee7b7'],
  };

  // Get preset
  static getPreset(name: keyof typeof GradientUtils.presets): string {
    const colors = GradientUtils.presets[name];
    return this.linear(colors, 135);
  }
}

// =============================================================================
// BORDER UTILITIES
// =============================================================================
export class BorderUtils {
  // Create dashed border
  static dashed(color: string, width: number = 1, gap: number = 4): string {
    return `${width}px dashed ${color}`;
  }

  // Create gradient border
  static gradient(width: number = 2, colors: string[] = ['#6366f1', '#8b5cf6', '#ec4899']): string {
    return `linear-gradient(${colors.join(', ')}) ${width}px`;
  }

  // Create glow border
  static glow(color: string, intensity: number = 10): string {
    return `0 0 ${intensity}px ${color}`;
  }

  // Create shadow border
  static shadow(offsetX: number, offsetY: number, blur: number, color: string): string {
    return `${offsetX}px ${offsetY}px ${blur}px ${color}`;
  }
}

// =============================================================================
// TYPOGRAPHY UTILITIES
// =============================================================================
export class TypographyUtils {
  // Line clamp
  static lineClamp(lines: number): string {
    return `
      display: -webkit-box;
      -webkit-line-clamp: ${lines};
      -webkit-box-orient: vertical;
      overflow: hidden;
    `;
  }

  // Text gradient
  static gradient(color: string, fallback: string = 'inherit'): string {
    return `
      color: ${color};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    `;
  }

  // Text shadow
  static shadow(color: string, offsetX: number = 1, offsetY: number = 1, blur: number = 1): string {
    return `${offsetX}px ${offsetY}px ${blur}px ${color}`;
  }

  // Font smoothing
  static smooth(): string {
    return `
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    `;
  }

  // Truncate
  static truncate(): string {
    return `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
  }
}

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================
export class AnimationUtils {
  // Keyframe definitions
  static keyframes: Record<string, string> = {
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    fadeOut: `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,
    slideUp: `
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `,
    slideDown: `
      @keyframes slideDown {
        from { transform: translateY(0); }
        to { transform: translateY(100%); }
      }
    `,
    scaleIn: `
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `,
    rotate: `
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    bounce: `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `,
    shimmer: `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
    float: `
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `,
  };

  // Combine animations
  static compose(...animations: string[]): string {
    return animations.map(a => this.keyframes[a] || '').join('\n');
  }
}

// =============================================================================
// GLASS MORPHISM
// =============================================================================
export interface GlassOptions {
  blur?: number;
  brightness?: number;
  saturation?: number;
  opacity?: number;
  color?: string;
  borderOpacity?: number;
  shadowOpacity?: number;
}

export class GlassUtils {
  static apply(element: HTMLElement, options: GlassOptions = {}): void {
    const {
      blur = 10,
      brightness = 1,
      saturation = 1.8,
      opacity = 0.7,
      color = '#ffffff',
      borderOpacity = 0.2,
      shadowOpacity = 0.1,
    } = options;

    element.style.backdropFilter = `blur(${blur}px) brightness(${brightness}) saturate(${saturation})`;
    element.style.background = ColorUtils.withAlpha(color, opacity);
    element.style.border = `1px solid ${ColorUtils.withAlpha(color, borderOpacity)}`;
    element.style.boxShadow = `0 8px 32px ${ColorUtils.withAlpha('#000', shadowOpacity)}`;
  }

  static generateCSS(options: GlassOptions = {}): string {
    const { blur = 10, opacity = 0.7, color = '#ffffff', borderOpacity = 0.2, shadowOpacity = 0.1 } = options;
    
    return `
      backdrop-filter: blur(${blur}px);
      background: ${ColorUtils.withAlpha(color, opacity)};
      border: 1px solid ${ColorUtils.withAlpha(color, borderOpacity)};
      box-shadow: 0 8px 32px ${ColorUtils.withAlpha('#000', shadowOpacity)};
    `;
  }
}

// =============================================================================
// THEME CONFIGURATION
// =============================================================================
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const themes: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textMuted: '#0ea5e9',
      border: '#bae6fd',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#10b981',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      textMuted: '#22c55e',
      border: '#bbf7d0',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#10b981',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#7c2d12',
      textMuted: '#f97316',
      border: '#fde68a',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#f97316',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#0f0a19',
      surface: '#1a1025',
      text: '#e9d5ff',
      textMuted: '#a78bfa',
      border: '#3b2d5a',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#a78bfa',
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    colors: {
      primary: '#f0abfc',
      secondary: '#c084fc',
      accent: '#22d3ee',
      background: '#0a0a0f',
      surface: '#14141f',
      text: '#fdf4ff',
      textMuted: '#c084fc',
      border: '#3b3b5c',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#22d3ee',
    },
  },
};

// =============================================================================
// THEME MANAGER
// =============================================================================
export class ThemeManager {
  private currentTheme: string = 'default';
  private listeners: Set<(theme: string) => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved && themes[saved]) {
      this.currentTheme = saved;
    }

    this.apply(this.currentTheme);
  }

  apply(themeId: string): void {
    const theme = themes[themeId];
    if (!theme) return;

    this.currentTheme = themeId;
    document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.colors.secondary);
    document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
    document.documentElement.style.setProperty('--color-background', theme.colors.background);
    document.documentElement.style.setProperty('--color-surface', theme.colors.surface);
    document.documentElement.style.setProperty('--color-text', theme.colors.text);
    document.documentElement.style.setProperty('--color-text-muted', theme.colors.textMuted);
    document.documentElement.style.setProperty('--color-border', theme.colors.border);

    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('theme', themeId);

    this.listeners.forEach(fn => fn(themeId));
  }

  getCurrent(): string {
    return this.currentTheme;
  }

  getThemes(): string[] {
    return Object.keys(themes);
  }

  onChange(callback: (theme: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  toggle(): void {
    const next = this.currentTheme === 'default' ? 'dark' : 'default';
    this.apply(next);
  }
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================
export default {
  DesignSystem,
  DesignTokens: undefined,
  ColorUtils,
  GradientUtils,
  BorderUtils,
  TypographyUtils,
  AnimationUtils,
  GlassUtils,
  ThemeManager,
  themes,
};