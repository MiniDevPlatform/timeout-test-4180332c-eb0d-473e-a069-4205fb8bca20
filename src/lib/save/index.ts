/**
 * MiniDev ONE Template - Save/Load System
 * 
 * Game state persistence with slots, autosave, and cloud sync.
 */

import { logger } from '@/lib/logger';
import { storage } from '@/lib/storage';
import { cloudSync } from '@/lib/cloud';
import { EventEmitter } from '@/lib/events';

// =============================================================================
// TYPES
// =============================================================================
interface SaveSlot {
  id: number;
  name: string;
  timestamp: number;
  playTime: number;
  level: number;
  screenshot?: string;
  data: GameSaveData;
}

interface GameSaveData {
  version: string;
  player: PlayerSaveData;
  progress: ProgressSaveData;
  settings: SettingsSaveData;
  stats: StatsSaveData;
  custom?: Record<string, any>;
}

interface PlayerSaveData {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  inventory: Record<string, number>;
  equipment: Record<string, string>;
  quests: Record<string, any>;
}

interface ProgressSaveData {
  level: number;
  unlockedLevels: string[];
  completedLevels: string[];
  achievements: string[];
  collectibles: Record<string, number>;
}

interface SettingsSaveData {
  volume: number;
  musicVolume: number;
  sfxVolume: number;
  controls: Record<string, number>;
}

interface StatsSaveData {
  plays: number;
  wins: number;
  losses: number;
  timePlayed: number;
  highScore: number;
}

