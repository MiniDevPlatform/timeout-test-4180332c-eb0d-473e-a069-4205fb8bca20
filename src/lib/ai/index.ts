/**
 * MiniDev ONE Template - Game AI System
 * 
 * AI behaviors: Pathfinding, Decision Trees, Behavior Trees, State Machines.
 */

import { FEATURES } from '@/lib/config';

// =============================================================================
// TYPES
// =============================================================================
interface Vec2 {
  x: number;
  y: number;
}

interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to end)
  f: number; // Total cost
  parent?: PathNode;
}

interface BehaviorNode {
  type: 'action' | 'condition' | 'sequence' | 'selector' | 'parallel';
  children?: BehaviorNode[];
  execute(context: AIContext): AIResult;
}

interface AIContext {
  self: AIEntity;
  target?: AIEntity;
  entities: AIEntity[];
  dt: number;
  state: Record<string, any>;
}

interface AIEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  state: Record<string, any>;
  type: string;
  health?: number;
}

interface AIResult {
  success: boolean;
  action?: AIAction;
}

interface AIAction {
  type: 'move' | 'attack' | 'flee' | 'patrol' | 'wait' | 'custom';
  x?: number;
  y?: number;
  target?: string;
  duration?: number;
  data?: Record<string, any>;
}

// =============================================================================
// PATHFINDING - A* Algorithm
// =============================================================================
class Pathfinding {
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private grid: boolean[][] = [];
  private diagonalEnabled: boolean = true;

  init(width: number, height: number, obstacles: Vec2[] = []): void {
    this.gridWidth = width;
    this.gridHeight = height;
    this.grid = Array(height).fill(null).map(() => Array(width).fill(true));

    // Mark obstacles
    for (const obs of obstacles) {
      if (obs.x >= 0 && obs.x < width && obs.y >= 0 && obs.y < height) {
        this.grid[obs.y][obs.x] = false;
      }
    }
  }

  setWalkable(x: number, y: number, walkable: boolean): void {
    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      this.grid[y][x] = walkable;
    }
  }

  findPath(start: Vec2, end: Vec2): Vec2[] {
    const startNode: PathNode = {
      x: Math.floor(start.x),
      y: Math.floor(start.y),
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
    };
    startNode.f = startNode.g + startNode.h;

    const openList: PathNode[] = [startNode];
    const closedSet = new Set<string>();
    const directions = this.diagonalEnabled
      ? [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]]
      : [[0, -1], [1, 0], [0, 1], [-1, 0]];

    while (openList.length > 0) {
      // Get node with lowest f
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;
      const currentKey = `${current.x},${current.y}`;

      // Found end
      if (current.x === Math.floor(end.x) && current.y === Math.floor(end.y)) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      // Check neighbors
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const key = `${nx},${ny}`;

        if (closedSet.has(key)) continue;
        if (nx < 0 || nx >= this.gridWidth || ny < 0 || ny >= this.gridHeight) continue;
        if (!this.grid[ny][nx]) continue;

        // Diagonal movement check (can't cut corners)
        if (dx !== 0 && dy !== 0) {
          if (!this.grid[current.y][current.x + dx] || !this.grid[current.y + dy][current.x]) {
            continue;
          }
        }

        const g = current.g + (dx !== 0 && dy !== 0 ? 1.414 : 1);
        const h = this.heuristic({ x: nx, y: ny }, end);
        const f = g + h;

        const existing = openList.find(n => n.x === nx && n.y === ny);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        } else {
          openList.push({ x: nx, y: ny, g, h, f, parent: current });
        }
      }
    }

    return []; // No path found
  }

  private heuristic(a: Vec2, b: Vec2): number {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private reconstructPath(endNode: PathNode): Vec2[] {
    const path: Vec2[] = [];
    let current: PathNode | undefined = endNode;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return path;
  }

  // Simplified path following (no grid needed)
  moveToward(entity: AIEntity, targetX: number, targetY: number, speed: number): AIAction {
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      return { type: 'wait', duration: 0 };
    }

    return {
      type: 'move',
      x: entity.x + (dx / dist) * speed,
      y: entity.y + (dy / dist) * speed,
    };
  }
}

// =============================================================================
// BEHAVIOR TREE
// =============================================================================
class BehaviorTree {
  private root: BehaviorNode;
  private context: AIContext;

  constructor(root: BehaviorNode) {
    this.root = root;
    this.context = {} as AIContext;
  }

