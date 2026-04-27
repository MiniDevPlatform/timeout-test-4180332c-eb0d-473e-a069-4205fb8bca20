/**
 * MiniDev ONE Template - Responsive Grid System
 * 
 * A comprehensive grid system with breakpoints, containers, and utilities.
 */

import {} from '@/lib/config';

// =============================================================================
// GRID CONFIGURATION
// =============================================================================
export interface GridConfig {
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  containers: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
  };
  gutters: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  columns: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  breakpoints: {
    xs: 320,
    sm: 480,
    md: 640,
    lg: 768,
    xl: 1024,
    xxl: 1280,
    xxxl: 1536,
  },
  containers: {
    sm: 480,
    md: 640,
    lg: 768,
    xl: 1024,
    xxl: 1280,
    full: 100,
  },
  gutters: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  columns: 12,
};

// =============================================================================
// BREAKPOINT HELPERS
// =============================================================================
export class BreakpointHelper {
  private config: GridConfig;

  constructor(config: GridConfig = DEFAULT_GRID_CONFIG) {
    this.config = config;
  }

  getBreakpoints(): string[] {
    return Object.keys(this.config.breakpoints);
  }

  getBreakpointValue(name: keyof GridConfig['breakpoints']): number {
    return this.config.breakpoints[name];
  }

  getActiveBreakpoint(width: number): keyof GridConfig['breakpoints'] {
    const entries = Object.entries(this.config.breakpoints).reverse();
    for (const [name, value] of entries) {
      if (width >= value) {
        return name as keyof GridConfig['breakpoints'];
      }
    }
    return 'xs';
  }

  isAtLeast(name: keyof GridConfig['breakpoints'], width: number): boolean {
    return width >= this.config.breakpoints[name];
  }

  isAtMost(name: keyof GridConfig['breakpoints'], width: number): boolean {
    return width <= this.config.breakpoints[name];
  }

  getRange(min: keyof GridConfig['breakpoints'], max: keyof GridConfig['breakpoints']): string {
    const minVal = this.config.breakpoints[min];
    const maxVal = this.config.breakpoints[max];
    return `(min-width: ${minVal}px) and (max-width: ${maxVal - 1}px)`;
  }
}

// =============================================================================
// GRID SYSTEM
// =============================================================================
export class GridSystem {
  private config: GridConfig;
  private container: HTMLElement | null = null;

  constructor(config: GridConfig = DEFAULT_GRID_CONFIG) {
    this.config = config;
  }

  // Container
  createContainer(maxWidth?: keyof GridConfig['containers']): string {
    const width = maxWidth ? this.config.containers[maxWidth] : this.config.containers.full;
    const isFull = maxWidth === 'full';
    
    if (isFull) {
      return 'width: 100%;';
    }

    return `
      width: 100%;
      max-width: ${width}px;
      margin-left: auto;
      margin-right: auto;
      padding-left: var(--gutter, 16px);
      padding-right: var(--gutter, 16px);
    `;
  }

  // Row
  createRow(gutter: keyof GridConfig['gutters'] = 'md'): string {
    const gap = this.config.gutters[gutter];
    return `
      display: grid;
      grid-template-columns: repeat(${this.config.columns}, 1fr);
      gap: ${gap}px;
      margin-left: -${gap / 2}px;
      margin-right: -${gap / 2}px;
    `;
  }

  // Column span
  colSpan(columns: number): string {
    return `grid-column: span ${columns};`;
  }

  colSpanResponsive(columns: Record<keyof GridConfig['breakpoints'], number>): string {
    return Object.entries(columns)
      .map(([bp, cols]) => {
        const px = this.config.breakpoints[bp as keyof GridConfig['breakpoints']];
        return `@media (min-width: ${px}px) { grid-column: span ${cols}; }`;
      })
      .join('\n');
  }

  // Grid utilities
  autoFit(minWidth: number): string {
    return `grid-template-columns: repeat(auto-fit, minmax(${minWidth}px, 1fr));`;
  }

  autoFill(minWidth: number): string {
    return `grid-template-columns: repeat(auto-fill, minmax(${minWidth}px, 1fr));`;
  }

