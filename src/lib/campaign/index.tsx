/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MINIDEV CAMPAIGN SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Campaign/progression system for games:
 * - Level progression (unlock levels)
 * - Achievement system
 * - Statistics tracking
 * - Unlockable content
 * - Save/load progress
 * 
 * USAGE:
 *   import { campaign, useCampaign } from '@lib/campaign';
 *   
 *   // Define campaign
 *   campaign.addLevel({ id: 'level-1', name: 'Tutorial', unlocks: ['level-2'] });
 *   
 *   // Progress
 *   campaign.completeLevel('level-1', { score: 1000, time: 60 });
 *   campaign.unlockAchievement('first-win');
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  unlocks: string[];  // Level IDs this unlocks
  requires: string[]; // Level IDs required to unlock
  starScore: number[]; // Score thresholds for 1, 2, 3 stars
  timeBonus: number; // Bonus points for time-based completion
  metadata?: Record<string, unknown>;
}

export interface LevelProgress {
  levelId: string;
  completed: boolean;
  bestScore: number;
  bestTime: number;
  stars: number; // 0-3
  attempts: number;
  completedAt?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'skill' | 'collection' | 'special';
  points: number;
  secret: boolean;
  unlocks?: string[]; // Content this unlocks
  requirements: AchievementRequirement[];
}

export interface AchievementRequirement {
  type: 'score' | 'time' | 'combo' | 'count' | 'streak';
  target: number;
  levelId?: string;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface PlayerStats {
  totalScore: number;
  totalTime: number;
  totalLevelsCompleted: number;
  totalAchievements: number;
  gamesPlayed: number;
  winStreak: number;
  bestStreak: number;
  highestCombo: number;
  highestScore: number;
}

export interface CampaignConfig {
  id: string;
  name: string;
  description: string;
  levels: Level[];
  achievements: Achievement[];
  startLevel: string;
  saveToStorage: boolean;
  storageKey: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGN MANAGER
// ═══════════════════════════════════════════════════════════════════════════
export class CampaignManager {
  private config: CampaignConfig;
  private progress: Map<string, LevelProgress> = new Map();
  private achievements: Map<string, AchievementProgress> = new Map();
  private stats: PlayerStats = {
    totalScore: 0,
    totalTime: 0,
    totalLevelsCompleted: 0,
    totalAchievements: 0,
    gamesPlayed: 0,
    winStreak: 0,
    bestStreak: 0,
    highestCombo: 0,
    highestScore: 0,
  };

  constructor(config: CampaignConfig) {
    this.config = config;
    this.loadProgress();
  }

  // Progress Management
  getLevelProgress(levelId: string): LevelProgress | undefined {
    return this.progress.get(levelId);
  }

  getAllProgress(): LevelProgress[] {
    return Array.from(this.progress.values());
  }

  isLevelUnlocked(levelId: string): boolean {
    const level = this.config.levels.find(l => l.id === levelId);
    if (!level) return false;
    if (level.requires.length === 0) return true;
    
    return level.requires.every(reqId => {
      const progress = this.progress.get(reqId);
      return progress?.completed ?? false;
    });
  }

  getUnlockedLevels(): Level[] {
    return this.config.levels.filter(l => this.isLevelUnlocked(l.id));
  }

  getNextLevel(currentLevelId: string): Level | null {
    const currentIndex = this.config.levels.findIndex(l => l.id === currentLevelId);
    if (currentIndex === -1 || currentIndex >= this.config.levels.length - 1) return null;
    
    const nextLevel = this.config.levels[currentIndex + 1];
    return this.isLevelUnlocked(nextLevel.id) ? nextLevel : null;
  }

  completeLevel(levelId: string, result: { score: number; time: number }): { stars: number; unlocked: Level[] } {
    const level = this.config.levels.find(l => l.id === levelId);
    if (!level) return { stars: 0, unlocked: [] };

    // Calculate stars
    let stars = 0;
    for (let i = 0; i < level.starScore.length; i++) {
      if (result.score >= level.starScore[i]) stars = i + 1;
    }

    // Update progress
    const existing = this.progress.get(levelId) || {
      levelId,
      completed: false,
      bestScore: 0,
      bestTime: Infinity,
      stars: 0,
      attempts: 0,
    };

    const updated: LevelProgress = {
      levelId,
      completed: true,
      bestScore: Math.max(existing.bestScore, result.score),
      bestTime: Math.min(existing.bestTime, result.time),
      stars: Math.max(existing.stars, stars),
      attempts: existing.attempts + 1,
      completedAt: Date.now(),
    };

    this.progress.set(levelId, updated);

    // Unlock next levels
    const unlocked: Level[] = [];
    for (const unlockId of level.unlocks) {
      if (this.isLevelUnlocked(unlockId)) {
        const unlLevel = this.config.levels.find(l => l.id === unlockId);
        if (unlLevel) unlocked.push(unlLevel);
      }
    }

    // Update stats
    this.stats.totalScore += result.score;
    this.stats.totalTime += result.time;
    this.stats.totalLevelsCompleted++;
    this.stats.gamesPlayed++;
    if (result.score > this.stats.highestScore) this.stats.highestScore = result.score;

    this.saveProgress();
    this.checkAchievements();

    return { stars, unlocked };
  }