  tick(context: AIContext): AIResult {
    this.context = context;
    return this.execute(this.root);
  }

  private execute(node: BehaviorNode): AIResult {
    switch (node.type) {
      case 'action':
        return node.execute(this.context);
        
      case 'condition':
        return node.execute(this.context);
        
      case 'sequence':
        // Execute children in order, return failure if any fails
        for (const child of node.children || []) {
          const result = this.execute(child);
          if (!result.success) return result;
        }
        return { success: true };
        
      case 'selector':
        // Execute children in order, return success if any succeeds
        for (const child of node.children || []) {
          const result = this.execute(child);
          if (result.success) return result;
        }
        return { success: false };
        
      case 'parallel':
        // Execute all children
        const results = node.children?.map(c => this.execute(c)) || [];
        return { success: results.every(r => r.success) };
    }
  }
}

// Factory for behavior tree creation
class BehaviorFactory {
  // Action nodes
  static moveTo(x: number, y: number): BehaviorNode {
    return {
      type: 'action',
      execute: (ctx) => ({
        success: true,
        action: { type: 'move', x, y },
      }),
    };
  }

  static attackTarget(): BehaviorNode {
    return {
      type: 'action',
      execute: (ctx) => ({
        success: !!ctx.target,
        action: ctx.target ? { type: 'attack', target: ctx.target.id } : undefined,
      }),
    };
  }

  static patrol(waypoints: Vec2[]): BehaviorNode {
    let currentIndex = 0;
    return {
      type: 'action',
      execute: (ctx) => {
        const target = waypoints[currentIndex];
        currentIndex = (currentIndex + 1) % waypoints.length;
        return {
          success: true,
          action: { type: 'patrol', x: target.x, y: target.y },
        };
      },
    };
  }

  // Condition nodes
  static healthBelow(threshold: number): BehaviorNode {
    return {
      type: 'condition',
      execute: (ctx) => ({
        success: (ctx.self.health || 100) < threshold,
      }),
    };
  }

  static hasTarget(): BehaviorNode {
    return {
      type: 'condition',
      execute: (ctx) => ({
        success: !!ctx.target,
      }),
    };
  }

  static distanceToTargetLessThan(distance: number): BehaviorNode {
    return {
      type: 'condition',
      execute: (ctx) => {
        if (!ctx.target) return { success: false };
        const dx = ctx.target.x - ctx.self.x;
        const dy = ctx.target.y - ctx.self.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return { success: dist < distance };
      },
    };
  }

  // Composite nodes
  static sequence(children: BehaviorNode[]): BehaviorNode {
    return {
      type: 'sequence',
      children,
    };
  }

  static selector(children: BehaviorNode[]): BehaviorNode {
    return {
      type: 'selector',
      children,
    };
  }

  static parallel(children: BehaviorNode[]): BehaviorNode {
    return {
      type: 'parallel',
      children,
    };
  }

  // Pre-built behaviors
  static aggressive(): BehaviorNode {
    return this.sequence([
      this.hasTarget(),
      this.moveTo(0, 0), // Will be overridden
    ]);
  }

  static defensive(): BehaviorNode {
    return this.sequence([
      this.healthBelow(30),
      BehaviorFactory.moveTo(0, 0), // Flee
    ]);
  }

  static patrolBehavior(waypoints: Vec2[]): BehaviorNode {
    return this.sequence([
      BehaviorFactory.patrol(waypoints),
    ]);
  }

  static chaseAndAttack(): BehaviorNode {
    return this.selector([
      this.sequence([
        this.hasTarget(),
        this.distanceToTargetLessThan(50),
        this.attackTarget(),
      ]),
      this.sequence([
        this.hasTarget(),
        BehaviorFactory.moveTo(0, 0),
      ]),
      BehaviorFactory.patrol([]),
    ]);
  }
}

// =============================================================================
// DECISION TREE
// =============================================================================
type DecisionResult = {
  action: AIAction;
  reason: string;
};

type DecisionNode = {
  condition: (ctx: AIContext) => boolean;
  result: DecisionResult;
  falseBranch?: DecisionNode;
};

class DecisionTree {
  private root: DecisionNode;

  constructor(root: DecisionNode) {
    this.root = root;
  }

  decide(context: AIContext): DecisionResult {
    let current: DecisionNode | undefined = this.root;

    while (current) {
      if (current.condition(context)) {
        if (current.falseBranch) {
          current = current.falseBranch;
        } else {
          return current.result;
        }
      } else {
        return current.result;
      }
    }

    return { action: { type: 'wait' }, reason: 'No decision' };
  }
}