  // Flex utilities
  flexRow(align: 'start' | 'center' | 'end' | 'stretch' = 'stretch', 
          justify: 'start' | 'center' | 'end' | 'between' | 'around' = 'start',
          gap: keyof GridConfig['gutters'] = 'md'): string {
    const alignMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
    };
    const justifyMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
    };

    return `
      display: flex;
      flex-wrap: wrap;
      align-items: ${alignMap[align]};
      justify-content: ${justifyMap[justify]};
      gap: ${this.config.gutters[gap]}px;
    `;
  }

  // Stack utilities
  vStack(gap: keyof GridConfig['gutters'] = 'md'): string {
    return `
      display: flex;
      flex-direction: column;
      gap: ${this.config.gutters[gap]}px;
    `;
  }

  hStack(gap: keyof GridConfig['gutters'] = 'md'): string {
    return `
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: ${this.config.gutters[gap]}px;
    `;
  }

  // Spacing utilities
  gap(value: keyof GridConfig['gutters']): string {
    return `gap: ${this.config.gutters[value]}px;`;
  }

  padding(size: keyof GridConfig['gutters']): string {
    return `padding: ${this.config.gutters[size]}px;`;
  }

  margin(size: keyof GridConfig['gutters']): string {
    return `margin: ${this.config.gutters[size]}px;`;
  }
}

// =============================================================================
// CSS GENERATOR
// =============================================================================
export class GridCSSGenerator {
  private config: GridConfig;
  private css: string[] = [];

  constructor(config: GridConfig = DEFAULT_GRID_CONFIG) {
    this.config = config;
  }

  generate(): string {
    this.css = [];
    
    this.generateRoot();
    this.generateContainers();
    this.generateBreakpoints();
    this.generateUtilities();
    this.generateDebug();
    
    return this.css.join('\n\n');
  }

  private add(css: string): void {
    this.css.push(css);
  }

  private generateRoot(): void {
    this.add(`/* Grid System Root Variables */`);
    this.add(`:root {`);

    // Breakpoints
    Object.entries(this.config.breakpoints).forEach(([name, value]) => {
      this.add(`  --breakpoint-${name}: ${value}px;`);
    });

    // Containers
    Object.entries(this.config.containers).forEach(([name, value]) => {
      this.add(`  --container-${name}: ${value}px;`);
    });

    // Gutters
    Object.entries(this.config.gutters).forEach(([name, value]) => {
      this.add(`  --gutter-${name}: ${value}px;`);
    });

    this.add(`  --grid-columns: ${this.config.columns};`);
    this.add(`  --gutter: var(--gutter-md);`);
    this.add(`}`);
  }

  private generateContainers(): void {
    this.add(`/* Container Classes */`);
    
    Object.entries(this.config.containers).forEach(([name, value]) => {
      if (name === 'full') {
        this.add(`.container { width: 100%; }`);
      } else {
        this.add(`.container-${name} { width: 100%; max-width: ${value}px; margin: 0 auto; padding: 0 var(--gutter); }`);
      }
    });
  }

  private generateBreakpoints(): void {
    this.add(`/* Responsive Grid Classes */`);
    
    const breakpoints = Object.entries(this.config.breakpoints);
    
    // Base grid
    this.add(`.grid { display: grid; grid-template-columns: repeat(${this.config.columns}, 1fr); gap: var(--gutter); }`);
    this.add(`.grid-gap-none { gap: var(--gutter-none); }`);
    this.add(`.grid-gap-xs { gap: var(--gutter-xs); }`);
    this.add(`.grid-gap-sm { gap: var(--gutter-sm); }`);
    this.add(`.grid-gap-md { gap: var(--gutter-md); }`);
    this.add(`.grid-gap-lg { gap: var(--gutter-lg); }`);
    this.add(`.grid-gap-xl { gap: var(--gutter-xl); }`);
    this.add(`.grid-gap-xxl { gap: var(--gutter-xxl); }`);

    // Column spans
    for (let i = 1; i <= this.config.columns; i++) {
      this.add(`.col-${i} { grid-column: span ${i}; }`);
    }
    this.add(`.col-auto { grid-column: auto; }`);
    this.add(`.col-full { grid-column: 1 / -1; }`);

    // Responsive columns
    breakpoints.forEach(([name, px]) => {
      const prefix = name === 'xs' ? '' : `${name}:`;
      
      this.add(`@media (min-width: ${px}px) {`);
      this.add(`  .${prefix}grid { display: grid; grid-template-columns: repeat(${this.config.columns}, 1fr); gap: var(--gutter); }`);
      
      for (let i = 1; i <= this.config.columns; i++) {
        this.add(`  .${prefix}col-${i} { grid-column: span ${i}; }`);
      }
      this.add(`  .${prefix}col-auto { grid-column: auto; }`);
      this.add(`  .${prefix}col-full { grid-column: 1 / -1; }`);
      
      // Offset
      for (let i = 1; i < this.config.columns; i++) {
        this.add(`  .${prefix}offset-${i} { grid-column-start: ${i + 1}; }`);
      }
      
      this.add(`}`);
    });

    // Auto-fit and auto-fill
    this.add(`.grid-auto-fit { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }`);
    this.add(`.grid-auto-fill { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }`);
    
    // Masonry-like
    this.add(`.grid-masonry { grid-template-columns: repeat(auto, 1fr); column-count: 3; column-gap: var(--gutter); }`);
  }

