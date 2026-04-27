/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MINIDEV i18n - Internationalization System
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Complete i18n system for games and apps:
 * - Translation dictionaries
 * - Language detection & switching
 * - Pluralization
 * - Interpolation
 * - TTS integration
 * 
 * USAGE:
 *   import { i18n, t, setLocale, locale } from '@lib/i18n';
 *   t('hello'); // "Hello, World!"
 *   t('items_count', { count: 5 }); // "You have 5 items"
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';
export type LocaleInfo = { code: Locale; name: string; nativeName: string; flag: string };

export const LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export interface I18nConfig {
  defaultLocale: Locale;
  fallbackLocale: Locale;
  persist?: boolean;
  storageKey?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSLATION DICTIONARIES
// ═══════════════════════════════════════════════════════════════════════════
const translations: Record<Locale, TranslationDict> = {
  en: {
    // General
    app: { name: 'MiniDev', tagline: 'Create Amazing Games' },
    common: { ok: 'OK', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', close: 'Close', loading: 'Loading...', error: 'Error', success: 'Success' },
    
    // Menu
    menu: { home: 'Home', play: 'Play', dashboard: 'Dashboard', projects: 'Projects', settings: 'Settings', profile: 'Profile', logout: 'Logout' },
    
    // Auth
    auth: { login: 'Login', register: 'Register', email: 'Email', password: 'Password', forgotPassword: 'Forgot Password?', noAccount: "Don't have an account?", hasAccount: 'Already have an account?' },
    
    // Game
    game: {
      score: 'Score', lives: 'Lives', level: 'Level', paused: 'Paused', gameOver: 'Game Over', victory: 'Victory!',
      start: 'Start Game', restart: 'Restart', resume: 'Resume', quit: 'Quit',
      score_display: 'Score: {{score}}', lives_display: 'Lives: {{lives}}', level_display: 'Level {{level}}',
      controls: { move: 'Move', jump: 'Jump', action: 'Action', pause: 'Pause' },
    },
    
    // Settings
    settings: {
      title: 'Settings', appearance: 'Appearance', audio: 'Audio', gameplay: 'Gameplay', privacy: 'Privacy',
      theme: { title: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
      sound: { title: 'Sound', effects: 'Sound Effects', music: 'Music', volume: 'Volume' },
    },

    // Platformer game
    platformer: {
      title: 'Platformer', instructions: 'Use arrow keys to move, space to jump. Collect coins and avoid enemies!',
      coins: 'Coins', collect_coin: '+100', fall_death: 'Oops!', enemy_hit: 'Hit!',
    },

    // Snake game
    snake: {
      title: 'Snake', instructions: 'Use arrow keys to control the snake. Eat food to grow!',
      game_over: 'Game Over! Final Score: {{score}}', new_high_score: 'New High Score!',
    },

    // 2048 game
    puzzle_2048: {
      title: '2048', instructions: 'Use arrow keys to slide tiles. Combine matching numbers to reach 2048!',
      score: 'Score', best: 'Best', new_game: 'New Game', you_win: 'You Win!', game_over: 'Game Over!',
    },

    // Breakout
    breakout: {
      title: 'Breakout', instructions: 'Use mouse or arrow keys to control paddle. Break all the bricks!',
      bricks: 'Bricks', combo: 'Combo x{{count}}!',
    },
  },

  es: {
    app: { name: 'MiniDev', tagline: 'Crea Juegos Increíbles' },
    common: { ok: 'Aceptar', cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar', close: 'Cerrar', loading: 'Cargando...', error: 'Error', success: 'Éxito' },
    menu: { home: 'Inicio', play: 'Jugar', dashboard: 'Panel', projects: 'Proyectos', settings: 'Ajustes', profile: 'Perfil', logout: 'Cerrar Sesión' },
    auth: { login: 'Iniciar Sesión', register: 'Registrarse', email: 'Correo', password: 'Contraseña', forgotPassword: '¿Olvidaste tu contraseña?', noAccount: '¿No tienes cuenta?', hasAccount: '¿Ya tienes cuenta?' },
    game: { score: 'Puntos', lives: 'Vidas', level: 'Nivel', paused: 'Pausado', gameOver: 'Fin del Juego', victory: '¡Victoria!', start: 'Jugar', restart: 'Reiniciar', resume: 'Continuar', quit: 'Salir', score_display: 'Puntos: {{score}}', lives_display: 'Vidas: {{lives}}', level_display: 'Nivel {{level}}', controls: { move: 'Mover', jump: 'Saltar', action: 'Acción', pause: 'Pausa' } },
    settings: { title: 'Ajustes', appearance: 'Apariencia', audio: 'Audio', gameplay: 'Juego', privacy: 'Privacidad', theme: { title: 'Tema', light: 'Claro', dark: 'Oscuro', system: 'Sistema' }, sound: { title: 'Sonido', effects: 'Efectos', music: 'Música', volume: 'Volumen' } },
    platformer: { title: 'Plataforma', instructions: 'Usa las flechas para moverte, espacio para saltar. ¡Recoge monedas y evita enemigos!', coins: 'Monedas', collect_coin: '+100', fall_death: '¡Ups!', enemy_hit: '¡Golpe!' },
    snake: { title: 'Serpiente', instructions: 'Usa las flechas para controlar la serpiente. ¡Come comida para crecer!', game_over: '¡Fin del Juego! Puntuación: {{score}}', new_high_score: '¡Nuevo Récord!' },
    puzzle_2048: { title: '2048', instructions: 'Usa las flechas para deslizar fichas. ¡Combina números para llegar a 2048!', score: 'Puntos', best: 'Mejor', new_game: 'Nuevo Juego', you_win: '¡Ganaste!', game_over: '¡Fin del Juego!' },
    breakout: { title: 'Breakout', instructions: 'Usa el ratón o las flechas para mover la paleta. ¡Rompe todos los ladrillos!', bricks: 'Ladrillos', combo: '¡Combo x{{count}}!' },
  },

  fr: {
    app: { name: 'MiniDev', tagline: 'Créez des Jeux Incroyables' },
    common: { ok: 'OK', cancel: 'Annuler', save: 'Enregistrer', delete: 'Supprimer', edit: 'Modifier', close: 'Fermer', loading: 'Chargement...', error: 'Erreur', success: 'Succès' },
    menu: { home: 'Accueil', play: 'Jouer', dashboard: 'Tableau de Bord', projects: 'Projets', settings: 'Paramètres', profile: 'Profil', logout: 'Déconnexion' },
    auth: { login: 'Connexion', register: "S'inscrire", email: 'E-mail', password: 'Mot de passe', forgotPassword: 'Mot de passe oublié?', noAccount: 'Pas de compte?', hasAccount: 'Déjà un compte?' },
    game: { score: 'Score', lives: 'Vies', level: 'Niveau', paused: 'Pause', gameOver: 'Fin de Partie', victory: 'Victoire!', start: 'Jouer', restart: 'Recommencer', resume: 'Reprendre', quit: 'Quitter', score_display: 'Score: {{score}}', lives_display: 'Vies: {{lives}}', level_display: 'Niveau {{level}}', controls: { move: 'Déplacer', jump: 'Sauter', action: 'Action', pause: 'Pause' } },
    settings: { title: 'Paramètres', appearance: 'Apparence', audio: 'Audio', gameplay: 'Jeu', privacy: 'Confidentialité', theme: { title: 'Thème', light: 'Clair', dark: 'Sombre', system: 'Système' }, sound: { title: 'Son', effects: 'Effets', music: 'Musique', volume: 'Volume' } },
    platformer: { title: 'Plateforme', instructions: 'Utilisez les flèches pour vous déplacer, espace pour sauter. Collectez des pièces et évitez les ennemis!', coins: 'Pièces', collect_coin: '+100', fall_death: 'Oups!', enemy_hit: 'Touché!' },
    snake: { title: 'Serpent', instructions: 'Utilisez les flèches pour contrôler le serpent. Mangez pour grandir!', game_over: 'Fin de Partie! Score: {{score}}', new_high_score: 'Nouveau Record!' },
    puzzle_2048: { title: '2048', instructions: 'Utilisez les flèches pour déplacer les tuiles. Combinez les nombres pour atteindre 2048!', score: 'Score', best: 'Meilleur', new_game: 'Nouveau Jeu', you_win: 'Vous Gagnez!', game_over: 'Fin de Partie!' },
    breakout: { title: 'Breakout', instructions: 'Utilisez la souris ou les flèches pour contrôler la raquette. Détruisez toutes les briques!', bricks: 'Briques', combo: 'Combo x{{count}}!' },
  },

  de: {
    app: { name: 'MiniDev', tagline: 'Erstelle Tolle Spiele' },
    common: { ok: 'OK', cancel: 'Abbrechen', save: 'Speichern', delete: 'Löschen', edit: 'Bearbeiten', close: 'Schließen', loading: 'Laden...', error: 'Fehler', success: 'Erfolg' },
    menu: { home: 'Start', play: 'Spielen', dashboard: 'Dashboard', projects: 'Projekte', settings: 'Einstellungen', profile: 'Profil', logout: 'Abmelden' },
    auth: { login: 'Anmelden', register: 'Registrieren', email: 'E-Mail', password: 'Passwort', forgotPassword: 'Passwort vergessen?', noAccount: 'Kein Konto?', hasAccount: 'Hat bereits ein Konto?' },
    game: { score: 'Punkte', lives: 'Leben', level: 'Level', paused: 'Pausiert', gameOver: 'Spiel Vorbei', victory: 'Sieg!', start: 'Spielen', restart: 'Neustart', resume: 'Fortsetzen', quit: 'Beenden', score_display: 'Punkte: {{score}}', lives_display: 'Leben: {{lives}}', level_display: 'Level {{level}}', controls: { move: 'Bewegen', jump: 'Springen', action: 'Aktion', pause: 'Pause' } },
    settings: { title: 'Einstellungen', appearance: 'Aussehen', audio: 'Audio', gameplay: 'Spiel', privacy: 'Datenschutz', theme: { title: 'Thema', light: 'Hell', dark: 'Dunkel', system: 'System' }, sound: { title: 'Ton', effects: 'Effekte', music: 'Musik', volume: 'Lautstärke' } },
    platformer: { title: 'Platformer', instructions: 'Benutze Pfeile zum Bewegen, Leertaste zum Springen. Sammle Münzen und vermeide Feinde!', coins: 'Münzen', collect_coin: '+100', fall_death: 'Hoppla!', enemy_hit: 'Treffer!' },
    snake: { title: 'Schlange', instructions: 'Benutze Pfeile zum Steuern der Schlange. Iss Futter um zu wachsen!', game_over: 'Spiel Vorbei! Punkte: {{score}}', new_high_score: 'Neuer Rekord!' },
    puzzle_2048: { title: '2048', instructions: 'Benutze Pfeile um Kacheln zu verschieben. Kombiniere Zahlen um 2048 zu erreichen!', score: 'Punkte', best: 'Bester', new_game: 'Neues Spiel', you_win: 'Du Gewinnst!', game_over: 'Spiel Vorbei!' },
    breakout: { title: 'Breakout', instructions: 'Benutze Maus oder Pfeile zum Steuern des Schlägers. Zerstöre alle Steine!', bricks: 'Steine', combo: 'Combo x{{count}}!' },
  },

  ja: {
    app: { name: 'MiniDev', tagline: '素晴らしいゲームを作成' },
    common: { ok: 'OK', cancel: 'キャンセル', save: '保存', delete: '削除', edit: '編集', close: '閉じる', loading: '読み込み中...', error: 'エラー', success: '成功' },
    menu: { home: 'ホーム', play: 'プレイ', dashboard: 'ダッシュボード', projects: 'プロジェクト', settings: '設定', profile: 'プロフィール', logout: 'ログアウト' },
    auth: { login: 'ログイン', register: '登録', email: 'メール', password: 'パスワード', forgotPassword: 'パスワードをお忘れですか？', noAccount: 'アカウントをお持ちでない方？', hasAccount: 'すでにアカウントをお持ちですか？' },
    game: { score: 'スコア', lives: 'ライフ', level: 'レベル', paused: '一時停止', gameOver: 'ゲームオーバー', victory: '勝利！', start: 'ゲーム開始', restart: 'リスタート', resume: '再開', quit: '終了', score_display: 'スコア: {{score}}', lives_display: 'ライフ: {{lives}}', level_display: 'レベル {{level}}', controls: { move: '移動', jump: 'ジャンプ', action: 'アクション', pause: '一時停止' } },
    settings: { title: '設定', appearance: '外観', audio: 'オーディオ', gameplay: 'ゲームプレイ', privacy: 'プライバシー', theme: { title: 'テーマ', light: 'ライト', dark: 'ダーク', system: 'システム' }, sound: { title: 'サウンド', effects: '効果音', music: '音楽', volume: '音量' } },
    platformer: { title: 'プラットフォーム', instructions: '矢印キーで移動、スペースでジャンプ。コインを集めて敵を避けよう！', coins: 'コイン', collect_coin: '+100', fall_death: 'あー', enemy_hit: 'ヒット！' },
    snake: { title: 'スネーク', instructions: '矢印キーでヘビを操作。食べ物食べて大きくなろう！', game_over: 'ゲームオーバー！スコア：{{score}}', new_high_score: '新記録！' },
    puzzle_2048: { title: '2048', instructions: '矢印キーでタイルをスライド。同番号を組み合わせて2048を目指そう！', score: 'スコア', best: 'ベスト', new_game: 'ニュゲーム', you_win: 'クリア！', game_over: 'ゲームオーバー！' },
    breakout: { title: 'ブロック崩し', instructions: 'マウスまたは矢印キーでパドルを操作。全てのブロックを破壊しよう！', bricks: 'ブロック', combo: 'コンボ x{{count}}！' },
  },

  zh: {
    app: { name: 'MiniDev', tagline: '创造精彩游戏' },
    common: { ok: '确定', cancel: '取消', save: '保存', delete: '删除', edit: '编辑', close: '关闭', loading: '加载中...', error: '错误', success: '成功' },
    menu: { home: '首页', play: '开始游戏', dashboard: '仪表板', projects: '项目', settings: '设置', profile: '个人资料', logout: '退出' },
    auth: { login: '登录', register: '注册', email: '邮箱', password: '密码', forgotPassword: '忘记密码？', noAccount: '没有账号？', hasAccount: '已有账号？' },
    game: { score: '分数', lives: '生命', level: '关卡', paused: '暂停', gameOver: '游戏结束', victory: '胜利！', start: '开始游戏', restart: '重新开始', resume: '继续', quit: '退出', score_display: '分数: {{score}}', lives_display: '生命: {{lives}}', level_display: '关卡 {{level}}', controls: { move: '移动', jump: '跳跃', action: '动作', pause: '暂停' } },
    settings: { title: '设置', appearance: '外观', audio: '音频', gameplay: '游戏', privacy: '隐私', theme: { title: '主题', light: '浅色', dark: '深色', system: '跟随系统' }, sound: { title: '声音', effects: '音效', music: '音乐', volume: '音量' } },
    platformer: { title: '平台跳跃', instructions: '使用方向键移动，空格键跳跃。收集金币，躲避敌人！', coins: '金币', collect_coin: '+100', fall_death: '哎呀！', enemy_hit: '被击中！' },
    snake: { title: '贪吃蛇', instructions: '使用方向键控制蛇。吃食物变长！', game_over: '游戏结束！得分：{{score}}', new_high_score: '新纪录！' },
    puzzle_2048: { title: '2048', instructions: '使用方向键滑动方块。合并相同数字达到2048！', score: '分数', best: '最高', new_game: '新游戏', you_win: '你赢了！', game_over: '游戏结束！' },
    breakout: { title: '打砖块', instructions: '使用鼠标或方向键控制挡板。摧毁所有砖块！', bricks: '砖块', combo: '连击 x{{count}}！' },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// i18n FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
let currentLocale: Locale = 'en';
let fallbackLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function getAvailableLocales(): LocaleInfo[] {
  return LOCALES;
}

export function initLocale(defaultLocale: Locale = 'en'): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale;
    if (stored && LOCALES.some(l => l.code === stored)) {
      currentLocale = stored;
      return currentLocale;
    }

    const browserLang = navigator.language.split('-')[0] as Locale;
    if (LOCALES.some(l => l.code === browserLang)) {
      currentLocale = browserLang;
      return currentLocale;
    }
  }
  currentLocale = defaultLocale;
  return currentLocale;
}

// Get nested translation key
function getNestedValue(obj: TranslationDict, path: string): string | undefined {
  return path.split('.').reduce((acc: TranslationDict | string | undefined, key) => {
    if (typeof acc === 'object' && acc !== null) {
      return (acc as TranslationDict)[key];
    }
    return undefined;
  }, obj) as string | undefined;
}

// Translation function
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = translations[currentLocale] || translations[fallbackLocale];
  let text = getNestedValue(dict, key);

  // Fallback to default locale
  if (text === undefined) {
    text = getNestedValue(translations[fallbackLocale], key);
  }

  // Return key if not found
  if (text === undefined) {
    console.warn(`[i18n] Missing translation: ${key}`);
    return key;
  }

  // Interpolate params
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text!.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
  }

  return text;
}

// Pluralize function
export function plural(key: string, count: number, pluralKey?: string): string {
  const text = count === 1 ? t(key) : t(pluralKey || `${key}_plural`);
  return t(pluralKey ? key : key, { count: String(count), value: String(count) });
}

// ═══════════════════════════════════════════════════════════════════════════
// TTS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
export const tts = {
  speak(text: string, lang?: Locale): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('TTS not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (lang) {
        const localeInfo = LOCALES.find(l => l.code === lang);
        if (localeInfo) {
          utterance.lang = localeInfo.code;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = reject;
      window.speechSynthesis.speak(utterance);
    });
  },

  cancel(): void {
    window.speechSynthesis.cancel();
  },

  // Speak a translation
  speakKey(key: string, params?: Record<string, string | number>, lang?: Locale): Promise<void> {
    return this.speak(t(key, params), lang);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════
interface UseI18nReturn {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof t;
  tts: typeof tts;
  locales: LocaleInfo[];
  isLocale: (locale: Locale) => boolean;
}

export function useI18n(): UseI18nReturn {
  const [locale, setCurrentLocale] = useState<Locale>(currentLocale);

  useEffect(() => {
    initLocale();
    setCurrentLocale(currentLocale);
  }, []);

  return {
    locale,
    setLocale: (newLocale: Locale) => {
      setLocale(newLocale);
      setCurrentLocale(newLocale);
    },
    t,
    tts,
    locales: LOCALES,
    isLocale: (l: Locale) => locale === l,
  };
}

// Context
const I18nContext = createContext<UseI18nReturn | null>(null);

export function I18nProvider({ children, defaultLocale = 'en' }: { children: React.ReactNode; defaultLocale?: Locale }) {
  const { locale, setLocale, t, tts, locales, isLocale } = useI18n();

  useEffect(() => {
    initLocale(defaultLocale);
  }, [defaultLocale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tts, locales, isLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18nContext() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18nContext must be used within I18nProvider');
  return ctx;
}

// Default export
export default {
  t,
  setLocale,
  getLocale,
  initLocale,
  plural,
  tts,
  useI18n,
  I18nProvider,
  LOCALES,
};