// =============================================================================
// STATE MACHINE
// =============================================================================
type State = {
  name: string;
  onEnter?: (context: any) => void;
  onUpdate?: (context: any, dt: number) => void;
  onExit?: (context: any) => void;
  transitions?: StateTransition[];
};

type StateTransition = {
  to: string;
  condition: (context: any) => boolean;
};

class StateMachine {
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;
  private context: any;

  constructor(states: State[], initialState: string, context: any) {
    for (const state of states) {
      this.states.set(state.name, state);
    }
    this.context = context;
    this.setState(initialState);
  }

  setState(name: string): void {
    if (this.currentState?.name === name) return;

    const newState = this.states.get(name);
    if (!newState) return;

    if (this.currentState) {
      this.currentState.onExit?.(this.context);
    }

    this.currentState = newState;
    this.currentState.onEnter?.(this.context);
  }

  update(dt: number): void {
    if (!this.currentState) return;

    // Check transitions
    for (const transition of this.currentState.transitions || []) {
      if (transition.condition(this.context)) {
        this.setState(transition.to);
        break;
      }
    }

    // Update current state
    this.currentState.onUpdate?.(this.context, dt);
  }

  getCurrentState(): string {
    return this.currentState?.name || '';
  }
}

// =============================================================================
// AI CONTROLLER
// =============================================================================
class AIController {
  private entities: Map<string, AIEntity> = new Map();
  private pathfinding: Pathfinding;
  private behaviorTrees: Map<string, BehaviorTree> = new Map();
  private decisionTrees: Map<string, DecisionTree> = new Map();
  private stateMachines: Map<string, StateMachine> = new Map();

  constructor(gridWidth: number = 100, gridHeight: number = 100) {
    this.pathfinding = new Pathfinding();
    this.pathfinding.init(gridWidth, gridHeight);
  }

  addEntity(entity: AIEntity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(id: string): void {
    this.entities.delete(id);
  }

  getEntity(id: string): AIEntity | undefined {
    return this.entities.get(id);
  }

  setBehavior(entityId: string, tree: BehaviorTree): void {
    this.behaviorTrees.set(entityId, tree);
  }

  setDecisionTree(entityId: string, tree: DecisionTree): void {
    this.decisionTrees.set(entityId, tree);
  }

  setStateMachine(entityId: string, machine: StateMachine): void {
    this.stateMachines.set(entityId, machine);
  }

  update(dt: number): void {
    // Update all state machines
    for (const [id, machine] of this.stateMachines) {
      machine.update(dt);
    }

    // Update behavior trees and decision trees
    for (const [id, entity] of this.entities) {
      const context: AIContext = {
        self: entity,
        target: this.findNearestPlayer(entity),
        entities: Array.from(this.entities.values()),
        dt,
        state: entity.state,
      };

      // Try behavior tree first
      const bt = this.behaviorTrees.get(id);
      if (bt) {
        const result = bt.tick(context);
        if (result.action) {
          this.executeAction(entity, result.action);
        }
        continue;
      }

      // Then decision tree
      const dtTree = this.decisionTrees.get(id);
      if (dtTree) {
        const result = dtTree.decide(context);
        this.executeAction(entity, result.action);
      }
    }
  }

  private findNearestPlayer(entity: AIEntity): AIEntity | undefined {
    let nearest: AIEntity | undefined;
    let nearestDist = Infinity;

    for (const [id, other] of this.entities) {
      if (other.type === 'player') {
        const dx = other.x - entity.x;
        const dy = other.y - entity.y;
        const dist = dx * dx + dy * dy;
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = other;
        }
      }
    }

    return nearest;
  }

  private executeAction(entity: AIEntity, action: AIAction): void {
    switch (action.type) {
      case 'move':
        if (action.x !== undefined && action.y !== undefined) {
          entity.x = action.x;
          entity.y = action.y;
        }
        break;
      case 'attack':
        // Implement attack logic
        break;
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export { 
  Pathfinding, 
  BehaviorTree, 
  BehaviorFactory, 
  DecisionTree, 
  StateMachine,
  AIController,
};

export type { 
  AIContext, 
  AIEntity, 
  AIAction,
  AIResult,
  State,
  StateTransition,
  Vec2,
};

export default {
  Pathfinding,
  BehaviorTree,
  BehaviorFactory,
  DecisionTree,
  StateMachine,
  AIController,
};