  private generateUtilities(): void {
    this.add(`/* Layout Utilities */`);
    
    // Flex
    this.add(`.flex { display: flex; }`);
    this.add(`.flex-col { flex-direction: column; }`);
    this.add(`.flex-row { flex-direction: row; }`);
    this.add(`.flex-wrap { flex-wrap: wrap; }`);
    this.add(`.flex-nowrap { flex-wrap: nowrap; }`);
    this.add(`.flex-1 { flex: 1; }`);
    this.add(`.flex-auto { flex: auto; }`);
    this.add(`.flex-none { flex: none; }`);
    this.add(`.flex-initial { flex: 0 1 auto; }`);
    
    // Align
    this.add(`.items-start { align-items: flex-start; }`);
    this.add(`.items-center { align-items: center; }`);
    this.add(`.items-end { align-items: flex-end; }`);
    this.add(`.items-stretch { align-items: stretch; }`);
    this.add(`.items-baseline { align-items: baseline; }`);
    
    // Justify
    this.add(`.justify-start { justify-content: flex-start; }`);
    this.add(`.justify-center { justify-content: center; }`);
    this.add(`.justify-end { justify-content: flex-end; }`);
    this.add(`.justify-between { justify-content: space-between; }`);
    this.add(`.justify-around { justify-content: space-around; }`);
    this.add(`.justify-evenly { justify-content: space-evenly; }`);
    
    // Gap
    this.add(`.gap-none { gap: 0; }`);
    this.add(`.gap-xs { gap: var(--gutter-xs); }`);
    this.add(`.gap-sm { gap: var(--gutter-sm); }`);
    this.add(`.gap-md { gap: var(--gutter-md); }`);
    this.add(`.gap-lg { gap: var(--gutter-lg); }`);
    this.add(`.gap-xl { gap: var(--gutter-xl); }`);
    this.add(`.gap-xxl { gap: var(--gutter-xxl); }`);

    // Spacing
    this.add(`/* Spacing Utilities */`);
    const sides = ['t', 'r', 'b', 'l', 'x', 'y', ''];
    const values = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

    sides.forEach(side => {
      values.forEach(size => {
        const gutterVal = this.config.gutters[size as keyof GridConfig['gutters']];
        const prop = side === '' ? 'margin' :
                    side === 'x' ? 'margin-left' :
                    side === 'y' ? 'margin-top' :
                    `margin-${side === 't' ? 'top' : side === 'r' ? 'right' : side === 'b' ? 'bottom' : 'left'}`;
        
        this.add(`.m${side}-${size} { ${prop}: ${gutterVal}px; }`);
        this.add(`.p${side}-${size} { padding-${side === '' ? '' : side === 't' ? 'top' : side === 'r' ? 'right' : side === 'b' ? 'bottom' : 'left'}: ${gutterVal}px; }`);
      });
    });

    // Display
    this.add(`/* Display Utilities */`);
    this.add(`.block { display: block; }`);
    this.add(`.inline { display: inline; }`);
    this.add(`.inline-block { display: inline-block; }`);
    this.add(`.inline-flex { display: inline-flex; }`);
    this.add(`.hidden { display: none; }`);
    this.add(`.grid-display { display: grid; }`);
    this.add(`.table { display: table; }`);
    this.add(`.contents { display: contents; }`);

    // Visibility
    this.add(`/* Visibility */`);
    this.add(`.visible { visibility: visible; }`);
    this.add(`.invisible { visibility: hidden; }`);
    this.add(`.opacity-0 { opacity: 0; }`);
    this.add(`.opacity-25 { opacity: 0.25; }`);
    this.add(`.opacity-50 { opacity: 0.5; }`);
    this.add(`.opacity-75 { opacity: 0.75; }`);
    this.add(`.opacity-100 { opacity: 1; }`);

    // Overflow
    this.add(`/* Overflow */`);
    this.add(`.overflow-auto { overflow: auto; }`);
    this.add(`.overflow-hidden { overflow: hidden; }`);
    this.add(`.overflow-scroll { overflow: scroll; }`);
    this.add(`.overflow-visible { overflow: visible; }`);
    this.add(`.overflow-x-auto { overflow-x: auto; }`);
    this.add(`.overflow-y-auto { overflow-y: auto; }`);
  }

