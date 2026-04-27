/**
 * MiniDev ONE Template - Real-time / Multiplayer System
 * 
 * WebSocket-based real-time communication for multiplayer games.
 * Supports: rooms, player sync, game state, chat, voice.
 */

import { FEATURES } from '@/lib/config';

// =============================================================================
// TYPES
// =============================================================================
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  ready: boolean;
  state: Record<string, any>;
  position?: { x: number; y: number };
}

interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  public: boolean;
  state: Record<string, any>;
  createdAt: number;
}

interface Message {
  type: string;
  from: string;
  data: any;
  timestamp: number;
}

// =============================================================================
// BASE TRANSPORT
// =============================================================================
abstract class BaseTransport {
  protected url: string;
  protected protocols?: string | string[];

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): void;
  abstract send(data: any): void;
  abstract on(event: string, callback: (data: any) => void): void;
  abstract off(event: string, callback: (data: any) => void): void;
}

// =============================================================================
// WEBSOCKET TRANSPORT
// =============================================================================
class WebSocketTransport extends BaseTransport {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private shouldReconnect: boolean = true;

  constructor(url: string) {
    super(url);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit('connect', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);
          } catch {
            this.emit('message', event.data);
          }
        };

        this.ws.onclose = () => {
          this.emit('disconnect', {});
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect_failed', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    this.emit('reconnecting', { attempt: this.reconnectAttempts });

    setTimeout(() => {
      this.connect().catch(() => {});
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// =============================================================================
// REALTIME MANAGER
// =============================================================================
class Realtime {
  private transport: BaseTransport | null = null;
  private url: string = '';
  private state: ConnectionState = 'disconnected';
  private playerId: string = '';
  private playerName: string = '';
  private currentRoom: Room | null = null;
  private players: Map<string, Player> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private heartbeatInterval: number | null = null;
  private pingInterval: number = 30000;

  constructor() {
    this.playerId = this.loadOrCreatePlayerId();
  }

  private loadOrCreatePlayerId(): string {
    let id = storage.get<string>('realtime_player_id');
    if (!id) {
      id = crypto.randomUUID();
      storage.set('realtime_player_id', id);
    }
    return id;
  }

  private updateState(newState: ConnectionState): void {
    const oldState = this.state;
    this.state = newState;
    this.emit('state_change', { from: oldState, to: newState });
  }

  // =============================================================================
  // CONNECTION
  // =============================================================================
  async connect(url: string): Promise<void> {
    if (this.state === 'connected') return;

    this.url = url;
    this.updateState('connecting');

    try {
      this.transport = new WebSocketTransport(url);
      
      this.transport.on('connect', () => {
        this.updateState('connected');
        this.startHeartbeat();
        this.emit('connect', {});
      });

      this.transport.on('disconnect', () => {
        this.updateState('disconnected');
        this.stopHeartbeat();
        this.emit('disconnect', {});
      });

      this.transport.on('message', (data) => {
        this.handleMessage(data);
      });

      this.transport.on('error', (error) => {
        this.emit('error', error);
      });

      await this.transport.connect();
    } catch (error) {
      this.updateState('disconnected');
      throw error;
    }
  }

  disconnect(): void {
    if (this.transport) {
      this.transport.disconnect();
      this.transport = null;
    }
    this.updateState('disconnected');
    this.stopHeartbeat();
    this.currentRoom = null;
    this.players.clear();
  }

  private send(data: any): void {
    if (this.transport && this.state === 'connected') {
      this.transport.send(data);
    }
  }

  // =============================================================================
  // MESSAGE HANDLING
  // =============================================================================
  private handleMessage(message: Message): void {
    switch (message.type) {
      case 'player_joined':
        this.handlePlayerJoined(message.data);
        break;
      case 'player_left':
        this.handlePlayerLeft(message.data);
        break;
      case 'player_state':
        this.handlePlayerState(message.data);
        break;
      case 'room_state':
        this.handleRoomState(message.data);
        break;
      case 'chat':
        this.emit('chat', message);
        break;
      case 'ping':
        this.send({ type: 'pong', timestamp: Date.now() });
        break;
      default:
        this.emit(message.type, message.data);
    }
  }

  private handlePlayerJoined(data: Player): void {
    this.players.set(data.id, data);
    this.emit('player_joined', data);
  }

  private handlePlayerLeft(data: { id: string }): void {
    this.players.delete(data.id);
    this.emit('player_left', data);
  }

  private handlePlayerState(data: { id: string; state: any }): void {
    const player = this.players.get(data.id);
    if (player) {
      player.state = data.state;
      this.emit('player_state', { player, state: data.state });
    }
  }

  private handleRoomState(data: Room): void {
    this.currentRoom = data;
    this.players.clear();
    data.players.forEach(p => this.players.set(p.id, p));
    this.emit('room_state', data);
  }

  // =============================================================================
  // PLAYER MANAGEMENT
  // =============================================================================
  setPlayerName(name: string): void {
    this.playerName = name;
    storage.set('realtime_player_name', name);
  }

  getPlayerId(): string {
    return this.playerId;
  }

  // =============================================================================
  // ROOM MANAGEMENT
  // =============================================================================
  async createRoom(options: {
    name: string;
    maxPlayers?: number;
    isPublic?: boolean;
    password?: string;
  }): Promise<Room> {
    return new Promise((resolve, reject) => {
      const handleRoomCreated = (data: Room) => {
        if (data.hostId === this.playerId) {
          this.off('room_state', handleRoomCreated);
          resolve(data);
        }
      };

      this.on('room_state', handleRoomCreated);

      this.send({
        type: 'create_room',
        id: this.playerId,
        name: options.name,
        maxPlayers: options.maxPlayers || 4,
        public: options.isPublic ?? true,
        password: options.password,
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        this.off('room_state', handleRoomCreated);
        reject(new Error('Room creation timeout'));
      }, 5000);
    });
  }

  async joinRoom(roomId: string, password?: string): Promise<void> {
    this.send({
      type: 'join_room',
      roomId,
      playerId: this.playerId,
      playerName: this.playerName,
      password,
    });
  }

  leaveRoom(): void {
    if (this.currentRoom) {
      this.send({
        type: 'leave_room',
        roomId: this.currentRoom.id,
        playerId: this.playerId,
      });
      this.currentRoom = null;
      this.players.clear();
    }
  }

  // =============================================================================
  // GAME STATE SYNC
  // =============================================================================
  updatePlayerState(state: Record<string, any>): void {
    this.send({
      type: 'player_state',
      playerId: this.playerId,
      state,
    });
  }

  updatePosition(x: number, y: number): void {
    this.updatePlayerState({ position: { x, y } });
  }

  updateRoomState(state: Record<string, any>): void {
    if (this.currentRoom) {
      this.send({
        type: 'room_state',
        roomId: this.currentRoom.id,
        state: { ...this.currentRoom.state, ...state },
      });
    }
  }

  // =============================================================================
  // CHAT
  // =============================================================================
  sendChat(message: string): void {
    this.send({
      type: 'chat',
      from: this.playerId,
      playerName: this.playerName,
      message,
      timestamp: Date.now(),
    });
  }

  // =============================================================================
  // EVENTS
  // =============================================================================
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  // =============================================================================
  // HEARTBEAT
  // =============================================================================
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, this.pingInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // =============================================================================
  // GETTERS
  // =============================================================================
  isConnected(): boolean {
    return this.state === 'connected';
  }

  getState(): ConnectionState {
    return this.state;
  }

  getRoom(): Room | null {
    return this.currentRoom;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }
}

// Import storage for player ID persistence
import { storage } from '../storage';

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================
export const realtime = new Realtime();

export { Realtime };
export default realtime;
