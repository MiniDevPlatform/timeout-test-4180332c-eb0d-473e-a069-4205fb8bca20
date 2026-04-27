/**
 * MiniDev ONE Template - Storage System
 * 
 * Multiple storage backends: localStorage, IndexedDB, Firebase, Supabase
 */

import { FEATURES } from '@/lib/config';

// =============================================================================
// TYPES
// =============================================================================
type StorageType = 'local' | 'indexeddb' | 'firebase' | 'supabase';

interface StorageOptions {
  type?: StorageType;
  prefix?: string;
  expiresIn?: number; // ms, for cached data
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

// =============================================================================
// ABSTRACT STORAGE
// =============================================================================
abstract class BaseStorage {
  protected prefix: string;

  constructor(prefix: string = 'minidev') {
    this.prefix = prefix;
  }

  abstract get<T>(key: string, defaultValue?: T): T | undefined;
  abstract set<T>(key: string, value: T, expiresIn?: number): void;
  abstract remove(key: string): void;
  abstract clear(): void;
  abstract keys(): string[];
  abstract export(): Record<string, any>;
  abstract import(data: Record<string, any>): boolean;
}

// =============================================================================
// LOCAL STORAGE
// =============================================================================
class LocalStorage extends BaseStorage {
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(this.prefix + '_' + key);
      if (!item) return defaultValue;
      
      const parsed: StorageItem<T> = JSON.parse(item);
      
      // Check expiration
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.remove(key);
        return defaultValue;
      }
      
      return parsed.value;
    } catch {
      return defaultValue;
    }
  }

  set<T>(key: string, value: T, expiresIn?: number): void {
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };
    localStorage.setItem(this.prefix + '_' + key, JSON.stringify(item));
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + '_' + key);
  }

  clear(): void {
    const prefix = this.prefix + '_';
    Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .forEach(k => localStorage.removeItem(k));
  }

  keys(): string[] {
    const prefix = this.prefix + '_';
    return Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .map(k => k.replace(prefix, ''));
  }

  export(): Record<string, any> {
    const data: Record<string, any> = {};
    this.keys().forEach(key => {
      data[key] = this.get(key);
    });
    return data;
  }

  import(data: Record<string, any>): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// INDEXED DB STORAGE
