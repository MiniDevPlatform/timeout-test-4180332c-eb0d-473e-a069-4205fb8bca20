/**
 * MiniDev ONE Template - Base Classes
 * 
 * Base classes with common functionality for extensibility.
 */

import { logger } from '@/lib/logger';
import { EventEmitter } from '@/lib/events';

// =============================================================================
// BASE OBJECT
// =============================================================================
export abstract class BaseObject {
  public readonly id: string;
  public active: boolean = true;
  public tags: Set<string> = new Set();
  
  private destroyed: boolean = false;
  protected onDestroy?: () => void;

  constructor(id?: string) {
    this.id = id || this.generateId();
  }

  protected generateId(): string {
    return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  setActive(active: boolean): this {
    this.active = active;
    return this;
  }

  addTag(tag: string): this {
    this.tags.add(tag);
    return this;
  }

  removeTag(tag: string): this {
    this.tags.delete(tag);
    return this;
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.active = false;
    this.onDestroy?.();
    logger.debug('base', `Destroyed ${this.constructor.name}:${this.id}`);
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }
}

// =============================================================================
// BASE COMPONENT (Component Pattern)
// =============================================================================
export abstract class BaseComponent<T extends BaseObject> {
  public readonly name: string;
  public enabled: boolean = true;
  protected entity?: T;

  constructor(name: string) {
    this.name = name;
  }

  attach(entity: T): void {
    this.entity = entity;
    this.onAttach();
  }

  detach(): void {
    this.onDetach();
    this.entity = undefined;
  }

  // Override these in subclasses
  protected onAttach(): void {}
  protected onDetach(): void {}
  abstract update(dt: number): void;
}

// =============================================================================
// BASE ENTITY (Entity Pattern)
// =============================================================================
export class Entity extends BaseObject {
  private components: Map<string, any> = new Map();

  addComponent<T extends BaseComponent<Entity>>(component: T): T {
    component.attach(this);
    this.components.set(component.name, component);
    return component;
  }

  getComponent<T extends BaseComponent<Entity>>(name: string): T | undefined {
    return this.components.get(name) as T;
  }

  hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  removeComponent(name: string): void {
    const component = this.components.get(name);
    if (component) {
      component.detach();
      this.components.delete(name);
    }
  }

  update(dt: number): void {
    if (!this.active) return;
    for (const component of this.components.values()) {
      if (component.enabled) {
        component.update(dt);
      }
    }
  }

  destroy(): void {
    for (const component of this.components.values()) {
      component.detach();
    }
    this.components.clear();
    super.destroy();
  }
}

// =============================================================================
// BASE MANAGER (Manager Pattern)
// =============================================================================
export abstract class BaseManager<T extends BaseObject> {
  protected items: Map<string, T> = new Map();
  protected emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  add(item: T): T {
    this.items.set(item.id, item);
    this.onAdd(item);
    logger.debug(this.constructor.name.toLowerCase(), `Added ${item.id}`);
    return item;
  }

  remove(id: string): T | undefined {
    const item = this.items.get(id);
    if (item) {
      item.destroy();
      this.items.delete(id);
      this.onRemove(item);
      logger.debug(this.constructor.name.toLowerCase(), `Removed ${id}`);
    }
    return item;
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }

  getByTag(tag: string): T[] {
    return this.getAll().filter(item => item.hasTag(tag));
  }

  clear(): void {
    for (const item of this.items.values()) {
      item.destroy();
    }
    this.items.clear();
  }

  get count(): number {
    return this.items.size;
  }

  // Override these
  protected onAdd(item: T): void {}
  protected onRemove(item: T): void {}

  // Event integration
  on(event: string, handler: any): () => void {
    return this.emitter.on(event, handler);
  }

  emit(event: string, data?: any): void {
    this.emitter.emit(event, data);
  }
}

// =============================================================================
// BASE STATE (State Pattern)
// =============================================================================
export abstract class BaseState {
  public readonly name: string;
  protected context: any;

  constructor(name: string, context: any) {
    this.name = name;
    this.context = context;
  }

  abstract onEnter(): void;
  abstract onUpdate(dt: number): void;
  abstract onExit(): void;

  // Optional transitions
  getTransitions(): Map<string, () => boolean> {
    return new Map();
  }
}

// =============================================================================
// STATE MACHINE (using BaseState)
// =============================================================================
export class StateMachine {
  private states: Map<string, BaseState> = new Map();
  private currentState: BaseState | null = null;
  private context: any;

