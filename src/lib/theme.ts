/**
 * MiniDev ONE Template - Theme System
 * 
 * Handles light/dark mode switching.
 */

import { FEATURES, getTheme } from './config';

// =============================================================================
// THEME STORAGE
// =============================================================================
const THEME_KEY = 'minidev_theme';

function getStoredTheme(): 'light' | 'dark' | 'system' | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system' | null;
}

function storeTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
}

// =============================================================================
// CSS VARIABLES
// =============================================================================
function applyTheme(mode: 'light' | 'dark'): void {
  const colors = FEATURES.theme.colors[mode];
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--warning', colors.warning);
  root.style.setProperty('--error', colors.error);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--muted', colors.muted);
  root.style.setProperty('--input', colors.input);
  root.style.setProperty('--ring', colors.ring);

  // Set data attribute for Tailwind
  root.setAttribute('data-theme', mode);
}

// =============================================================================
// INIT THEME
// =============================================================================
export function initTheme(): void {
  if (!FEATURES.theme.enabled) return;

  const defaultMode = FEATURES.theme.defaultMode;
  const storedMode = getStoredTheme();
  const currentMode = storedMode || defaultMode;

  // Determine actual theme
  let resolvedMode: 'light' | 'dark';
  
  if (currentMode === 'system') {
    resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    resolvedMode = currentMode;
  }

  // Apply theme
  applyTheme(resolvedMode);

  // Listen for system changes
  if (currentMode === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  // Reduced motion
  if (FEATURES.a11y.reducedMotion) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.documentElement.style.setProperty(
      '--animation-duration',
      prefersReducedMotion.matches ? '0ms' : '300ms'
    );
  }

  console.log(`[Theme] Initialized as ${resolvedMode}`);
}

// =============================================================================
// TOGGLE THEME
// =============================================================================
export function toggleTheme(): void {
  const current = getTheme();
  const newTheme: 'light' | 'dark' = current === 'dark' ? 'light' : 'dark';
  
  storeTheme(newTheme);
  applyTheme(newTheme);
  
  console.log(`[Theme] Toggled to ${newTheme}`);
}

// =============================================================================
// SET THEME
// =============================================================================
export function setTheme(mode: 'light' | 'dark' | 'system'): void {
  storeTheme(mode);
  
  if (mode === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(systemTheme);
  } else {
    applyTheme(mode);
  }
  
  console.log(`[Theme] Set to ${mode}`);
}

// =============================================================================
// EXPORTS
// =============================================================================
export { applyTheme, getTheme };
export default { initTheme, toggleTheme, setTheme };