// =============================================================================
// SAVE MANAGER
// =============================================================================
class SaveManager {
  private slots: SaveSlot[] = [];
  private currentSlot: number = -1;
  private autosaveEnabled: boolean = true;
  private autosaveInterval: number = 60000; // 1 minute
  private autosaveTimer: number | null = null;
  private saveKey: string = 'save_slots';
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.loadSlots();
  }

  // =============================================================================
  // SLOTS
  // =============================================================================
  getSlots(): SaveSlot[] {
    return this.slots;
  }

  getSlot(index: number): SaveSlot | undefined {
    return this.slots[index];
  }

  getCurrentSlot(): SaveSlot | undefined {
    return this.currentSlot >= 0 ? this.slots[this.currentSlot] : undefined;
  }

  // =============================================================================
  // SAVE OPERATIONS
  // =============================================================================
  save(slotIndex: number, data: GameSaveData, options?: {
    name?: string;
    screenshot?: string;
    autosave?: boolean;
  }): boolean {
    try {
      const now = Date.now();
      const slot: SaveSlot = {
        id: slotIndex,
        name: options?.name || `Save ${slotIndex + 1}`,
        timestamp: now,
        playTime: options?.autosave ? (this.slots[slotIndex]?.playTime || 0) + this.autosaveInterval : 0,
        level: data.progress.level,
        screenshot: options?.screenshot,
        data,
      };

      this.slots[slotIndex] = slot;
      this.currentSlot = slotIndex;
      this.saveSlots();

      logger.info('save', `Game saved to slot ${slotIndex + 1}`);
      this.emitter.emit('save', { slot: slotIndex, slotData: slot });

      return true;
    } catch (error) {
      logger.error('save', `Failed to save to slot ${slotIndex}`, error);
      return false;
    }
  }

  load(slotIndex: number): GameSaveData | null {
    const slot = this.slots[slotIndex];
    if (!slot) {
      logger.warn('save', `Slot ${slotIndex + 1} is empty`);
      return null;
    }

    this.currentSlot = slotIndex;
    logger.info('save', `Game loaded from slot ${slotIndex + 1}`);
    this.emitter.emit('load', { slot: slotIndex, slotData: slot });

    return slot.data;
  }

  delete(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return false;

    this.slots[slotIndex] = null as any;
    if (this.currentSlot === slotIndex) {
      this.currentSlot = -1;
    }
    this.saveSlots();

    logger.info('save', `Save slot ${slotIndex + 1} deleted`);
    this.emitter.emit('delete', { slot: slotIndex });

    return true;
  }

  copy(fromSlot: number, toSlot: number): boolean {
    const source = this.slots[fromSlot];
    if (!source) return false;

    const copy: SaveSlot = {
      ...source,
      id: toSlot,
      name: `Save ${toSlot + 1}`,
      timestamp: Date.now(),
    };

    this.slots[toSlot] = copy;
    this.saveSlots();

    return true;
  }

  // =============================================================================
  // AUTOSAVE
  // =============================================================================
  enableAutosave(intervalMs?: number): void {
    this.autosaveEnabled = true;
    if (intervalMs) {
      this.autosaveInterval = intervalMs;
    }

    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
    }

    this.autosaveTimer = window.setInterval(() => {
      if (this.currentSlot >= 0) {
        this.autosave();
      }
    }, this.autosaveInterval);

    logger.info('save', 'Autosave enabled');
  }

  disableAutosave(): void {
    this.autosaveEnabled = false;
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    logger.info('save', 'Autosave disabled');
  }

  private autosave(): void {
    if (this.currentSlot < 0) return;

    const currentSave = this.getCurrentSlot();
    if (!currentSave) return;

    // Create autosave with incremented play time
    this.save(this.currentSlot, currentSave.data, {
      name: currentSave.name,
      screenshot: currentSave.screenshot,
      autosave: true,
    });
  }

  // =============================================================================
  // QUICK SAVE/LOAD
  // =============================================================================
  quickSave(data: GameSaveData): boolean {
    // Use slot 9 as quick save (reserved)
    return this.save(9, data, { name: 'Quick Save' });
  }

  quickLoad(): GameSaveData | null {
    return this.load(9);
  }

  hasQuickSave(): boolean {
    return !!this.slots[9];
  }

  // =============================================================================
  // EXPORT/IMPORT
  // =============================================================================
  exportSlot(slotIndex: number): string | null {
    const slot = this.slots[slotIndex];
    if (!slot) return null;

    const exportData = {
      ...slot,
      exportedAt: Date.now(),
      version: '1.0',
    };

    return JSON.stringify(exportData);
  }

  importSlot(jsonString: string, slotIndex: number): boolean {
    try {
      const importData = JSON.parse(jsonString);
      
      const slot: SaveSlot = {
        id: slotIndex,
        name: importData.name || `Save ${slotIndex + 1}`,
        timestamp: importData.timestamp || Date.now(),
        playTime: importData.playTime || 0,
        level: importData.data?.progress?.level || 1,
        screenshot: importData.screenshot,
        data: importData.data,
      };

      this.slots[slotIndex] = slot;
      this.saveSlots();

      logger.info('save', `Save imported to slot ${slotIndex + 1}`);
      return true;
    } catch (error) {
      logger.error('save', 'Failed to import save', error);
      return false;
    }
  }

  // =============================================================================
  // PERSISTENCE
  // =============================================================================
  private saveSlots(): void {
    const serializable = this.slots.map(slot => {
      if (!slot) return null;
      return {
        ...slot,
        data: {
          ...slot.data,
          // Don't save large custom data
          custom: undefined,
        },
      };
    });
    storage.set(this.saveKey, serializable);
  }

  private loadSlots(): void {
    const data = storage.get<SaveSlot[]>(this.saveKey);
    if (data) {
      this.slots = data.map((slot, index) => slot ? { ...slot, id: index } : slot);
    }
    // Ensure 10 slots
    while (this.slots.length < 10) {
      this.slots.push(null as any);
    }
  }

  // =============================================================================
  // CLOUD SYNC
  // =============================================================================
  async uploadToCloud(slotIndex: number): Promise<boolean> {
    const slot = this.slots[slotIndex];
    if (!slot) return false;

    try {
      const success = await cloudSync.upload(`save_${slotIndex}`, slot.data);
      if (success) {
        this.emitter.emit('cloud_upload', { slot: slotIndex });
      }
      return success;
    } catch (error) {
      logger.error('save', 'Failed to upload save to cloud', error);
      return false;
    }
  }

  async downloadFromCloud(slotIndex: number): Promise<boolean> {
    try {
      const data = await cloudSync.download(`save_${slotIndex}`);
      if (data) {
        this.save(slotIndex, data as GameSaveData);
        this.emitter.emit('cloud_download', { slot: slotIndex });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('save', 'Failed to download save from cloud', error);
      return false;
    }
  }

  async syncAllSlots(): Promise<number> {
    let synced = 0;
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i]) {
        const success = await this.uploadToCloud(i);
        if (success) synced++;
      }
    }
    return synced;
  }

  // =============================================================================
  // CREATE DEFAULT SAVE
  // =============================================================================
  createDefaultSave(options?: {
    name?: string;
    level?: number;
  }): GameSaveData {
    return {
      version: '1.0',
      player: {
        x: 100,
        y: 300,
        health: 100,
        maxHealth: 100,
        lives: 3,
        score: 0,
        inventory: {},
        equipment: {},
        quests: {},
      },
      progress: {
        level: options?.level || 1,
        unlockedLevels: ['level_1'],
        completedLevels: [],
        achievements: [],
        collectibles: {},
      },
      settings: {
        volume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.7,
        controls: {},
      },
      stats: {
        plays: 0,
        wins: 0,
        losses: 0,
        timePlayed: 0,
        highScore: 0,
      },
    };
  }

  // =============================================================================
  // EVENTS
  // =============================================================================
  on(event: string, handler: (data: any) => void): () => void {
    return this.emitter.on(event, handler);
  }

  off(event: string): void {
    this.emitter.off(event);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export { SaveManager };
export default new SaveManager();
