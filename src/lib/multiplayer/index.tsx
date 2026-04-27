/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MINIDEV MULTIPLAYER SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Real-time multiplayer support for games:
 * - WebSocket-based P2P or server relay
 * - Room/lobby management
 * - Player synchronization
 * - Input sharing
 * - Game state replication
 * 
 * USAGE:
 *   import { multiplayer, useMultiplayer } from '@lib/multiplayer';
 *   
 *   // Host a game
 *   multiplayer.createRoom('my-game', { maxPlayers: 4 });
 *   
 *   // Join a game
 *   multiplayer.joinRoom('room-id');
 *   
 *   // Send input
 *   multiplayer.sendInput({ left: true });
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
export type PlayerRole = 'host' | 'player' | 'spectator';
export type MessageType = 'input' | 'state' | 'chat' | 'event' | 'sync';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  role: PlayerRole;
  ready: boolean;
  ping?: number;
  lastSeen: number;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameType: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  createdAt: number;
  config: RoomConfig;
}

export interface RoomConfig {
  public: boolean;
  allowSpectators: boolean;
  inputDelay: number;
  stateSync: 'full' | 'delta' | 'input';
}

export interface NetworkMessage {
  type: MessageType;
  from: string;
  to?: string;
  payload: unknown;
  timestamp: number;
  seq: number;
}

export interface RoomConfig {
  public: boolean;
  allowSpectators: boolean;
  inputDelay: number;
  stateSync: 'full' | 'delta' | 'input';
}

export interface MultiplayerConfig {
  enabled: boolean;
  serverUrl: string;
  roomSize: number;
  syncInterval: number;
  inputBufferSize: number;
  reconnectAttempts: number;
  reconnectDelay: number;
}

const DEFAULT_CONFIG: MultiplayerConfig = {
  enabled: true,
  serverUrl: 'wss://minidev-multiplayer.pages.dev', // Placeholder - use Cloudflare Durable Objects or PartyKit
  roomSize: 4,
  syncInterval: 60, // 60fps
  inputBufferSize: 10,
  reconnectAttempts: 5,
  reconnectDelay: 1000,
};

// ═══════════════════════════════════════════════════════════════════════════
// SIGNALING (Simple WebSocket-based)
// ═══════════════════════════════════════════════════════════════════════════
export class SignalingClient {
  private ws: WebSocket | null = null;
  private config: MultiplayerConfig;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Map<MessageType, (msg: NetworkMessage) => void> = new Map();
  private connectionHandlers: Map<ConnectionState, () => void> = new Map();
  private playerId: string;
  private playerName: string;