  // Achievement System
  getAchievements(): Achievement[] {
    return this.config.achievements;
  }

  getAchievementProgress(achievementId: string): AchievementProgress | undefined {
    return this.achievements.get(achievementId);
  }

  getUnlockedAchievements(): Achievement[] {
    return this.config.achievements.filter(a => 
      this.achievements.get(a.id)?.unlocked ?? false
    );
  }

  unlockAchievement(achievementId: string): boolean {
    const achievement = this.config.achievements.find(a => a.id === achievementId);
    if (!achievement) return false;

    const existing = this.achievements.get(achievementId);
    if (existing?.unlocked) return false;

    this.achievements.set(achievementId, {
      achievementId,
      progress: 100,
      unlocked: true,
      unlockedAt: Date.now(),
    });

    this.stats.totalAchievements++;
    this.saveProgress();

    return true;
  }

  checkAchievements(): void {
    for (const achievement of this.config.achievements) {
      if (this.achievements.get(achievement.id)?.unlocked) continue;

      let progress = 0;
      let meetsRequirement = true;

      for (const req of achievement.requirements) {
        const reqProgress = this.calculateRequirementProgress(req);
        progress += reqProgress;
        
        if (reqProgress < req.target) {
          meetsRequirement = false;
        }
      }

      if (meetsRequirement) {
        this.unlockAchievement(achievement.id);
      } else {
        this.achievements.set(achievement.id, {
          achievementId: achievement.id,
          progress: Math.min(progress / achievement.requirements.length, 99),
          unlocked: false,
        });
      }
    }
  }

  private calculateRequirementProgress(req: AchievementRequirement): number {
    switch (req.type) {
      case 'score':
        return Math.min(this.stats.totalScore / req.target * 100, 100);
      case 'time':
        return this.stats.totalTime > 0 ? Math.min(req.target / this.stats.totalTime * 100, 100) : 0;
      case 'count':
        return Math.min(this.stats.totalLevelsCompleted / req.target * 100, 100);
      case 'combo':
        return Math.min(this.stats.highestCombo / req.target * 100, 100);
      case 'streak':
        return Math.min(this.stats.winStreak / req.target * 100, 100);
      default:
        return 0;
    }
  }

  // Statistics
  getStats(): PlayerStats {
    return { ...this.stats };
  }

  incrementGamesPlayed(): void {
    this.stats.gamesPlayed++;
    this.saveProgress();
  }

  addToWinStreak(): void {
    this.stats.winStreak++;
    if (this.stats.winStreak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.winStreak;
    }
  }

  resetWinStreak(): void {
    this.stats.winStreak = 0;
  }

  updateHighestCombo(combo: number): void {
    if (combo > this.stats.highestCombo) {
      this.stats.highestCombo = combo;
    }
  }

  // Save/Load
  private loadProgress(): void {
    if (!this.config.saveToStorage) return;
    
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.progress = new Map(Object.entries(data.progress || {}));
        this.achievements = new Map(Object.entries(data.achievements || {}));
        this.stats = { ...this.stats, ...data.stats };
      }
    } catch (e) {
      console.warn('[Campaign] Load failed:', e);
    }
  }

  saveProgress(): void {
    if (!this.config.saveToStorage) return;
    
    const data = {
      progress: Object.fromEntries(this.progress),
      achievements: Object.fromEntries(this.achievements),
      stats: this.stats,
    };
    
    localStorage.setItem(this.config.storageKey, JSON.stringify(data));
  }

  resetProgress(): void {
    this.progress.clear();
    this.achievements.clear();
    this.stats = {
      totalScore: 0,
      totalTime: 0,
      totalLevelsCompleted: 0,
      totalAchievements: 0,
      gamesPlayed: 0,
      winStreak: 0,
      bestStreak: 0,
      highestCombo: 0,
      highestScore: 0,
    };
    this.saveProgress();
  }

