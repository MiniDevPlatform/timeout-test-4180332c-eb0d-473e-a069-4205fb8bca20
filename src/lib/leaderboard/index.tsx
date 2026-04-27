/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MINIDEV LEADERBOARD SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Leaderboard and statistics:
 * - Global/local leaderboards
 * - Player rankings
 * - Statistics tracking
 * - Cloud save support
 * 
 * USAGE:
 *   import { leaderboard, useLeaderboard } from '@lib/leaderboard';
 *   
 *   leaderboard.submitScore('player-name', 1000, { level: 'level-1' });
 *   leaderboard.getTopScores(10);
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  level?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface LeaderboardConfig {
  id: string;
  name: string;
  type: 'global' | 'friends' | 'weekly' | 'daily';
  limit: number;
  saveToStorage: boolean;
  storageKey: string;
}

export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  highestScore: number;
  averageScore: number;
  totalTime: number;
  achievements: number;
  streak: number;
  bestStreak: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD MANAGER
// ═══════════════════════════════════════════════════════════════════════════
export class LeaderboardManager {
  private config: LeaderboardConfig;
  private entries: LeaderboardEntry[] = [];
  private playerId: string;
  private stats: Stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    highestScore: 0,
    averageScore: 0,
    totalTime: 0,
    achievements: 0,
    streak: 0,
    bestStreak: 0,
  };

  constructor(config: LeaderboardConfig, playerId: string) {
    this.config = config;
    this.playerId = playerId;
    this.load();
  }

  // Score Management
  submitScore(playerName: string, score: number, options?: { level?: string; metadata?: Record<string, unknown> }): LeaderboardEntry {
    const entry: LeaderboardEntry = {
      rank: 0,
      playerId: this.playerId,
      playerName,
      score,
      level: options?.level,
      timestamp: Date.now(),
      metadata: options?.metadata,
    };

    // Add to entries
    this.entries.push(entry);

    // Sort and update ranks
    this.entries.sort((a, b) => b.score - a.score);
    this.entries = this.entries.slice(0, this.config.limit);
    this.entries.forEach((e, i) => e.rank = i + 1);

    // Update stats
    this.stats.gamesPlayed++;
    this.stats.totalScore += score;
    this.stats.averageScore = this.stats.totalScore / this.stats.gamesPlayed;
    if (score > this.stats.highestScore) {
      this.stats.highestScore = score;
      this.stats.streak++;
      if (this.stats.streak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.streak;
      }
    } else {
      this.stats.streak = 0;
    }

    this.save();
    return entry;
  }

  getTopScores(limit?: number): LeaderboardEntry[] {
    return this.entries.slice(0, limit || this.config.limit);
  }

  getPlayerRank(): number {
    const entry = this.entries.find(e => e.playerId === this.playerId);
    return entry?.rank || -1;
  }

  getPlayerBestScore(): number {
    const entries = this.entries.filter(e => e.playerId === this.playerId);
    return entries.length > 0 ? Math.max(...entries.map(e => e.score)) : 0;
  }

  getPlayerScores(): LeaderboardEntry[] {
    return this.entries.filter(e => e.playerId === this.playerId);
  }

  // Stats
  getStats(): Stats {
    return { ...this.stats };
  }

  updateStats(updates: Partial<Stats>): void {
    this.stats = { ...this.stats, ...updates };
    this.save();
  }

  incrementGamesPlayed(): void {
    this.stats.gamesPlayed++;
    this.save();
  }

  incrementGamesWon(): void {
    this.stats.gamesWon++;
    this.save();
  }

  addAchievement(): void {
    this.stats.achievements++;
    this.save();
  }

  // Persistence
  private load(): void {
    if (!this.config.saveToStorage) return;
    
    try {
      const saved = localStorage.getItem(`${this.config.storageKey}-entries`);
      if (saved) {
        this.entries = JSON.parse(saved);
      }
      
      const savedStats = localStorage.getItem(`${this.config.storageKey}-stats`);
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }
    } catch (e) {
      console.warn('[Leaderboard] Load failed:', e);
    }
  }

  private save(): void {
    if (!this.config.saveToStorage) return;
    
    localStorage.setItem(`${this.config.storageKey}-entries`, JSON.stringify(this.entries));
    localStorage.setItem(`${this.config.storageKey}-stats`, JSON.stringify(this.stats));
  }

  clear(): void {
    this.entries = [];
    this.stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      highestScore: 0,
      averageScore: 0,
      totalTime: 0,
      achievements: 0,
      streak: 0,
      bestStreak: 0,
    };
    this.save();
  }

  getConfig(): LeaderboardConfig {
    return this.config;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════
export const createLeaderboardConfig = (id: string, name: string): LeaderboardConfig => ({
  id,
  name,
  type: 'global',
  limit: 100,
  saveToStorage: true,
  storageKey: `minidev-leaderboard-${id}`,
});

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════
interface UseLeaderboardReturn {
  topScores: LeaderboardEntry[];
  myRank: number;
  myBestScore: number;
  myScores: LeaderboardEntry[];
  stats: Stats;
  submitScore: (name: string, score: number, options?: { level?: string; metadata?: Record<string, unknown> }) => LeaderboardEntry;
  refresh: () => void;
}

export function useLeaderboard(id: string, name: string, playerId: string): UseLeaderboardReturn {
  const [leaderboard] = useState(() => {
    const config = createLeaderboardConfig(id, name);
    return new LeaderboardManager(config, playerId);
  });

  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState(-1);
  const [myBestScore, setMyBestScore] = useState(0);
  const [myScores, setMyScores] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats>(leaderboard.getStats());

  const refresh = useCallback(() => {
    setTopScores(leaderboard.getTopScores());
    setMyRank(leaderboard.getPlayerRank());
    setMyBestScore(leaderboard.getPlayerBestScore());
    setMyScores(leaderboard.getPlayerScores());
    setStats(leaderboard.getStats());
  }, [leaderboard]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    topScores,
    myRank,
    myBestScore,
    myScores,
    stats,
    submitScore: leaderboard.submitScore.bind(leaderboard),
    refresh,
  };
}

// Context
const LeaderboardContext = createContext<UseLeaderboardReturn | null>(null);

export function LeaderboardProvider({ children, id, name, playerId }: { children: React.ReactNode; id: string; name: string; playerId: string }) {
  const leaderboard = useLeaderboard(id, name, playerId);
  return <LeaderboardContext.Provider value={leaderboard}>{children}</LeaderboardContext.Provider>;
}

export function useLeaderboardContext() {
  const ctx = useContext(LeaderboardContext);
  if (!ctx) throw new Error('useLeaderboardContext must be used within LeaderboardProvider');
  return ctx;
}

export default {
  LeaderboardManager,
  useLeaderboard,
  LeaderboardProvider,
  createLeaderboardConfig,
};