  constructor(config: MultiplayerConfig, playerId: string, playerName: string) {
    this.config = config;
    this.playerId = playerId;
    this.playerName = playerName;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl);
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.connectionHandlers.get('connected')?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data) as NetworkMessage;
            this.messageHandlers.get(msg.type)?.(msg);
          } catch (e) {
            console.error('[Signaling] Parse error:', e);
          }
        };

        this.ws.onclose = () => {
          this.connectionHandlers.get('disconnected')?.();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[Signaling] Error:', error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.log('[Signaling] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.connectionHandlers.get('reconnecting')?.();
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {});
    }, this.config.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
    this.ws = null;
  }

  send(type: MessageType, payload: unknown, to?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Signaling] Not connected');
      return;
    }

    const msg: NetworkMessage = {
      type,
      from: this.playerId,
      to,
      payload,
      timestamp: Date.now(),
      seq: Date.now(),
    };

    this.ws.send(JSON.stringify(msg));
  }

  on(type: MessageType, handler: (msg: NetworkMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  onConnection(state: ConnectionState, handler: () => void): void {
    this.connectionHandlers.set(state, handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTIPLAYER MANAGER
// ═══════════════════════════════════════════════════════════════════════════
export class MultiplayerManager {
  private config: MultiplayerConfig;
  private signaling: SignalingClient | null = null;
  private currentRoom: Room | null = null;
  private localPlayer: Player | null = null;
  private state: ConnectionState = 'disconnected';
  private stateSyncTimer: ReturnType<typeof setInterval> | null = null;
  private inputBuffer: Array<{ input: unknown; timestamp: number }> = [];

  constructor(config: MultiplayerConfig) {
    this.config = config;
  }

  async initialize(playerId: string, playerName: string): Promise<void> {
    this.signaling = new SignalingClient(this.config, playerId, playerName);
    this.localPlayer = { id: playerId, name: playerName, role: 'player', ready: false, lastSeen: Date.now() };

    // Connection handlers
    this.signaling.onConnection('connected', () => this.state = 'connected');
    this.signaling.onConnection('disconnected', () => this.state = 'disconnected');
    this.signaling.onConnection('reconnecting', () => this.state = 'reconnecting');
    this.signaling.onConnection('connecting', () => this.state = 'connecting');

    // Message handlers
    this.signaling.on('state', (msg) => this.handleStateSync(msg));
    this.signaling.on('input', (msg) => this.handleRemoteInput(msg));
    this.signaling.on('event', (msg) => this.handleGameEvent(msg));
    this.signaling.on('sync', (msg) => this.handleFullSync(msg));

    await this.signaling.connect();
  }

  // Room Management
  async createRoom(name: string, gameType: string, config?: Partial<RoomConfig>): Promise<Room> {
    const room: Room = {
      id: crypto.randomUUID(),
      name,
      hostId: this.localPlayer!.id,
      players: [this.localPlayer!],
      maxPlayers: config?.public ? 8 : this.config.roomSize,
      gameType,
      status: 'waiting',
      createdAt: Date.now(),
      config: { public: true, allowSpectators: true, inputDelay: 0, stateSync: 'delta', ...config },
    };

    this.signaling?.send('event', { action: 'create_room', room });
    this.currentRoom = room;
    this.startStateSync();

    return room;
  }

  async joinRoom(roomId: string): Promise<Room | null> {
    this.signaling?.send('event', { action: 'join_room', roomId });
    // Room data will come via sync message
    return this.currentRoom;
  }

  async leaveRoom(): Promise<void> {
    this.stopStateSync();
    this.signaling?.send('event', { action: 'leave_room', roomId: this.currentRoom?.id });
    this.currentRoom = null;
  }

  // Player Actions
  setReady(ready: boolean): void {
    this.localPlayer!.ready = ready;
    this.signaling?.send('event', { action: 'set_ready', ready });
  }

  setPlayerRole(role: PlayerRole): void {
    this.localPlayer!.role = role;
  }

  // Input Sharing
  sendInput(input: unknown): void {
    const buffered = { input, timestamp: Date.now() };
    this.inputBuffer.push(buffered);
    
    // Keep buffer size limited
    if (this.inputBuffer.length > this.config.inputBufferSize) {
      this.inputBuffer.shift();
    }

    this.signaling?.send('input', { input, buffer: this.inputBuffer });
  }

  // State Sync
  private startStateSync(): void {
    this.stateSyncTimer = setInterval(() => {
      if (this.currentRoom && this.currentRoom.status === 'playing') {
        this.signaling?.send('state', { 
          state: this.getCurrentState(),
          seq: Date.now()
        });
      }
    }, 1000 / this.config.syncInterval);
  }

  private stopStateSync(): void {
    if (this.stateSyncTimer) {
      clearInterval(this.stateSyncTimer);
      this.stateSyncTimer = null;
    }
  }

  getCurrentState(): unknown {
    // Override in game implementation
    return { players: this.currentRoom?.players };
  }

  private handleStateSync(msg: NetworkMessage): void {
    // Apply remote state
    console.log('[Multiplayer] State sync:', msg.payload);
  }

  private handleRemoteInput(msg: NetworkMessage): void {
    // Apply remote player input
    console.log('[Multiplayer] Remote input:', msg.payload);
  }

  private handleGameEvent(msg: NetworkMessage): void {
    const { action } = msg.payload as { action: string };
    
    switch (action) {
      case 'player_joined':
        const player = msg.payload as { player: Player };
        this.currentRoom?.players.push(player.player);
        break;
      case 'player_left':
        const { playerId } = msg.payload as { playerId: string };
        this.currentRoom!.players = this.currentRoom!.players.filter(p => p.id !== playerId);
        break;
      case 'game_start':
        this.currentRoom!.status = 'playing';
        break;
      case 'game_end':
        this.currentRoom!.status = 'finished';
        break;
    }
  }

  private handleFullSync(msg: NetworkMessage): void {
    this.currentRoom = msg.payload as Room;
  }

  // Getters
  getState(): ConnectionState { return this.state; }
  getCurrentRoom(): Room | null { return this.currentRoom; }
  getLocalPlayer(): Player | null { return this.localPlayer; }
  isHost(): boolean { return this.currentRoom?.hostId === this.localPlayer?.id; }
  isConnected(): boolean { return this.state === 'connected'; }

  destroy(): void {
    this.stopStateSync();
    this.signaling?.disconnect();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════
interface UseMultiplayerReturn {
  state: ConnectionState;
  room: Room | null;
  localPlayer: Player | null;
  isHost: boolean;
  isConnected: boolean;
  createRoom: (name: string, gameType: string) => Promise<Room>;
  joinRoom: (roomId: string) => Promise<Room | null>;
  leaveRoom: () => Promise<void>;
  sendInput: (input: unknown) => void;
  setReady: (ready: boolean) => void;
}

export function useMultiplayer(): UseMultiplayerReturn {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [room, setRoom] = useState<Room | null>(null);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [manager] = useState(() => new MultiplayerManager(DEFAULT_CONFIG));

  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Sync state from manager
  useEffect(() => {
    const interval = setInterval(() => {
      setState(manager.getState());
      setRoom(manager.getCurrentRoom());
      setLocalPlayer(manager.getLocalPlayer());
      setIsHost(manager.isHost());
      setIsConnected(manager.isConnected());
    }, 100);
    return () => clearInterval(interval);
  }, [manager]);

  return {
    state,
    room,
    localPlayer,
    isHost,
    isConnected,
    createRoom: manager.createRoom.bind(manager),
    joinRoom: manager.joinRoom.bind(manager),
    leaveRoom: manager.leaveRoom.bind(manager),
    sendInput: manager.sendInput.bind(manager),
    setReady: manager.setReady.bind(manager),
  };
}

// Context
const MultiplayerContext = createContext<UseMultiplayerReturn | null>(null);

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const multiplayer = useMultiplayer();
  return <MultiplayerContext.Provider value={multiplayer}>{children}</MultiplayerContext.Provider>;
}

export function useMultiplayerContext() {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) throw new Error('useMultiplayerContext must be used within MultiplayerProvider');
  return ctx;
}

// Default export
export default {
  MultiplayerManager,
  useMultiplayer,
  MultiplayerProvider,
  DEFAULT_CONFIG,
};