  getConfig(): CampaignConfig {
    return this.config;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CAMPAIGN CONFIG
// ═══════════════════════════════════════════════════════════════════════════
export const createDefaultCampaign = (gameType: string): CampaignConfig => ({
  id: gameType,
  name: `${gameType} Campaign`,
  description: 'Complete levels to unlock new challenges',
  startLevel: 'level-1',
  saveToStorage: true,
  storageKey: `minidev-campaign-${gameType}`,
  levels: [
    { id: 'level-1', name: 'Tutorial', description: 'Learn the basics', difficulty: 'easy', unlocks: ['level-2'], requires: [], starScore: [100, 500, 1000], timeBonus: 50 },
    { id: 'level-2', name: 'Getting Started', description: 'Build on what you learned', difficulty: 'easy', unlocks: ['level-3'], requires: ['level-1'], starScore: [200, 600, 1200], timeBonus: 40 },
    { id: 'level-3', name: 'Challenge', description: 'Test your skills', difficulty: 'normal', unlocks: ['level-4'], requires: ['level-2'], starScore: [300, 700, 1500], timeBonus: 30 },
    { id: 'level-4', name: 'Expert', description: 'Only for the best', difficulty: 'hard', unlocks: [], requires: ['level-3'], starScore: [500, 1000, 2000], timeBonus: 20 },
  ],
  achievements: [
    { id: 'first-win', name: 'First Victory', description: 'Complete your first level', icon: '🏆', category: 'progress', points: 10, secret: false, requirements: [{ type: 'count', target: 1 }] },
    { id: 'score-1000', name: 'High Scorer', description: 'Reach 1000 total points', icon: '⭐', category: 'skill', points: 25, secret: false, requirements: [{ type: 'score', target: 1000 }] },
    { id: 'combo-5', name: 'Combo Master', description: 'Get a 5x combo', icon: '🔥', category: 'skill', points: 15, secret: false, requirements: [{ type: 'combo', target: 5 }] },
    { id: 'streak-3', name: 'On Fire', description: 'Win 3 levels in a row', icon: '💫', category: 'skill', points: 20, secret: false, requirements: [{ type: 'streak', target: 3 }] },
    { id: 'complete', name: 'Campaign Complete', description: 'Finish all levels', icon: '👑', category: 'special', points: 100, secret: true, requirements: [{ type: 'count', target: 4 }] },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════
interface UseCampaignReturn {
  campaign: CampaignManager;
  levels: Level[];
  achievements: Achievement[];
  stats: PlayerStats;
  progress: LevelProgress[];
  isLevelUnlocked: (levelId: string) => boolean;
  completeLevel: (levelId: string, result: { score: number; time: number }) => ReturnType<CampaignManager['completeLevel']>;
  getLevelProgress: (levelId: string) => LevelProgress | undefined;
  getAchievementProgress: (id: string) => AchievementProgress | undefined;
  resetProgress: () => void;
}

export function useCampaign(gameType: string = 'default'): UseCampaignReturn {
  const [campaign] = useState(() => {
    const config = createDefaultCampaign(gameType);
    return new CampaignManager(config);
  });

  const [levels, setLevels] = useState<Level[]>(campaign.getConfig().levels);
  const [achievements] = useState<Achievement[]>(campaign.getAchievements());
  const [stats, setStats] = useState<PlayerStats>(campaign.getStats());
  const [progress, setProgress] = useState<LevelProgress[]>(campaign.getAllProgress());

  // Sync state
  useEffect(() => {
    const interval = setInterval(() => {
      setLevels(campaign.getConfig().levels);
      setStats(campaign.getStats());
      setProgress(campaign.getAllProgress());
    }, 500);
    return () => clearInterval(interval);
  }, [campaign]);

  return {
    campaign,
    levels,
    achievements,
    stats,
    progress,
    isLevelUnlocked: campaign.isLevelUnlocked.bind(campaign),
    completeLevel: campaign.completeLevel.bind(campaign),
    getLevelProgress: campaign.getLevelProgress.bind(campaign),
    getAchievementProgress: campaign.getAchievementProgress.bind(campaign),
    resetProgress: campaign.resetProgress.bind(campaign),
  };
}

// Context
const CampaignContext = createContext<UseCampaignReturn | null>(null);

export function CampaignProvider({ children, gameType }: { children: React.ReactNode; gameType?: string }) {
  const campaignState = useCampaign(gameType);
  return <CampaignContext.Provider value={campaignState}>{children}</CampaignContext.Provider>;
}

export function useCampaignContext() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaignContext must be used within CampaignProvider');
  return ctx;
}

export default {
  CampaignManager,
  useCampaign,
  CampaignProvider,
  createDefaultCampaign,
};