  constructor(context: any) {
    this.context = context;
  }

  addState(state: BaseState): this {
    this.states.set(state.name, state);
    return this;
  }

  setState(name: string): void {
    const newState = this.states.get(name);
    if (!newState || newState === this.currentState) return;

    if (this.currentState) {
      this.currentState.onExit();
    }

    this.currentState = newState;
    this.currentState.onEnter();
    
    logger.debug('statemachine', `Transitioned to ${name}`);
  }

  update(dt: number): void {
    if (!this.currentState) return;

    this.currentState.onUpdate(dt);

    // Check transitions
    for (const [stateName, condition] of this.currentState.getTransitions()) {
      if (condition()) {
        this.setState(stateName);
        break;
      }
    }
  }

  getState(): string {
    return this.currentState?.name || '';
  }

  isState(name: string): boolean {
    return this.currentState?.name === name;
  }
}

// =============================================================================
// BASE ADAPTER (Adapter Pattern)
// =============================================================================
export interface AdapterConfig {
  enabled: boolean;
  debug?: boolean;
  [key: string]: any;
}

export abstract class BaseAdapter<C extends AdapterConfig> {
  protected config: C;
  protected active: boolean = false;

  constructor(config: C) {
    this.config = config;
  }

  abstract init(): Promise<boolean>;
  abstract destroy(): void;

  isActive(): boolean {
    return this.active;
  }

  updateConfig(updates: Partial<C>): void {
    this.config = { ...this.config, ...updates };
    this.onConfigUpdate(updates);
  }

  protected onConfigUpdate(updates: Partial<C>): void {}
}

// =============================================================================
// BASE STORAGE ADAPTER
// =============================================================================
export abstract class BaseStorageAdapter extends BaseAdapter<AdapterConfig> {
  abstract get<T>(key: string, defaultValue?: T): T | undefined;
  abstract set<T>(key: string, value: T): void;
  abstract remove(key: string): void;
  abstract clear(): void;
  abstract keys(): string[];
  abstract export(): Record<string, any>;
  abstract import(data: Record<string, any>): boolean;
}

// =============================================================================
// FACTORY PATTERN
// =============================================================================
interface FactoryProduct {
  id: string;
  [key: string]: any;
}

type FactoryFunction<T extends FactoryProduct> = (config: any) => T;

class Factory<T extends FactoryProduct> {
  private creators: Map<string, FactoryFunction<T>> = new Map();

  register(type: string, creator: FactoryFunction<T>): void {
    this.creators.set(type, creator);
  }

  create(type: string, config: any): T | null {
    const creator = this.creators.get(type);
    if (!creator) {
      logger.warn('factory', `Unknown type: ${type}`);
      return null;
    }
    return creator(config);
  }

  has(type: string): boolean {
    return this.creators.has(type);
  }

  getTypes(): string[] {
    return Array.from(this.creators.keys());
  }
}

// =============================================================================
// POOL PATTERN
// =============================================================================
interface Poolable {
  reset(): void;
  active: boolean;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private factory: () => T;
  private maxSize: number;
  private growOnDemand: boolean;

  constructor(factory: () => T, initialSize: number = 10, maxSize: number = 100) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.growOnDemand = initialSize < maxSize;

    // Pre-populate
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T | null {
    // Find inactive object
    for (const obj of this.pool) {
      if (!obj.active) {
        obj.active = true;
        return obj;
      }
    }

    // Create new if allowed
    if (this.pool.length < this.maxSize) {
      const obj = this.factory();
      obj.active = true;
      this.pool.push(obj);
      return obj;
    }

    return null;
  }

  release(obj: T): void {
    obj.reset();
    obj.active = false;
  }

  releaseAll(): void {
    for (const obj of this.pool) {
      this.release(obj);
    }
  }

  get size(): number {
    return this.pool.length;
  }

  get activeCount(): number {
    return this.pool.filter(o => o.active).length;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export { 
  Entity, 
  BaseObject, 
  BaseComponent, 
  BaseManager, 
  BaseState, 
  StateMachine,
  BaseAdapter,
  BaseStorageAdapter,
  Factory,
  ObjectPool,
};

export default {
  Entity,
  BaseObject,
  BaseComponent,
  BaseManager,
  BaseState,
  StateMachine,
  BaseAdapter,
  Factory,
  ObjectPool,
};
