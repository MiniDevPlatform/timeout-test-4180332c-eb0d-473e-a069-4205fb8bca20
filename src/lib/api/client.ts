/**
 * MiniDev ONE Template - API Client
 * 
 * Type-safe API client for backend communication.
 */

import { FEATURES } from '@/lib/config';

// =============================================================================
// TYPES
// =============================================================================
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

// =============================================================================
// API CLIENT
// =============================================================================
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set auth token
  setToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove auth token
  clearToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  // Build URL
  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return url;
  }

  // Request
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      credentials: options.credentials || 'include',
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    if (options.signal) {
      config.signal = options.signal;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      return {
        success: response.ok,
        data: data?.data ?? data,
        error: data?.error || response.statusText,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // GET
  async get<T>(endpoint: string, params?: Record<string, string | number>, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  // POST
  async post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, options);
  }

  // PUT
  async put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  // PATCH
  async patch<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  // DELETE
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await fetch(this.buildUrl(endpoint), {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
      },
      body: formData,
      credentials: 'include',
    });

    const data = await response.json().catch(() => null);

    return {
      success: response.ok,
      data: data?.data ?? data,
      error: data?.error || response.statusText,
      status: response.status,
    };
  }
}

// =============================================================================
// API ENDPOINTS
// =============================================================================
class ProjectsApi {
  constructor(private client: ApiClient) {}

  async list() {
    return this.client.get<Project[]>('/api/projects');
  }

  async get(id: string) {
    return this.client.get<Project>(`/api/projects/${id}`);
  }

  async create(data: Partial<Project>) {
    return this.client.post<Project>('/api/projects', data);
  }

  async update(id: string, data: Partial<Project>) {
    return this.client.put<Project>(`/api/projects/${id}`, data);
  }

  async delete(id: string) {
    return this.client.delete(`/api/projects/${id}`);
  }

  async deploy(id: string) {
    return this.client.post<{ url: string }>(`/api/projects/${id}/deploy`);
  }

  async generate(data: ProjectSpec) {
    return this.client.post<Project>('/api/projects/generate', data);
  }
}

class LeaderboardApi {
  constructor(private client: ApiClient) {}

  async getTop(limit: number = 10) {
    return this.client.get<LeaderboardEntry[]>(`/api/leaderboard`, { limit });
  }

  async submit(score: number, data?: Record<string, any>) {
    return this.client.post<LeaderboardEntry>('/api/leaderboard', { score, data });
  }

  async getRank(playerId: string) {
    return this.client.get<{ rank: number; total: number }>(`/api/leaderboard/rank/${playerId}`);
  }
}

// =============================================================================
// TYPES
// =============================================================================
interface Project {
  id: string;
  name: string;
  type: 'game' | 'app' | 'website';
  status: string;
  createdAt: string;
  updatedAt: string;
  repoUrl?: string;
  pagesUrl?: string;
}

interface ProjectSpec {
  name: string;
  type: 'game' | 'app' | 'website';
  category: string;
  difficulty?: string;
  size?: string;
  multiplayer?: string;
  theme?: string;
  extras?: string[];
  character?: Record<string, any>;
}

interface LeaderboardEntry {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  createdAt: string;
  data?: Record<string, any>;
}

// =============================================================================
// EXPORTS
// =============================================================================
export const api = new ApiClient(FEATURES.api.baseUrl || '');

export const projectsApi = new ProjectsApi(api);
export const leaderboardApi = new LeaderboardApi(api);

export { ApiClient };
export default api;