  private generateDebug(): void {
    this.add(`/* Debug Grid Overlay (add .grid-debug to body) */`);
    this.add(`.grid-debug::before {`);
    this.add(`  position: fixed;`);
    this.add(`  top: 0; left: 0; right: 0; bottom: 0;`);
    this.add(`  pointer-events: none;`);
    this.add(`  background: repeating-linear-gradient(`);
    this.add(`    90deg,`);
    this.add(`    rgba(255, 0, 0, 0.05) 0px,`);
    this.add(`    rgba(255, 0, 0, 0.05) calc(100% / ${this.config.columns} - 1px),`);
    this.add(`    transparent calc(100% / ${this.config.columns} - 1px),`);
    this.add(`    transparent calc(100% / ${this.config.columns})`);
    this.add(`  );`);
    this.add(`  z-index: 9999;`);
    this.add(`}`);
  }
}

// =============================================================================
// REACT HOOK
// =============================================================================
export function useBreakpoint() {
  if (typeof window === 'undefined') {
    return 'md' as keyof GridConfig['breakpoints'];
  }

  const getBreakpoint = (): keyof GridConfig['breakpoints'] => {
    const width = window.innerWidth;
    const config = DEFAULT_GRID_CONFIG;

    if (width >= config.breakpoints.xxxl) return 'xxxl';
    if (width >= config.breakpoints.xxl) return 'xxl';
    if (width >= config.breakpoints.xl) return 'xl';
    if (width >= config.breakpoints.lg) return 'lg';
    if (width >= config.breakpoints.md) return 'md';
    if (width >= config.breakpoints.sm) return 'sm';
    return 'xs';
  };

  return getBreakpoint();
}

// =============================================================================
// GRID COMPONENT
// =============================================================================
export function createGrid(container: HTMLElement, options: {
  columns?: number;
  gutter?: keyof GridConfig['gutters'];
  responsive?: boolean;
} = {}): void {
  
  const config = DEFAULT_GRID_CONFIG;
  const cols = options.columns ?? 12;
  const gut = options.gutter ?? 'md';
  const gap = config.gutters[gut];
  
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gap = `${gap}px`;
  container.style.marginLeft = `-${gap / 2}px`;
  container.style.marginRight = `-${gap / 2}px`;
}

// =============================================================================
// RESPONSIVE HELPER
// =============================================================================
export function responsiveClass(
  baseClass: string,
  overrides: Partial<Record<keyof GridConfig['breakpoints'], string>>
): string {
  const classes = [baseClass];
  
  Object.entries(overrides).forEach(([bp, cls]) => {
    if (cls) {
      const prefix = bp === 'xs' ? '' : `${bp}:`;
      classes.push(`${prefix}${cls}`);
    }
  });
  
  return classes.join(' ');
}

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  GridSystem,
  GridCSSGenerator,
  BreakpointHelper,
  DEFAULT_GRID_CONFIG,
  useBreakpoint,
  createGrid,
  responsiveClass,
};