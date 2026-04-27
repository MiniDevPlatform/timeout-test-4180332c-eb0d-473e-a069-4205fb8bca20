/**
 * MiniDev ONE Template - Quest & Campaign System
 * 
 * Quest chains, objectives, rewards, and progression.
 */

import { logger } from '@/lib/logger';
import { storage } from '@/lib/storage';
import { EventEmitter } from '@/lib/events';

// =============================================================================
// TYPES
// =============================================================================
type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';
type ObjectiveType = 'collect' | 'kill' | 'visit' | 'escort' | 'interact' | 'craft' | 'talk' | 'custom';

interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target?: string;
  count: number;
  current: number;
  location?: { x: number; y: number; radius?: number };
  metadata?: Record<string, any>;
}

interface QuestReward {
  type: 'xp' | 'gold' | 'item' | 'unlock' | 'achievement';
  amount?: number;
  itemId?: string;
  unlockId?: string;
  achievementId?: string;
  message?: string;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  chapter?: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  nextQuest?: string;
  timeLimit?: number;
  repeatable?: boolean;
  repeatableDelay?: number;
}

interface QuestProgress {
  questId: string;
  status: QuestStatus;
  startedAt?: number;
  completedAt?: number;
  objectives: Record<string, { current: number; completed: boolean }>;
}

// =============================================================================
// QUEST MANAGER
// =============================================================================
class QuestManager {
  private quests: Map<string, Quest> = new Map();
  private progress: Map<string, QuestProgress> = new Map();
  private emitter: EventEmitter;
  private saveKey: string = 'quest_progress';

  constructor() {
    this.emitter = new EventEmitter();
    this.load();
  }

