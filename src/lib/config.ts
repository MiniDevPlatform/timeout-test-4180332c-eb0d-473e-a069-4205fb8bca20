/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MINIDEV ONE TEMPLATE - GENERATED CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Project: Timeout Test
 * Type: game
 * Category: platformer
 * 
 * Generated from wizard settings.
 */

import type { ProjectMode, GameType, AppType, WebsiteType } from './types';

// =============================================================================
// PROJECT METADATA
// =============================================================================
export const PROJECT = {
  name: 'Timeout Test',
  slug: 'timeout-test',
  description: 'Created with MiniDev ONE Template',
  author: 'MiniDev User',
  version: '1.0.0',
  license: 'GPL-3.0',
  url: 'https://timeout-test.minidev.app',
  repository: 'https://github.com/MiniDevPlatform/timeout-test',
} as const;

// =============================================================================
// FEATURES CONFIG
// =============================================================================
export const FEATURES = {
  
  // Project type
  type: {
    mode: 'game' as ProjectMode,
  },

  // Game engine (for games)
  game: {
    enabled: true,
    type: 'platformer' as GameType,
    canvas: { width: 800, height: 600, responsive: true, pixelated: false, background: '#1a1a2e', fps: 60, antialias: true },
    physics: { gravity: 0.5, friction: 0.85, bounce: 0.3, airResistance: 0.01, maxVelocity: 15 },
    controls: { keyboard: true, touch: true, gamepad: true, mouse: true },
    difficulty: { lives: 0, enemySpeed: 1, enemyDamage: 1, timerDuration: 0, invincibilityFrames: 40, scoreMultiplier: 1.0 },
    progression: { levels: 1, enemyCount: 5, coinsPerLevel: 15, bossEvery: 5, experienceEnabled: false, unlockables: false },
    character: {
      skin: '#FFDFC4',
      hair: '#2C222B',
      eyes: '#4B5320',
      clothes: '#3498DB',
      accessory: 'none',
      size: 'medium',
      speed: 5,
    },
  },

  // App components (for apps)
  app: {
    enabled: false,
    type: 'todo' as AppType,
    components: { list: true, form: true, card: true, modal: true, toast: true, navigation: 'top', drawer: false, table: false, chart: false },
    data: { localStorage: true, cloudSync: false, exportable: true, importable: true, backup: true },
  },

  // Website layouts (for websites)
  website: {
    enabled: false,
    type: 'landing' as WebsiteType,
    layout: { header: true, footer: true, sidebar: false, container: 'lg' },
    sections: { hero: true, features: false, pricing: false, testimonials: false, team: false, faq: false, stats: false, cta: true, gallery: false, blog: false, contact: false },
    pages: ['home'],
    blog: false,
    shop: false,
    darkMode: true,
  },

  // Theme
  theme: {
    enabled: true,
    defaultMode: 'system',
    modes: ['light', 'dark', 'system'],
    persist: true,
    colors: {
      light: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', background: '#ffffff', foreground: '#0f172a', card: '#ffffff', border: '#e2e8f0', muted: '#f1f5f9', input: '#f1f5f9', ring: '#667eea' },
      dark: { primary: '#818cf8', secondary: '#a78bfa', accent: '#f472b6', success: '#4ade80', warning: '#fbbf24', error: '#f87171', background: '#0f172a', foreground: '#f8fafc', card: '#1e293b', border: '#334155', muted: '#1e293b', input: '#1e293b', ring: '#818cf8' },
    },
    typography: { fontFamily: 'system-ui, sans-serif', monoFamily: 'monospace', scale: 'base' },
    radius: 'md',
    animation: true,
  },

  // PWA
  pwa: { enabled: true, name: PROJECT.name, shortName: PROJECT.name.slice(0, 12), themeColor: '#667eea', backgroundColor: '#ffffff', display: 'standalone', orientation: 'any', icons: { favicon: '/favicon.ico', apple: '/apple-touch-icon.png', maskable: '/maskable-icon.png', large: '/icon-512.png' }, offline: true, shortcuts: [] },

  // Multiplayer
  multiplayer: { enabled: true, type: 'websocket', maxPlayers: 2, roomPublic: true, allowSpectators: true, chat: false, voice: false, matchmake: false },

  // Campaign
  campaign: { enabled: false, levels: [], achievements: [], saveProgress: true, saveKey: 'timeout-test_progress' },

  // Leaderboard
  leaderboard: { enabled: false, type: 'local', limit: 100, saveLocally: true, updateInterval: 60000 },

  // Stats
  stats: { enabled: false, track: ['plays', 'wins', 'time', 'score'], saveLocally: true },

  // Audio
  audio: { enabled: true, sfx: false, music: false, tts: false, volume: 0.7, muted: false },

  // i18n
  i18n: { enabled: true, defaultLocale: 'en', locales: ['en', 'es', 'fr', 'de', 'ja', 'zh'], fallbackLocale: 'en', rtlLocales: [] },

  // Storage
  storage: { enabled: true, type: 'local', autoSave: true, saveInterval: 30000 },

  // Accessibility
  a11y: { enabled: true, reducedMotion: true, highContrast: false, fontSize: 16, lineHeight: 1.5, focusVisible: true, skipLinks: true },

  // API
  api: { enabled: false, port: 3001, cors: true, rateLimit: { enabled: true, windowMs: 60000, max: 100 }, auth: { enabled: false, providers: [], jwtSecret: 'change-me', sessionMaxAge: 604800 }, routes: [] },

  // Analytics
  analytics: { enabled: false, provider: 'none', id: '' },
};

// =============================================================================
// HELPERS
// =============================================================================
export function isGame(): boolean { return FEATURES.type.mode === 'game'; }
export function isApp(): boolean { return FEATURES.type.mode === 'app'; }
export function isWebsite(): boolean { return FEATURES.type.mode === 'website'; }

export function getTheme(): 'light' | 'dark' {
  if (FEATURES.theme.defaultMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return FEATURES.theme.defaultMode;
}

export function getColors() {
  return getTheme() === 'dark' ? FEATURES.theme.colors.dark : FEATURES.theme.colors.light;
}

// Init
console.log(`[${PROJECT.name}] ONE Template loaded as ${FEATURES.type.mode}`);
if (FEATURES.game.enabled) console.log(`  Game: ${FEATURES.game.type}`);
if (FEATURES.app.enabled) console.log(`  App: ${FEATURES.app.type}`);
if (FEATURES.website.enabled) console.log(`  Website: ${FEATURES.website.type}`);

export default { PROJECT, FEATURES };
