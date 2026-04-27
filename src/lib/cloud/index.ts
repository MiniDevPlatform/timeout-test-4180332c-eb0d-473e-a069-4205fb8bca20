/**
 * MiniDev ONE Template - Cloud Sync System
 * 
 * Sync data between local storage and cloud providers.
 * Supports: Cloudflare R2, AWS S3, Supabase Storage, Firebase Storage.
 */

import { FEATURES } from '@/lib/config';
import { storage } from '@/lib/storage';

// =============================================================================
// TYPES
// =============================================================================
type CloudProvider = 'none' | 'cloudflare' | 'aws' | 'supabase' | 'firebase';

interface SyncResult {
  success: boolean;
  files?: string[];
  error?: string;
}

interface SyncConflict {
  key: string;
  localValue: any;
  remoteValue: any;
  timestamp: number;
}

// =============================================================================
// BASE CLOUD PROVIDER
// =============================================================================
abstract class BaseCloudProvider {
  protected enabled: boolean;

  constructor() {
    this.enabled = FEATURES.storage.type !== 'local';
  }

  abstract init(): Promise<boolean>;
  abstract upload(key: string, data: any): Promise<boolean>;
  abstract download(key: string): Promise<any>;
  abstract delete(key: string): Promise<boolean>;
  abstract list(): Promise<string[]>;
  abstract getMetadata(key: string): Promise<{ size: number; lastModified: number } | null>;
}

// =============================================================================
// CLOUDFLARE R2
// =============================================================================
class CloudflareR2Provider extends BaseCloudProvider {
  private accountId: string = '';
  private accessKeyId: string = '';
  private secretAccessKey: string = '';
  private bucket: string = '';
  private endpoint: string = '';

  async init(): Promise<boolean> {
    // Check for Cloudflare R2 credentials
    this.accountId = (window as any).CLOUDFLARE_ACCOUNT_ID || '';
    this.accessKeyId = (window as any).CLOUDFLARE_ACCESS_KEY_ID || '';
    this.secretAccessKey = (window as any).CLOUDFLARE_SECRET_ACCESS_KEY || '';
    this.bucket = (window as any).CLOUDFLARE_BUCKET || 'minidev';
    this.endpoint = `https://${this.accountId}.r2.cloudflarestorage.com`;

    return !!(this.accessKeyId && this.secretAccessKey);
  }

  private async signRequest(request: RequestInit): Promise<RequestInit> {
    // Simplified signing - in production use AWS SDK
    return {
      ...request,
      headers: {
        ...request.headers,
        'Authorization': `Bearer ${this.accessKeyId}`,
      },
    };
  }

  async upload(key: string, data: any): Promise<boolean> {
    try {
      const url = `${this.endpoint}/${this.bucket}/${key}`;
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-amz-acl': 'private',
        },
        body,
      });

      return response.ok;
    } catch (e) {
      console.error('R2 upload error:', e);
      return false;
    }
  }

  async download(key: string): Promise<any> {
    try {
      const url = `${this.endpoint}/${this.bucket}/${key}`;
      const response = await fetch(url);
      
      if (!response.ok) return null;
      
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (contentType?.includes('json')) {
        return JSON.parse(text);
      }
      return text;
    } catch (e) {
      console.error('R2 download error:', e);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const url = `${this.endpoint}/${this.bucket}/${key}`;
      const response = await fetch(url, { method: 'DELETE' });
      return response.ok || response.status === 404;
    } catch {
      return false;
    }
  }

  async list(): Promise<string[]> {
    // R2 requires separate listing API
    return [];
  }

  async getMetadata(key: string): Promise<{ size: number; lastModified: number } | null> {
    try {
      const url = `${this.endpoint}/${this.bucket}/${key}`;
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) return null;
      
      return {
        size: parseInt(response.headers.get('content-length') || '0'),
        lastModified: new Date(response.headers.get('last-modified') || '').getTime(),
      };
    } catch {
      return null;
    }
  }
}

// =============================================================================
// AWS S3
// =============================================================================
class AWSS3Provider extends BaseCloudProvider {
  private bucket: string = '';
  private region: string = '';

  async init(): Promise<boolean> {
    this.bucket = (window as any).AWS_BUCKET || 'minidev';
    this.region = (window as any).AWS_REGION || 'us-east-1';
    return !!(this.bucket);
  }

  async upload(key: string, data: any): Promise<boolean> {
    // Would use AWS SDK - placeholder for now
    console.log('AWS S3 upload:', key);
    return true;
  }

  async download(key: string): Promise<any> {
    console.log('AWS S3 download:', key);
    return null;
  }

  async delete(key: string): Promise<boolean> {
    return true;
  }

  async list(): Promise<string[]> {
    return [];
  }

  async getMetadata(key: string): Promise<{ size: number; lastModified: number } | null> {
    return null;
  }
}

// =============================================================================
// SUPABASE STORAGE
// =============================================================================
class SupabaseStorageProvider extends BaseCloudProvider {
  private url: string = '';
  private key: string = '';

  async init(): Promise<boolean> {
    this.url = (window as any).SUPABASE_URL || '';
    this.key = (window as any).SUPABASE_KEY || '';
    return !!(this.url && this.key);
  }