  // =============================================================================
  // QUEST REGISTRATION
  // =============================================================================
  registerQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
    logger.debug('quest', `Registered quest: ${quest.name}`);
  }

  registerQuests(quests: Quest[]): void {
    quests.forEach(q => this.registerQuest(q));
  }

  getQuest(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  // =============================================================================
  // QUEST QUERY
  // =============================================================================
  getQuestStatus(questId: string): QuestStatus {
    const progress = this.progress.get(questId);
    return progress?.status || 'locked';
  }

  isQuestAvailable(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    // Check prerequisites
    for (const prereq of quest.prerequisites) {
      const prereqStatus = this.getQuestStatus(prereq);
      if (prereqStatus !== 'completed') return false;
    }

    // Check previous quest
    if (quest.prerequisites.length === 0) {
      const existing = this.progress.get(questId);
      if (existing && existing.status === 'completed') {
        if (quest.repeatable) {
          return this.checkRepeatableDelay(quest);
        }
        return false;
      }
      return !existing || existing.status === 'available';
    }

    return this.getQuestStatus(questId) === 'available';
  }

  private checkRepeatableDelay(quest: Quest): boolean {
    const progress = this.progress.get(questId);
    if (!progress?.completedAt || !quest.repeatableDelay) return true;
    return Date.now() - progress.completedAt >= quest.repeatableDelay;
  }

  getAvailableQuests(): Quest[] {
    return this.getAllQuests().filter(q => this.isQuestAvailable(q.id));
  }

  getActiveQuests(): Quest[] {
    return this.getAllQuests().filter(q => this.getQuestStatus(q.id) === 'active');
  }

  getCompletedQuests(): Quest[] {
    return this.getAllQuests().filter(q => this.getQuestStatus(q.id) === 'completed');
  }

  getQuestByChapter(chapter: string): Quest[] {
    return this.getAllQuests().filter(q => q.chapter === chapter);
  }

  // =============================================================================
  // QUEST ACTIONS
  // =============================================================================
  startQuest(questId: string): boolean {
    if (!this.isQuestAvailable(questId)) return false;

    const quest = this.quests.get(questId);
    if (!quest) return false;

    const progress: QuestProgress = {
      questId,
      status: 'active',
      startedAt: Date.now(),
      objectives: {},
    };

    // Initialize objectives
    for (const obj of quest.objectives) {
      progress.objectives[obj.id] = { current: 0, completed: false };
    }

    this.progress.set(questId, progress);
    this.save();
    this.emitter.emit('quest_start', { quest });
    
    logger.info('quest', `Started quest: ${quest.name}`);
    return true;
  }

  updateObjective(questId: string, objectiveId: string, progress: number): void {
    const quest = this.quests.get(questId);
    const questProgress = this.progress.get(questId);
    
    if (!quest || !questProgress || questProgress.status !== 'active') return;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    const currentProgress = questProgress.objectives[objectiveId];
    if (!currentProgress || currentProgress.completed) return;

    currentProgress.current = progress;
    
    // Check completion
    if (progress >= objective.count) {
      currentProgress.current = objective.count;
      currentProgress.completed = true;
      this.emitter.emit('objective_complete', { questId, objectiveId });
    }

    // Check if all objectives completed
    const allComplete = quest.objectives.every(
      o => questProgress.objectives[o.id]?.completed
    );

    if (allComplete) {
      this.completeQuest(questId);
    } else {
      this.save();
      this.emitter.emit('objective_update', { questId, objectiveId, progress });
    }
  }

  incrementObjective(questId: string, objectiveId: string, amount: number = 1): void {
    const questProgress = this.progress.get(questId);
    if (!questProgress) return;

    const current = questProgress.objectives[objectiveId]?.current || 0;
    this.updateObjective(questId, objectiveId, current + amount);
  }

  failQuest(questId: string): void {
    const quest = this.quests.get(questId);
    const questProgress = this.progress.get(questId);

    if (!quest || !questProgress) return;

    questProgress.status = 'failed';
    this.save();
    this.emitter.emit('quest_fail', { quest });
    
    logger.info('quest', `Failed quest: ${quest.name}`);
  }

  private completeQuest(questId: string): void {
    const quest = this.quests.get(questId);
    const questProgress = this.progress.get(questId);

    if (!quest || !questProgress) return;

    questProgress.status = 'completed';
    questProgress.completedAt = Date.now();
    
    this.save();
    this.emitter.emit('quest_complete', { quest });

    // Grant rewards
    this.grantRewards(quest);

    // Unlock next quest
    if (quest.nextQuest) {
      const nextQuest = this.quests.get(quest.nextQuest);
      if (nextQuest) {
        const nextProgress = this.progress.get(quest.nextQuest);
        if (!nextProgress) {
          this.progress.set(quest.nextQuest, { questId: quest.nextQuest, status: 'available', objectives: {} });
        }
      }
    }

    logger.info('quest', `Completed quest: ${quest.name}`);
  }

  private grantRewards(quest: Quest): void {
    const rewards: Record<string, any> = {};

    for (const reward of quest.rewards) {
      switch (reward.type) {
        case 'xp':
          rewards.xp = (rewards.xp || 0) + (reward.amount || 0);
          break;
        case 'gold':
          rewards.gold = (rewards.gold || 0) + (reward.amount || 0);
          break;
        case 'item':
          rewards.items = [...(rewards.items || []), reward.itemId];
          break;
        case 'unlock':
          rewards.unlocks = [...(rewards.unlocks || []), reward.unlockId];
          break;
        case 'achievement':
          rewards.achievements = [...(rewards.achievements || []), reward.achievementId];
          break;
      }
    }

    this.emitter.emit('quest_rewards', { questId: quest.id, rewards });
  }

  // =============================================================================
  // SAVE/LOAD
  // =============================================================================
  private save(): void {
    const data: Record<string, QuestProgress> = {};
    for (const [id, progress] of this.progress) {
      if (progress.status !== 'locked') {
        data[id] = progress;
      }
    }
    storage.set(this.saveKey, data);
  }

  private load(): void {
    const data = storage.get<Record<string, QuestProgress>>(this.saveKey);
    if (data) {
      for (const [id, progress] of Object.entries(data)) {
        this.progress.set(id, progress);
      }
    }
  }

  reset(): void {
    this.progress.clear();
    this.save();
    this.emitter.emit('quest_reset', {});
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
// PRESET QUESTS
// =============================================================================
export const presetQuests: Quest[] = [
  {
    id: 'tutorial_find_coins',
    name: 'Coin Collector',
    description: 'Collect your first 10 coins to get started.',
    chapter: 'Tutorial',
    objectives: [
      { id: 'collect_coins', type: 'collect', description: 'Collect coins', target: 'coin', count: 10 },
    ],
    rewards: [
      { type: 'gold', amount: 100, message: 'You earned 100 gold!' },
    ],
    prerequisites: [],
  },
  {
    id: 'tutorial_defeat_enemy',
    name: 'First Battle',
    description: 'Defeat your first enemy.',
    chapter: 'Tutorial',
    objectives: [
      { id: 'defeat_enemy', type: 'kill', description: 'Defeat enemies', target: 'enemy', count: 1 },
    ],
    rewards: [
      { type: 'xp', amount: 50, message: 'You gained 50 XP!' },
    ],
    prerequisites: ['tutorial_find_coins'],
    nextQuest: 'tutorial_reach_checkpoint',
  },
  {
    id: 'tutorial_reach_checkpoint',
    name: 'Find the Exit',
    description: 'Reach the checkpoint at the end of the level.',
    objectives: [
      { id: 'reach_checkpoint', type: 'visit', description: 'Reach the checkpoint', location: { x: 700, y: 300, radius: 50 } },
    ],
    rewards: [
      { type: 'unlock', unlockId: 'checkpoint_system', message: 'Checkpoint system unlocked!' },
    ],
    prerequisites: ['tutorial_defeat_enemy'],
  },
];

// =============================================================================
// EXPORTS
// =============================================================================
export { QuestManager };
export default new QuestManager();
