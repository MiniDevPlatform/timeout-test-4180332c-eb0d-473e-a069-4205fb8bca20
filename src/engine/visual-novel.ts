/**
 * MiniDev ONE Template - Visual Novel Engine
 * 
 * Dialogue systems, branching narratives, character sprites, and choice-based storytelling.
 */

import { FEATURES, getColors } from '@/lib/config';
import { storage } from '@/lib/storage';

// =============================================================================
// TYPES
// =============================================================================
interface Character {
  id: string;
  name: string;
  sprite?: string;
  color: string;
  expressions: Record<string, string>;
}

interface Dialogue {
  id: string;
  characterId: string;
  text: string;
  expression?: string;
  emotion?: string;
  duration?: number; // auto-advance time
  audio?: string;
}

interface Choice {
  id: string;
  text: string;
  nextScene: string;
  condition?: string;
  effects?: ChoiceEffect[];
}

interface ChoiceEffect {
  type: 'flag' | 'variable' | 'relationship';
  target: string;
  value: number | string;
}

interface Scene {
  id: string;
  background: string;
  dialogues: Dialogue[];
  choices?: Choice[];
  next?: string; // auto-advance scene
}

interface Branch {
  id: string;
  name: string;
  scenes: Map<string, Scene>;
  variables: Record<string, number | string | boolean>;
  flags: Set<string>;
  relationships: Map<string, number>;
  history: string[]; // scene history for back button
}

interface SaveSlot {
  id: number;
  name: string;
  branchId: string;
  sceneId: string;
  timestamp: number;
  thumbnail?: string;
  variables: Record<string, any>;
}

interface TextboxStyle {
  font: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
  padding: number;
}

// =============================================================================
// VISUAL NOVEL ENGINE
// =============================================================================
class VisualNovelEngine {
  private container: HTMLElement;
  private background: HTMLElement;
  private characterSprites: Map<string, HTMLElement> = new Map();
  private dialogueBox: HTMLElement;
  private nameBox: HTMLElement;
  private choicesContainer: HTMLElement;

  private currentBranch: Branch | null = null;
  private currentScene: Scene | null = null;
  private currentDialogueIndex: number = 0;
  private isTyping: boolean = false;
  private typingSpeed: number = 30; // ms per character
  private autoMode: boolean = false;
  private autoTimer: number = 0;

  private textboxStyle: TextboxStyle = {
    font: 'system-ui',
    fontSize: 18,
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  };