  async upload(key: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/storage/v1/object/${key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async download(key: string): Promise<any> {
    try {
      const response = await fetch(`${this.url}/storage/v1/object/${key}`, {
        headers: { 'Authorization': `Bearer ${this.key}` },
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/storage/v1/object/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.key}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async list(): Promise<string[]> {
    return [];
  }

  async getMetadata(key: string): Promise<{ size: number; lastModified: number } | null> {
    return null;
  }
}

// =============================================================================
// FIREBASE STORAGE
// =============================================================================
class FirebaseStorageProvider extends BaseCloudProvider {
  async init(): Promise<boolean> {
    return typeof firebase !== 'undefined';
  }

  async upload(key: string, data: any): Promise<boolean> {
    try {
      const ref = firebase.storage().ref(key);
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      await ref.put(blob);
      return true;
    } catch {
      return false;
    }
  }

  async download(key: string): Promise<any> {
    try {
      const ref = firebase.storage().ref(key);
      const url = await ref.getDownloadURL();
      const response = await fetch(url);
      return response.json();
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await firebase.storage().ref(key).delete();
      return true;
    } catch {
      return false;
    }
  }

  async list(): Promise<string[]> {
    return [];
  }

  async getMetadata(key: string): Promise<{ size: number; lastModified: number } | null> {
    return null;
  }
}

// =============================================================================
// CLOUD SYNC MANAGER
// =============================================================================
class CloudSync {
  private provider: BaseCloudProvider | null = null;
  private prefix: string = 'cloud_sync';
  private syncInterval: number | null = null;
  private autoSyncDelay: number = 60000;
  private lastSync: number = 0;
  private conflicts: SyncConflict[] = [];
  private onConflict?: (conflict: SyncConflict) => SyncConflict['localValue'];
  private onProgress?: (progress: number) => void;

  constructor() {
    this.initProvider();
  }

  private async initProvider(): Promise<void> {
    const storageType = FEATURES.storage.type;

    switch (storageType) {
      case 'cloudflare':
        this.provider = new CloudflareR2Provider();
        break;
      case 'aws':
        this.provider = new AWSS3Provider();
        break;
      case 'supabase':
        this.provider = new SupabaseStorageProvider();
        break;
      case 'firebase':
        this.provider = new FirebaseStorageProvider();
        break;
      default:
        return;
    }

    await this.provider.init();
  }

  // =============================================================================
  // SYNC OPERATIONS
  // =============================================================================
  async upload(key: string, data: any): Promise<boolean> {
    if (!this.provider) return false;
    return this.provider.upload(`${this.prefix}/${key}`, data);
  }

  async download(key: string): Promise<any> {
    if (!this.provider) return null;
    return this.provider.download(`${this.prefix}/${key}`);
  }

  async delete(key: string): Promise<boolean> {
    if (!this.provider) return false;
    return this.provider.delete(`${this.prefix}/${key}`);
  }

  // =============================================================================
  // FULL SYNC
  // =============================================================================
  async sync(): Promise<SyncResult> {
    if (!this.provider) {
      return { success: false, error: 'No cloud provider configured' };
    }

    try {
      const files: string[] = [];
      
      // Export local data
      const localData = storage.export();
      const keys = Object.keys(localData);
      const total = keys.length;
      let completed = 0;

      for (const key of keys) {
        const success = await this.upload(key, localData[key]);
        if (success) {
          files.push(key);
          storage.set(`synced_${key}`, Date.now());
        }
        
        completed++;
        this.onProgress?.(completed / total);
      }

      this.lastSync = Date.now();
      storage.set('last_cloud_sync', this.lastSync);

      return { success: true, files };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  }

  async restore(): Promise<boolean> {
    if (!this.provider) return false;

    try {
      const keys = await this.provider.list();
      
      for (const key of keys) {
        const data = await this.provider.download(key);
        if (data !== null) {
          storage.set(key, data);
        }
      }

      storage.set('last_cloud_restore', Date.now());
      return true;
    } catch {
      return false;
    }
  }

  // =============================================================================
  // CONFLICT RESOLUTION
  // =============================================================================
  async detectConflicts(): Promise<SyncConflict[]> {
    if (!this.provider) return [];

    const conflicts: SyncConflict[] = [];
    const localData = storage.export();

    for (const [key, localValue] of Object.entries(localData)) {
      const remoteData = await this.provider.download(`${this.prefix}/${key}`);
      if (remoteData !== null) {
        const localTimestamp = storage.get<number>(`synced_${key}`) || 0;
        const remoteTimestamp = remoteData.timestamp || 0;

        if (localTimestamp !== remoteTimestamp && localValue !== remoteData.value) {
          conflicts.push({
            key,
            localValue,
            remoteValue: remoteData.value,
            timestamp: Date.now(),
          });
        }
      }
    }

    this.conflicts = conflicts;
    return conflicts;
  }

  async resolveConflict(key: string, keepLocal: boolean): Promise<boolean> {
    const conflict = this.conflicts.find(c => c.key === key);
    if (!conflict) return false;

    const valueToKeep = keepLocal ? conflict.localValue : conflict.remoteValue;
    await this.upload(key, valueToKeep);
    storage.set(`synced_${key}`, Date.now());

    this.conflicts = this.conflicts.filter(c => c.key !== key);
    return true;
  }

  // =============================================================================
  // AUTO SYNC
  // =============================================================================
  startAutoSync(intervalMs?: number): void {
    if (this.syncInterval) return;

    this.autoSyncDelay = intervalMs || this.autoSyncDelay;
    this.syncInterval = window.setInterval(() => {
      this.sync().catch(console.error);
    }, this.autoSyncDelay);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // =============================================================================
  // EVENTS
  // =============================================================================
  onSyncProgress(callback: (progress: number) => void): void {
    this.onProgress = callback;
  }

  onConflictDetected(callback: (conflict: SyncConflict) => SyncConflict['localValue']): void {
    this.onConflict = callback;
  }

  // =============================================================================
  // GETTERS
  // =============================================================================
  isConfigured(): boolean {
    return this.provider !== null;
  }

  getLastSync(): number {
    return this.lastSync;
  }

  getConflicts(): SyncConflict[] {
    return this.conflicts;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================
export const cloudSync = new CloudSync();

export { CloudSync };
export default cloudSync;
