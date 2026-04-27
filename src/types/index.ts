/**
 * MiniDev ONE Template - Type Definitions
 */

// =============================================================================
// PROJECT TYPES
// =============================================================================
export type ProjectType = 'game' | 'app' | 'website';
export type ThemeMode = 'light' | 'dark' | 'system';

// =============================================================================
// GAME TYPES
// =============================================================================
export type GameType = 
  | 'platformer'  // Side-scrolling jump games
  | 'snake'       // Classic snake gameplay
  | 'breakout'     // Brick breaker
  | 'puzzle'       // Match-3, tetris-like
  | 'shooter'      // Space shooters
  | 'racing'      // Racing games
  | 'idle'         // Clicker/idle games
  | 'tower'        // Tower defense
  | 'tactics'      // Turn-based strategy
  | 'arcade'       // Retro arcade
  | 'rpg'          // Role-playing
  | 'adventure'    // Adventure games
  | 'card'         // Card games
  | 'word'         // Word games
  | 'visual'       // Visual novel
  | 'sandbox';     // Sandbox/creative

// =============================================================================
// APP TYPES
// =============================================================================
export type AppType =
  | 'todo'         // Task management
  | 'notes'         // Note-taking
  | 'timer'         // Timer/stopwatch
  | 'planner'       // Day planner
  | 'habits'        // Habit tracker
  | 'flashcards'    // Study cards
  | 'quiz'          // Quiz maker
  | 'draw'          // Drawing app
  | 'chat'          // Chat app
  | 'weather'       // Weather
  | 'calculator'    // Calculator
  | 'health'        // Health tracker
  | 'music'         // Music player
  | 'photo'         // Photo editor
  | 'social'        // Social media
  | 'tracker';      // Generic tracker

// =============================================================================
// WEBSITE TYPES
// =============================================================================
export type WebsiteType =
  | 'portfolio'     // Personal portfolio
  | 'blog'          // Blog site
  | 'business'       // Business site
  | 'store'          // E-commerce
  | 'landing'        // Landing page
  | 'wiki'           // Documentation
  | 'forum'          // Community
  | 'gallery';       // Photo gallery

// =============================================================================
// CONFIG TYPE - Master configuration
// =============================================================================
export interface ConfigType {
  features: {
    type: { mode: ProjectType };
    
    game: {
      enabled: boolean;
      type: GameType;
      canvas: { width: number; height: number; responsive: boolean; pixelated: boolean; background: string };
      physics: { gravity: number; friction: number; bounce: number };
      controls: { keyboard: boolean; touch: boolean; gamepad: boolean; mouse: boolean };
      difficulty: { lives: number; enemySpeed: number; timerDuration: number; invincibilityFrames: number };
      progression: { levels: number; enemyCount: number; coinsPerLevel: number; bossEvery: number };
      character: { skin: string; hair: string; eyes: string; clothes: string; accessory: string };
    };
    
    app: {
      enabled: boolean;
      type: AppType;
      components: { list: boolean; form: boolean; card: boolean; modal: boolean; toast: boolean; navigation: string };
      data: { localStorage: boolean; cloudSync: boolean; exportable: boolean };
    };
    
    website: {
      enabled: boolean;
      type: WebsiteType;
      layout: { header: boolean; footer: boolean; sidebar: boolean; container: string };
      pages: string[];
      blog: boolean;
      shop: boolean;
      darkMode: boolean;
    };
    
    theme: {
      enabled: boolean;
      defaultMode: ThemeMode;
      modes: ThemeMode[];
      persist: boolean;
      colors: {
        light: { primary: string; secondary: string; accent: string; background: string; foreground: string; card: string; border: string; muted: string };
        dark: { primary: string; secondary: string; accent: string; background: string; foreground: string; card: string; border: string; muted: string };
      };
      typography: { fontFamily: string; monoFamily: string; scale: string };
      radius: string;
      animation: boolean;
    };
    
    pwa: {
      enabled: boolean;
      name: string;
      shortName: string;
      themeColor: string;
      backgroundColor: string;
      display: string;
      orientation: string;
      icons: { favicon: string; apple: string; maskable: string };
      offline: boolean;
      shortcuts: any[];
    };
    
    multiplayer: {
      enabled: boolean;
      type: string;
      maxPlayers: number;
      roomPublic: boolean;
      allowSpectators: boolean;
      chat: boolean;
      voice: boolean;
    };
    
    campaign: {
      enabled: boolean;
      levels: any[];
      achievements: any[];
      unlockables: any[];
      saveProgress: boolean;
      saveKey: string;
    };
    
    leaderboard: {
      enabled: boolean;
      type: string;
      limit: number;
      saveLocally: boolean;
    };
    
    stats: {
      enabled: boolean;
      track: string[];
      saveLocally: boolean;
    };
    
    audio: {
      enabled: boolean;
      sfx: boolean;
      music: boolean;
      tts: boolean;
      volume: number;
      muted: boolean;
    };
    
    i18n: {
      enabled: boolean;
      defaultLocale: string;
      locales: string[];
      fallbackLocale: string;
    };
    
    storage: {
      enabled: boolean;
      type: string;
      autoSave: boolean;
      saveInterval: number;
    };
    
    a11y: {
      enabled: boolean;
      reducedMotion: boolean;
      highContrast: boolean;
      fontSize: number;
      lineHeight: number;
    };
    
    api: {
      enabled: boolean;
      port: number;
      cors: boolean;
      routes: string[];
    };
    
    analytics: {
      enabled: boolean;
      provider: string;
      id: string;
    };
  };
}

// =============================================================================
// GAME ENTITIES
// =============================================================================
export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
}

export interface Player extends Entity {
  type: 'player';
  lives: number;
  score: number;
  grounded: boolean;
}

export interface Enemy extends Entity {
  type: 'enemy';
  health: number;
  damage: number;
  behavior: 'patrol' | 'chase' | 'static';
}

export interface Coin extends Entity {
  type: 'coin';
  value: number;
  collected: boolean;
}

export interface Platform extends Entity {
  type: 'platform';
  color: string;
}

export interface Projectile extends Entity {
  type: 'projectile';
  damage: number;
  friendly: boolean;
}

// =============================================================================
// UI TYPES
// =============================================================================
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

export interface Modal {
  id: string;
  title: string;
  content: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// =============================================================================
// STORAGE TYPES
// =============================================================================
export interface GameSave {
  id: string;
  timestamp: number;
  level: number;
  score: number;
  progress: Record<string, any>;
}

export interface AppData {
  id: string;
  timestamp: number;
  data: Record<string, any>;
}

// =============================================================================
// MULTIPLAYER TYPES
// =============================================================================
export interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  score: number;
  ready: boolean;
}

export interface RoomState {
  id: string;
  players: PlayerState[];
  gameStarted: boolean;
  hostId: string;
}