  constructor(selector: string) {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element ${selector} not found`);
    this.container = el as HTMLElement;

    // Create elements
    this.background = document.createElement('div');
    this.background.className = 'vn-background absolute inset-0 bg-cover bg-center';

    this.dialogueBox = document.createElement('div');
    this.dialogueBox.className = 'vn-dialogue-box absolute bottom-0 left-0 right-0 p-6';
    this.dialogueBox.style.cssText = `
      background: ${this.textboxStyle.backgroundColor};
      border-top: 2px solid ${this.textboxStyle.borderColor};
      backdrop-filter: blur(8px);
    `;

    this.nameBox = document.createElement('div');
    this.nameBox.className = 'vn-name-box absolute px-4 py-1 rounded-t-lg';
    this.nameBox.style.cssText = `
      background: ${this.textboxStyle.borderColor};
      color: ${this.textboxStyle.backgroundColor};
      font-weight: bold;
      top: -32px;
      left: 24px;
    `;

    this.choicesContainer = document.createElement('div');
    this.choicesContainer.className = 'vn-choices absolute inset-0 flex flex-col items-center justify-center gap-4 hidden';

    this.render();
  }

  // =============================================================================
  // STORY LOADING
  // =============================================================================
  loadBranch(branch: Branch): void {
    this.currentBranch = branch;
    const firstScene = branch.scenes.values().next().value;
    if (firstScene) {
      this.loadScene(firstScene.id);
    }
  }

  loadScene(sceneId: string): void {
    if (!this.currentBranch) return;

    const scene = this.currentBranch.scenes.get(sceneId);
    if (!scene) {
      console.error(`Scene ${sceneId} not found`);
      return;
    }

    this.currentScene = scene;
    this.currentDialogueIndex = 0;

    // Add to history
    this.currentBranch.history.push(sceneId);

    // Update background
    if (scene.background) {
      this.background.style.backgroundImage = `url(${scene.background})`;
    }

    // Show first dialogue
    this.showDialogue();
  }

  // =============================================================================
  // DIALOGUE SYSTEM
  // =============================================================================
  private showDialogue(): void {
    if (!this.currentScene) return;

    const dialogue = this.currentScene.dialogues[this.currentDialogueIndex];
    if (!dialogue) {
      // End of scene
      this.onSceneEnd();
      return;
    }

    // Get character
    const character = this.currentBranch?.variables[`char_${dialogue.characterId}`] as Character;

    // Show name
    if (character) {
      this.nameBox.textContent = character.name;
      this.nameBox.style.background = character.color;
      this.nameBox.style.color = '#fff';
    } else {
      this.nameBox.textContent = '';
    }

    // Type out text
    this.typeText(dialogue.text, () => {
      // Check for auto-advance
      if (dialogue.duration && dialogue.duration > 0) {
        this.autoTimer = window.setTimeout(() => {
          this.advance();
        }, dialogue.duration);
      }
    });
  }

  private typeText(text: string, onComplete: () => void): void {
    this.isTyping = true;
    this.dialogueBox.innerHTML = `
      <p class="text-white" style="font-size: ${this.textboxStyle.fontSize}px; font-family: ${this.textboxStyle.font};">
        <span class="dialogue-text"></span><span class="cursor">▌</span>
      </p>
      <div class="mt-2 flex justify-between items-center">
        <span class="text-white/50 text-sm">Click or press Space to continue</span>
        <div class="flex gap-2">
          <button class="save-btn px-3 py-1 bg-white/20 text-white rounded text-sm">💾 Save</button>
          <button class="load-btn px-3 py-1 bg-white/20 text-white rounded text-sm">📂 Load</button>
        </div>
      </div>
    `;

    const textEl = this.dialogueBox.querySelector('.dialogue-text')!;
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        textEl.textContent += text[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
        this.isTyping = false;
        this.dialogueBox.querySelector('.cursor')?.remove();
        onComplete();
      }
    }, this.typingSpeed);

    // Click to skip typing
    const skipHandler = () => {
      clearInterval(typeInterval);
      textEl.textContent = text;
      this.isTyping = false;
      this.dialogueBox.querySelector('.cursor')?.remove();
      this.dialogueBox.removeEventListener('click', skipHandler);
      onComplete();
    };
    this.dialogueBox.addEventListener('click', skipHandler);
  }

  advance(): void {
    if (this.isTyping) return;

    clearTimeout(this.autoTimer);

    this.currentDialogueIndex++;

    if (this.currentDialogueIndex < this.currentScene!.dialogues.length) {
      this.showDialogue();
    } else {
      this.onSceneEnd();
    }
  }

  private onSceneEnd(): void {
    if (!this.currentScene) return;

    // Check for choices
    if (this.currentScene.choices && this.currentScene.choices.length > 0) {
      this.showChoices();
    } else if (this.currentScene.next) {
      // Auto-advance to next scene
      this.loadScene(this.currentScene.next);
    } else {
      // End of branch
      this.showEndScreen();
    }
  }

  private showChoices(): void {
    this.dialogueBox.classList.add('hidden');
    this.choicesContainer.classList.remove('hidden');
    this.choicesContainer.innerHTML = `
      <div class="flex flex-col gap-4 w-full max-w-md p-6 bg-black/50 rounded-xl backdrop-blur">
        ${this.currentScene!.choices!.map(choice => {
          // Check condition
          if (choice.condition && !this.evaluateCondition(choice.condition)) {
            return '';
          }
          return `
            <button class="choice-btn px-6 py-4 bg-white/20 text-white rounded-lg text-left hover:bg-white/30 transition-colors text-lg"
                    data-next="${choice.nextScene}">
              ${choice.text}
            </button>
          `;
        }).join('')}
      </div>
    `;

    this.choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextScene = (btn as HTMLElement).dataset.next!;
        this.choicesContainer.classList.add('hidden');
        this.dialogueBox.classList.remove('hidden');
        this.loadScene(nextScene);
      });
    });
  }

  private showEndScreen(): void {
    this.dialogueBox.innerHTML = `
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-4">~ End ~</h2>
        <div class="flex justify-center gap-4">
          <button class="restart-btn px-6 py-3 bg-primary text-white rounded-lg">Restart</button>
          <button class="menu-btn px-6 py-3 bg-white/20 text-white rounded-lg">Main Menu</button>
        </div>
      </div>
    `;

    this.dialogueBox.querySelector('.restart-btn')?.addEventListener('click', () => {
      if (this.currentBranch) {
        this.currentBranch.history = [];
        const firstScene = this.currentBranch.scenes.values().next().value;
        if (firstScene) this.loadScene(firstScene.id);
      }
    });
  }

  // =============================================================================
  // CONDITIONAL LOGIC
  // =============================================================================
  private evaluateCondition(condition: string): boolean {
    if (!this.currentBranch) return false;

    // Simple condition parser: "flag:unlocked" or "var:score > 50"
    const [type, rest] = condition.split(':');

    if (type === 'flag') {
      return this.currentBranch.flags.has(rest);
    }

    if (type === 'var') {
      const [name, op, value] = rest.split(/([><=]+)/);
      const varValue = this.currentBranch.variables[name];
      
      if (op === '>') return Number(varValue) > Number(value);
      if (op === '<') return Number(varValue) < Number(value);
      if (op === '=') return varValue == value;
    }

    return false;
  }

  // =============================================================================
  // SAVE/LOAD
  // =============================================================================
  save(slot: number): SaveSlot | null {
    if (!this.currentBranch || !this.currentScene) return null;

    const saveData: SaveSlot = {
      id: slot,
      name: `Slot ${slot}`,
      branchId: this.currentBranch.id,
      sceneId: this.currentScene.id,
      timestamp: Date.now(),
      variables: { ...this.currentBranch.variables },
    };

    // Take screenshot
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (ctx && this.background.style.backgroundImage) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 320, 180);
    }
    saveData.thumbnail = canvas.toDataURL();

    const saves = this.getSaves();
    saves[slot] = saveData;
    storage.set('vn_saves', saves);

    return saveData;
  }

  load(slot: number): boolean {
    const saves = this.getSaves();
    const saveData = saves[slot];
    if (!saveData) return false;

    // For simplicity, we'll need to have the branch loaded
    if (!this.currentBranch) return false;

    // Restore variables
    this.currentBranch.variables = { ...saveData.variables };

    // Load scene
    this.loadScene(saveData.sceneId);

    return true;
  }

  private getSaves(): Record<number, SaveSlot> {
    return storage.get('vn_saves') || {};
  }

  // =============================================================================
  // CHARACTERS
  // =============================================================================
  showCharacter(characterId: string, expression: string = 'neutral', position: 'left' | 'center' | 'right' = 'center'): void {
    const character = this.currentBranch?.variables[`char_${characterId}`] as Character;
    if (!character) return;

    let spriteEl = this.characterSprites.get(characterId);

    if (!spriteEl) {
      spriteEl = document.createElement('div');
      spriteEl.className = 'vn-character absolute bottom-20 transition-all duration-500';
      this.container.appendChild(spriteEl);
      this.characterSprites.set(characterId, spriteEl);
    }

    // Position
    const positions = {
      left: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      right: 'right-0',
    };
    spriteEl.className = `vn-character absolute bottom-20 transition-all duration-500 ${positions[position]}`;

    // Set sprite
    const spriteUrl = character.expressions?.[expression] || character.sprite;
    if (spriteUrl) {
      spriteEl.style.backgroundImage = `url(${spriteUrl})`;
      spriteEl.style.backgroundSize = 'contain';
      spriteEl.style.backgroundRepeat = 'no-repeat';
      spriteEl.style.width = '300px';
      spriteEl.style.height = '400px';
    }

    spriteEl.style.opacity = '1';
  }

  hideCharacter(characterId: string): void {
    const spriteEl = this.characterSprites.get(characterId);
    if (spriteEl) {
      spriteEl.style.opacity = '0';
      setTimeout(() => {
        spriteEl.remove();
        this.characterSprites.delete(characterId);
      }, 500);
    }
  }

  // =============================================================================
  // RENDERING
  // =============================================================================
  private render(): void {
    const c = getColors();

    this.container.className = 'vn-container relative w-full h-full overflow-hidden';
    this.container.style.background = c.background as string;

    this.container.appendChild(this.background);
    this.container.appendChild(this.characterSprites.get('default') || document.createElement('div'));
    this.container.appendChild(this.choicesContainer);

    this.dialogueBox.appendChild(this.nameBox);
    this.container.appendChild(this.dialogueBox);

    // Demo intro
    this.dialogueBox.innerHTML = `
      <div class="text-center text-white p-8">
        <h1 class="text-3xl font-bold mb-4">Visual Novel Engine</h1>
        <p class="text-white/70 mb-6">A branching narrative system with dialogue, choices, and save/load.</p>
        <button class="start-btn px-8 py-3 bg-primary text-white rounded-lg text-lg">Start Demo</button>
      </div>
    `;

    this.dialogueBox.querySelector('.start-btn')?.addEventListener('click', () => {
      this.startDemo();
    });
  }

  private startDemo(): void {
    // Create demo branch
    const branch: Branch = {
      id: 'demo',
      name: 'Demo Story',
      scenes: new Map(),
      variables: {},
      flags: new Set(),
      relationships: new Map(),
      history: [],
    };

    // Create demo characters
    branch.variables['char_hero'] = {
      id: 'hero',
      name: 'Hero',
      color: '#6366f1',
      expressions: {},
    } as Character;

    branch.variables['char_guide'] = {
      id: 'guide',
      name: 'Guide',
      color: '#22c55e',
      expressions: {},
    } as Character;

    // Create scenes
    const scene1: Scene = {
      id: 'start',
      background: 'https://picsum.photos/1280/720?random=100',
      dialogues: [
        { id: 'd1', characterId: 'guide', text: 'Welcome, traveler. This is the beginning of your journey.' },
        { id: 'd2', characterId: 'guide', text: 'You stand at a crossroads. Which path will you take?' },
      ],
      choices: [
        { id: 'c1', text: '🌲 Take the forest path', nextScene: 'forest' },
        { id: 'c2', text: '🏔️ Take the mountain path', nextScene: 'mountain' },
      ],
    };

    const scene2: Scene = {
      id: 'forest',
      background: 'https://picsum.photos/1280/720?random=101',
      dialogues: [
        { id: 'd3', characterId: 'hero', text: 'The forest is peaceful. I hear birds singing.' },
        { id: 'd4', characterId: 'hero', text: 'I wonder what secrets this path holds...' },
      ],
      next: 'forest_end',
    };

    const scene3: Scene = {
      id: 'mountain',
      background: 'https://picsum.photos/1280/720?random=102',
      dialogues: [
        { id: 'd5', characterId: 'hero', text: 'The mountain looms before me. It will be a challenging climb.' },
        { id: 'd6', characterId: 'hero', text: 'But the view from the top must be spectacular.' },
      ],
      next: 'mountain_end',
    };

    const scene4: Scene = {
      id: 'forest_end',
      background: 'https://picsum.photos/1280/720?random=103',
      dialogues: [
        { id: 'd7', characterId: 'guide', text: 'You have chosen wisely. The forest path leads to peace.' },
      ],
    };

    const scene5: Scene = {
      id: 'mountain_end',
      background: 'https://picsum.photos/1280/720?random=104',
      dialogues: [
        { id: 'd8', characterId: 'guide', text: 'Brave choice. The mountain path leads to strength.' },
      ],
    };

    branch.scenes.set('start', scene1);
    branch.scenes.set('forest', scene2);
    branch.scenes.set('mountain', scene3);
    branch.scenes.set('forest_end', scene4);
    branch.scenes.set('mountain_end', scene5);

    this.loadBranch(branch);
  }
}

// =============================================================================
// BUILDER API
// =============================================================================
class VisualNovelBuilder {
  private branch: Branch;
  private currentSceneId: string = '';

  constructor(branchId: string, name: string) {
    this.branch = {
      id: branchId,
      name,
      scenes: new Map(),
      variables: {},
      flags: new Set(),
      relationships: new Map(),
      history: [],
    };
  }

  addCharacter(id: string, name: string, color: string, sprite?: string): this {
    this.branch.variables[`char_${id}`] = { id, name, color, sprite } as Character;
    return this;
  }

  addScene(sceneId: string, background?: string): this {
    this.currentSceneId = sceneId;
    this.branch.scenes.set(sceneId, {
      id: sceneId,
      background: background || '',
      dialogues: [],
    });
    return this;
  }

  addDialogue(characterId: string, text: string): this {
    const scene = this.branch.scenes.get(this.currentSceneId);
    if (scene) {
      scene.dialogues.push({
        id: `d_${Date.now()}`,
        characterId,
        text,
      });
    }
    return this;
  }

  addChoice(text: string, nextScene: string): this {
    const scene = this.branch.scenes.get(this.currentSceneId);
    if (scene) {
      if (!scene.choices) scene.choices = [];
      scene.choices.push({
        id: `c_${Date.now()}`,
        text,
        nextScene,
      });
    }
    return this;
  }

  setNextScene(sceneId: string): this {
    const scene = this.branch.scenes.get(this.currentSceneId);
    if (scene) {
      scene.next = sceneId;
    }
    return this;
  }

  build(): Branch {
    return this.branch;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================
export { VisualNovelEngine, VisualNovelBuilder, Branch, Scene, Dialogue, Choice, Character, SaveSlot };
export default VisualNovelEngine;