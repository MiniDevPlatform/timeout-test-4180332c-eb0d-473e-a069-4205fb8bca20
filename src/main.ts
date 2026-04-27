/**
 * MiniDev ONE Template - Main Entry Point
 * 
 * Entry point that initializes everything based on config.ts.
 * Uses base patterns, events, and proper error handling.
 */

import { FEATURES, isGame, isApp, isWebsite } from './lib/config';
import { initTheme } from './lib/theme';
import { logger, LogLevel } from './lib/logger';
import { errorBoundary } from './lib/validation';
import { globalBus, Events } from './lib/events';
import { storage } from './lib/storage';
import { analytics } from './lib/analytics';
import './styles/index.css';

// =============================================================================
// CONFIGURATION
// =============================================================================
// Set logger level based on environment
logger.setLevel((import.meta as any).DEV || false ? LogLevel.DEBUG : LogLevel.INFO);
logger.setCategoryLevel('template', LogLevel.INFO);

// =============================================================================
// INITIALIZATION
// =============================================================================
async function init(): Promise<void> {
  const startTime = performance.now();

  try {
    logger.info('template', `Initializing ${FEATURES.pwa.name} v${FEATURES.pwa.name.length > 0 ? '1.0' : '1.0'}...`);

    // Initialize theme
    initTheme();

    // Initialize storage
    if (FEATURES.storage.enabled) {
      storage.get('initialized');
      storage.set('initialized', Date.now());
    }

    // Initialize analytics
    if (FEATURES.analytics.enabled) {
      analytics.init();
      analytics.trackPageView({ title: document.title });
    }

    // Initialize PWA
    if (FEATURES.pwa.enabled && 'serviceWorker' in navigator) {
      await initPWA();
    }

    // Initialize audio context on user interaction
    initAudioOnInteraction();

    // Initialize based on project type
    await initProject();

    // Emit ready event
    globalBus.emit(Events.APP_READY);

    const elapsed = (performance.now() - startTime).toFixed(1);
    logger.info('template', `Initialized in ${elapsed}ms`);

  } catch (error) {
    logger.fatal('template', 'Failed to initialize', error);
    globalBus.emit(Events.APP_ERROR, { error });
  }
}

// =============================================================================
// PWA INITIALIZATION
// =============================================================================
async function initPWA(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    logger.info('pwa', 'Service Worker registered', { scope: registration.scope });
  } catch (error) {
    logger.warn('pwa', 'SW registration failed', error);
  }
}

// =============================================================================
// AUDIO ON INTERACTION
// =============================================================================
function initAudioOnInteraction(): void {
  if (!FEATURES.audio.enabled || FEATURES.audio.muted) return;

  const initAudio = () => {
    logger.info('audio', 'Audio ready');
    document.removeEventListener('click', initAudio);
    document.removeEventListener('touchstart', initAudio);
  };

  document.addEventListener('click', initAudio, { once: true });
  document.addEventListener('touchstart', initAudio, { once: true });
}

// =============================================================================
// PROJECT INITIALIZATION
// =============================================================================
async function initProject(): Promise<void> {
  if (isGame()) {
    await initGame();
  } else if (isApp()) {
    await initApp();
  } else if (isWebsite()) {
    await initWebsite();
  } else {
    logger.warn('template', 'Unknown project type');
  }
}

// =============================================================================
// GAME INITIALIZATION
// =============================================================================
async function initGame(): Promise<void> {
  logger.info('game', `Initializing game: ${FEATURES.game.type}`);

  const container = document.getElementById('game-container');
  if (!container) {
    throw new Error('Game container not found');
  }

  // Dynamically import game engine
  const { GameEngine } = await import('./engine/core');
  const engine = new GameEngine('game-canvas');
  (window as any).gameEngine = engine;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.className = 'game-canvas';
  container.appendChild(canvas);

  // Initialize engine
  engine.createPlayer(100, 300);
  engine.initLevel();

  // Setup input handling
  setupGameInput(engine);

  // Start engine
  engine.start();

  // Track game start
  if (FEATURES.analytics.enabled) {
    analytics.trackGameStart();
  }

  // Handle pause
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' || e.code === 'KeyP') {
      engine.pause();
      globalBus.emit(Events.GAME_PAUSE);
    }
  });
}

