/**
 * MiniDev ONE Template - Event System
 * 
 * Pub/sub event system for decoupled communication.
 */

import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================
type EventHandler<T = any> = (data: T) => void;
type WildcardHandler<T = any> = (event: string, data: T) => void;
type Unsubscribe = () => void;

interface EventBus {
  on<T = any>(event: string, handler: EventHandler<T>): Unsubscribe;
  once<T = any>(event: string, handler: EventHandler<T>): Unsubscribe;
  off(event: string, handler?: EventHandler): void;
  emit<T = any>(event: string, data?: T): void;
  clear(): void;
}

// =============================================================================
// EVENT BUS
// =============================================================================
class EventEmitter implements EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private wildcardHandlers: Set<WildcardHandler> = new Set();
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  on<T = any>(event: string, handler: EventHandler<T>): Unsubscribe {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    
    if (this.debug) {
      logger.debug('event', `Subscribed to "${event}"`);
    }

    return () => this.off(event, handler);
  }

  once<T = any>(event: string, handler: EventHandler<T>): Unsubscribe {
    const wrapper: EventHandler<T> = (data) => {
      handler(data);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  off(event: string, handler?: EventHandler): void {
    if (handler) {
      this.handlers.get(event)?.delete(handler);
    } else {
      this.handlers.delete(event);
    }
  }

  emit<T = any>(event: string, data?: T): void {
    if (this.debug) {
      logger.debug('event', `Emitting "${event}"`, data);
    }

    // Notify specific handlers
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('event', `Handler error in "${event}"`, error);
        }
      });
    }

    // Notify wildcard handlers
    this.wildcardHandlers.forEach(handler => {
      try {
        handler(event, data);
      } catch (error) {
        logger.error('event', `Wildcard handler error`, { event, error });
      }
    });
  }

  onWildcard(handler: WildcardHandler): Unsubscribe {
    this.wildcardHandlers.add(handler);
    return () => this.wildcardHandlers.delete(handler);
  }

  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
  }

  // Debugging
  getEventCount(event: string): number {
    return this.handlers.get(event)?.size || 0;
  }

  getEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// =============================================================================
// EVENT CHANNELS
// =============================================================================
class EventChannel {
  private emitter: EventEmitter;
  private prefix: string;

  constructor(prefix: string, debug: boolean = false) {
    this.emitter = new EventEmitter(debug);
    this.prefix = prefix + ':';
  }

  on<T = any>(event: string, handler: EventHandler<T>): Unsubscribe {
    return this.emitter.on(this.prefix + event, handler);
  }

  once<T = any>(event: string, handler: EventHandler<T>): Unsubscribe {
    return this.emitter.once(this.prefix + event, handler);
  }

  emit<T = any>(event: string, data?: T): void {
    this.emitter.emit(this.prefix + event, data);
  }

  off(event?: string): void {
    if (event) {
      this.emitter.off(this.prefix + event);
    } else {
      this.emitter.clear();
    }
  }
}

// =============================================================================
// GLOBAL EVENT SYSTEM
// =============================================================================
const globalBus = new EventEmitter(import.meta?.DEV);

// Event constants
export const Events = {
  // App events
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  APP_RESIZE: 'app:resize',
  
  // Game events
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_OVER: 'game:over',
  GAME_RESTART: 'game:restart',
  LEVEL_COMPLETE: 'game:level-complete',
  LEVEL_FAILED: 'game:level-failed',
  
  // Player events
  PLAYER_HIT: 'player:hit',
  PLAYER_DEATH: 'player:death',
  PLAYER_RESPAWN: 'player:respawn',
  PLAYER_SCORE: 'player:score',
  
  // UI events
  UI_MODAL_OPEN: 'ui:modal-open',
  UI_MODAL_CLOSE: 'ui:modal-close',
  UI_TOAST: 'ui:toast',
  UI_NAVIGATE: 'ui:navigate',
  
  // Multiplayer events
  MP_CONNECT: 'mp:connect',
  MP_DISCONNECT: 'mp:disconnect',
  MP_PLAYER_JOIN: 'mp:player-join',
  MP_PLAYER_LEAVE: 'mp:player-leave',
  MP_STATE_SYNC: 'mp:state-sync',
  
  // Storage events
  STORAGE_SAVE: 'storage:save',
  STORAGE_LOAD: 'storage:load',
  STORAGE_ERROR: 'storage:error',
  
  // Theme events
  THEME_CHANGE: 'theme:change',
  
  // Network events
  NETWORK_ERROR: 'network:error',
  NETWORK_RETRY: 'network:retry',
} as const;

// =============================================================================
// PRESET CHANNELS
// =============================================================================
export const gameEvents = new EventChannel('game', true);
export const uiEvents = new EventChannel('ui', true);
export const playerEvents = new EventChannel('player', true);
export const storageEvents = new EventChannel('storage', true);
export const themeEvents = new EventChannel('theme', true);

// =============================================================================
// HOOKS-LIKE UTILITIES
// =============================================================================
function useEvent<T = any>(
  eventBus: EventEmitter,
  event: string,
  handler: EventHandler<T>,
  enabled: boolean = true
): void {
  if (!enabled) return;
  
  const unsubscribe = eventBus.on(event, handler);
  
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', unsubscribe);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export { EventEmitter, EventChannel };
export { globalBus };
export default globalBus;