// =============================================================================
class IndexedDBStorage extends BaseStorage {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.prefix + '_db', 1);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('storage')) {
          db.createObjectStore('storage', { keyPath: 'key' });
        }
      };
    });

    return this.dbPromise;
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('storage', 'readonly');
      const store = tx.objectStore('storage');
      
      return new Promise((resolve) => {
        const request = store.get(this.prefix + '_' + key);
        request.onsuccess = () => {
          const result = request.result as StorageItem<T> | undefined;
          if (!result) {
            resolve(defaultValue);
          } else if (result.expiresAt && Date.now() > result.expiresAt) {
            this.remove(key);
            resolve(defaultValue);
          } else {
            resolve(result.value);
          }
        };
        request.onerror = () => resolve(defaultValue);
      });
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T, expiresIn?: number): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('storage', 'readwrite');
      const store = tx.objectStore('storage');
      
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      };
      
      store.put({ key: this.prefix + '_' + key, ...item });
    } catch (e) {
      console.error('IndexedDB set error:', e);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('storage', 'readwrite');
      const store = tx.objectStore('storage');
      store.delete(this.prefix + '_' + key);
    } catch (e) {
      console.error('IndexedDB remove error:', e);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('storage', 'readwrite');
      const store = tx.objectStore('storage');
      store.clear();
    } catch (e) {
      console.error('IndexedDB clear error:', e);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('storage', 'readonly');
      const store = tx.objectStore('storage');
      const prefix = this.prefix + '_';
      
      return new Promise((resolve) => {
        const request = store.getAllKeys();
        request.onsuccess = () => {
          resolve(request.result.filter((k: string) => k.startsWith(prefix)).map((k: string) => k.replace(prefix, '')));
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async export(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    const ks = await this.keys();
    for (const key of ks) {
      data[key] = await this.get(key);
    }
    return data;
  }

  async import(data: Record<string, any>): Promise<boolean> {
    try {
      for (const [key, value] of Object.entries(data)) {
        await this.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// FIREBASE STORAGE
// =============================================================================
class FirebaseStorage extends BaseStorage {
  private initialized = false;

  private async init(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Check if Firebase is available
      if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded');
        return false;
      }
      this.initialized = true;
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (!await this.init()) return defaultValue;
    
    try {
      const snapshot = await firebase.database().ref(`${this.prefix}_${key}`).once('value');
      return snapshot.val() ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!await this.init()) return;
    await firebase.database().ref(`${this.prefix}_${key}`).set(value);
  }

  async remove(key: string): Promise<void> {
    if (!await this.init()) return;
    await firebase.database().ref(`${this.prefix}_${key}`).remove();
  }

  async clear(): Promise<void> {
    if (!await this.init()) return;
    await firebase.database().ref(this.prefix).remove();
  }

  async keys(): Promise<string[]> {
    if (!await this.init()) return [];
    
    try {
      const snapshot = await firebase.database().ref(this.prefix).once('value');
      const data = snapshot.val() || {};
      return Object.keys(data);
    } catch {
      return [];
    }
  }

  async export(): Promise<Record<string, any>> {
    if (!await this.init()) return {};
    
    try {
      const snapshot = await firebase.database().ref(this.prefix).once('value');
      return snapshot.val() || {};
    } catch {
      return {};
    }
  }

  async import(data: Record<string, any>): Promise<boolean> {
    if (!await this.init()) return false;
    
    try {
      await firebase.database().ref(this.prefix).set(data);
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// SUPABASE STORAGE
// =============================================================================
class SupabaseStorage extends BaseStorage {
  private client: any = null;

  private async init(): Promise<boolean> {
    if (this.client) return true;
    
    try {
      // Check if Supabase is available
      if (typeof supabase === 'undefined') {
        console.warn('Supabase SDK not loaded');
        return false;
      }
      this.client = supabase;
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (!await this.init()) return defaultValue;
    
    try {
      const { data, error } = await this.client.from(this.prefix).select('value').eq('key', key).single();
      if (error || !data) return defaultValue;
      return data.value;
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!await this.init()) return;
    
    await this.client.from(this.prefix).upsert({ key, value, updated_at: new Date().toISOString() });
  }

  async remove(key: string): Promise<void> {
    if (!await this.init()) return;
    await this.client.from(this.prefix).delete().eq('key', key);
  }

  async clear(): Promise<void> {
    if (!await this.init()) return;
    await this.client.from(this.prefix).delete();
  }

  async keys(): Promise<string[]> {
    if (!await this.init()) return [];
    
    try {
      const { data } = await this.client.from(this.prefix).select('key');
      return data?.map((d: any) => d.key) || [];
    } catch {
      return [];
    }
  }

  async export(): Promise<Record<string, any>> {
    if (!await this.init()) return {};
    
    try {
      const { data } = await this.client.from(this.prefix).select('*');
      const result: Record<string, any> = {};
      data?.forEach((d: any) => { result[d.key] = d.value; });
      return result;
    } catch {
      return {};
    }
  }

  async import(data: Record<string, any>): Promise<boolean> {
    if (!await this.init()) return false;
    
    try {
      const rows = Object.entries(data).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));
      await this.client.from(this.prefix).upsert(rows);
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// STORAGE FACTORY
// =============================================================================
class Storage {
  private backend: BaseStorage;
  private isAsync: boolean;

  constructor(options: StorageOptions = {}) {
    const type = options.type || FEATURES.storage.type || 'local';
    this.prefix = options.prefix || 'minidev';
    this.isAsync = type !== 'local';

    switch (type) {
      case 'indexeddb':
        this.backend = new IndexedDBStorage(this.prefix);
        break;
      case 'firebase':
        this.backend = new FirebaseStorage(this.prefix);
        break;
      case 'supabase':
        this.backend = new SupabaseStorage(this.prefix);
        break;
      default:
        this.backend = new LocalStorage(this.prefix);
    }
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.backend.get(key, defaultValue);
  }

  set<T>(key: string, value: T, expiresIn?: number): void {
    this.backend.set(key, value, expiresIn);
  }

  remove(key: string): void {
    this.backend.remove(key);
  }

  clear(): void {
    this.backend.clear();
  }

  keys(): string[] {
    return this.backend.keys();
  }

  export(): Record<string, any> {
    return this.backend.export();
  }

  import(data: Record<string, any>): boolean {
    return this.backend.import(data);
  }

  // Async versions
  async getAsync<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (!this.isAsync) return this.get(key, defaultValue);
    return (this.backend as IndexedDBStorage).get(key, defaultValue);
  }

  async setAsync<T>(key: string, value: T, expiresIn?: number): Promise<void> {
    await (this.backend as any).set(key, value, expiresIn);
  }

  async clearAsync(): Promise<void> {
    await (this.backend as any).clear();
  }

  async exportAsync(): Promise<Record<string, any>> {
    if (!this.isAsync) return this.export();
    return (this.backend as any).export();
  }

  async importAsync(data: Record<string, any>): Promise<boolean> {
    if (!this.isAsync) return this.import(data);
    return (this.backend as any).import(data);
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================
export const storage = new Storage({ prefix: 'minidev' });

export { Storage };
export default storage;