// =============================================================================
// GAME INPUT HANDLING
// =============================================================================
function setupGameInput(engine: any): void {
  const player = engine.getEntity('player');
  if (!player) return;

  const moveSpeed = FEATURES.game.character.speed;
  const jumpForce = 12;

  // Override update to add player input
  const originalUpdate = engine.update.bind(engine);
  engine.update = (dt: number) => {
    // Movement
    if (engine.input.isLeft()) {
      player.velocityX = -moveSpeed;
      player.flipX = true;
    } else if (engine.input.isRight()) {
      player.velocityX = moveSpeed;
      player.flipX = false;
    }

    // Jump
    if (engine.input.isJump() && player.grounded) {
      player.velocityY = -jumpForce;
      engine.audio.playGenerated('jump');
    }

    // Fire (shooters)
    if (engine.input.isAction() && FEATURES.game.type === 'shooter') {
      engine.createProjectile(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.flipX ? -10 : 10,
        0,
        true
      );
      engine.audio.playGenerated('shoot');
    }

    // Apply physics
    engine.physics.update(player, dt);

    // Collisions
    engine.checkPlayerPlatformCollision();
    engine.checkPlayerCoinCollision();
    engine.checkPlayerEnemyCollision();

    originalUpdate(dt);
  };

  // Restart on game over
  engine.restart = errorBoundary.wrap(() => {
    engine.score = 0;
    engine.lives = FEATURES.game.difficulty.lives;
    engine.level = 1;
    engine.gameOver = false;
    engine.victory = false;
    engine.particles.clear();
    engine.createPlayer(100, 300);
    engine.initLevel();
  });
}

// =============================================================================
// APP INITIALIZATION
// =============================================================================
async function initApp(): Promise<void> {
  logger.info('app', `Initializing app: ${FEATURES.app.type}`);

  const container = document.getElementById('app-container');
  if (!container) {
    throw new Error('App container not found');
  }

  // Import app components
  const { TodoApp, HabitTracker, FlashcardApp, Timer, Quiz } = await import('./components/app');
  const { NotesApp, Calculator, DrawingApp, WeatherWidget } = await import('./components/app/extended');

  const appType = FEATURES.app.type;
  let initialized = false;

  // Initialize based on app type
  switch (appType) {
    case 'todo':
      new TodoApp('#app-container');
      initialized = true;
      break;
    case 'habits':
      new HabitTracker('#app-container');
      initialized = true;
      break;
    case 'flashcards':
      new FlashcardApp('#app-container');
      initialized = true;
      break;
    case 'timer':
      new Timer('#app-container');
      initialized = true;
      break;
    case 'quiz':
      new Quiz('#app-container');
      initialized = true;
      break;
    case 'notes':
      new NotesApp('#app-container');
      initialized = true;
      break;
    case 'calculator':
      new Calculator('#app-container');
      initialized = true;
      break;
    case 'draw':
      new DrawingApp('#app-container');
      initialized = true;
      break;
    default:
      // Fallback to generic container
      container.innerHTML = `
        <div class="max-w-2xl mx-auto p-6">
          <h1 class="text-3xl font-bold mb-6">${FEATURES.pwa.name}</h1>
          <div id="app-content"></div>
        </div>
      `;
      
      if ((FEATURES.app.components as any)?.list) {
        try {
          new TodoApp('#app-content');
          initialized = true;
        } catch (e) {
          logger.warn('app', 'Failed to initialize app component');
        }
      }
  }

  if (initialized && FEATURES.analytics.enabled) {
    analytics.trackAppOpen();
  }
}

// =============================================================================
// WEBSITE INITIALIZATION
// =============================================================================
async function initWebsite(): Promise<void> {
  logger.info('website', `Initializing website: ${FEATURES.website.type}`);

  const container = document.getElementById('website-container');
  if (!container) {
    throw new Error('Website container not found');
  }

  const { WebsiteRenderer } = await import('./components/layout');
  new WebsiteRenderer('#website-container');
}

// =============================================================================
// GLOBAL ERROR HANDLER
// =============================================================================
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    logger.error('window', 'Uncaught error', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    logger.error('window', 'Unhandled promise rejection', e.reason);
  });

  window.addEventListener('beforeunload', () => {
    // Cleanup
    globalBus.emit(Events.APP_ERROR, { type: 'unload' });
  });
}

// =============================================================================
// START
// =============================================================================
document.addEventListener('DOMContentLoaded', init);

// Also try to run if DOM already loaded
if (document.readyState !== 'loading') {
  init();
}

// Export for debugging
export { logger, globalBus };
