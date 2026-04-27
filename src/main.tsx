/**
 * MiniDev ONE Template - Main Entry Point
 * 
 * Entry point that initializes everything based on config.ts
 */

import { FEATURES, isGame, isApp, isWebsite } from './lib/config';
import { initTheme } from './lib/theme';
import { storage } from './components/app';
import './styles/index.css';

// =============================================================================
// INITIALIZATION
// =============================================================================
async function init() {
  console.log(`[MiniDev] ONE Template v1.0 - ${FEATURES.type.mode}`);

  // Initialize theme
  initTheme();

  // Initialize storage
  if (FEATURES.storage.enabled) {
    storage.get('initialized');
    storage.set('initialized', Date.now());
  }

  // Initialize audio context on user interaction
  document.addEventListener('click', () => {
    if (FEATURES.audio.enabled && !FEATURES.audio.muted) {
      // Audio will be initialized on first use
      console.log('[Audio] Ready');
    }
  }, { once: true });

  // Initialize PWA
  if (FEATURES.pwa.enabled && 'serviceWorker' in navigator) {
    initPWA();
  }

  // Initialize game/app/website
  if (isGame()) {
    initGame();
  } else if (isApp()) {
    initApp();
  } else if (isWebsite()) {
    initWebsite();
  }

  // Global error handler
  window.addEventListener('error', (e) => {
    console.error('[Error]', e.error);
  });
}

// =============================================================================
// PWA INITIALIZATION
// =============================================================================
async function initPWA(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[PWA] Service Worker registered:', registration.scope);
  } catch (error) {
    console.warn('[PWA] SW registration failed:', error);
  }
}

// =============================================================================
// GAME INITIALIZATION
// =============================================================================
async function initGame(): Promise<void> {
  const { GameEngine } = await import('./engine/core');
  
  const container = document.getElementById('game-container');
  if (!container) {
    console.error('[Game] Container not found');
    return;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.className = 'game-canvas';
  container.appendChild(canvas);

  // Initialize engine
  const engine = new GameEngine('game-canvas');
  
  // Store engine globally for debugging
  (window as any).gameEngine = engine;

  // Create player
  engine.createPlayer(100, 300);

  // Initialize level
  engine.initLevel();

  // Player controls
  const player = engine.getEntity<any>('player');
  if (player) {
    // Input handling
    const updatePlayer = () => {
      if (!player.active) return;

      const moveSpeed = FEATURES.game.character.speed;
      const jumpForce = 12;

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
        const proj = engine.createProjectile(
          player.x + player.width / 2,
          player.y + player.height / 2,
          player.flipX ? -10 : 10,
          0,
          true
        );
        engine.audio.playGenerated('shoot');
      }
    };

    // Game loop hook
    const originalUpdate = engine.update.bind(engine);
    engine.update = (dt: number) => {
      updatePlayer();
      
      // Apply physics
      engine.physics.update(player, dt);
      
      // Collisions
      engine.checkPlayerPlatformCollision();
      engine.checkPlayerCoinCollision();
      engine.checkPlayerEnemyCollision();

      originalUpdate(dt);
    };

    // Start
    engine.start();
    
    // Restart on game over
    const checkGameState = setInterval(() => {
      if (engine.gameOver) {
        document.addEventListener('click', () => {
          engine.restart();
        }, { once: true });
        clearInterval(checkGameState);
      }
    }, 100);
  }

  // Pause
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' || e.code === 'KeyP') {
      engine.pause();
    }
  });

  console.log(`[Game] ${FEATURES.game.type} initialized`);
}

// =============================================================================
// APP INITIALIZATION
// =============================================================================
async function initApp(): Promise<void> {
  const { TodoApp, HabitTracker, FlashcardApp, Timer, Quiz } = await import('./components/app');
  
  const container = document.getElementById('app-container');
  if (!container) {
    console.error('[App] Container not found');
    return;
  }

  const appType = FEATURES.app.type;

  switch (appType) {
    case 'todo':
      new TodoApp('#app-container');
      break;
    case 'habits':
      new HabitTracker('#app-container');
      break;
    case 'flashcards':
      new FlashcardApp('#app-container');
      break;
    case 'timer':
      new Timer('#app-container');
      break;
    case 'quiz':
      new Quiz('#app-container');
      break;
    default:
      // Generic app shell
      container.innerHTML = `
        <div class="max-w-2xl mx-auto p-6">
          <h1 class="text-3xl font-bold mb-6">${FEATURES.pwa.name}</h1>
          <div id="app-content"></div>
        </div>
      `;
      // Try to initialize specific app
      if ((FEATURES.app.components as any).list) {
        try {
          new TodoApp('#app-content');
        } catch {
          console.log('[App] Use wizard to select app type');
        }
      }
  }

  console.log(`[App] ${appType} initialized`);
}

// =============================================================================
// WEBSITE INITIALIZATION
// =============================================================================
async function initWebsite(): Promise<void> {
  const { WebsiteRenderer } = await import('./components/layout');
  
  const container = document.getElementById('website-container');
  if (!container) {
    console.error('[Website] Container not found');
    return;
  }

  new WebsiteRenderer('#website-container');
  console.log(`[Website] ${FEATURES.website.type} initialized`);
}

// =============================================================================
// START
// =============================================================================
document.addEventListener('DOMContentLoaded', init);
