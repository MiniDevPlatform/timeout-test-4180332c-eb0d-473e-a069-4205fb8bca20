/**
 * MiniDev ONE Template - Logger
 * 
 * Structured logging with levels, categories, and output targets.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  NONE = 5,
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

interface LoggerOptions {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxEntries: number;
  categories: Record<string, LogLevel>;
}

const DEFAULT_OPTIONS: LoggerOptions = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableStorage: false,
  maxEntries: 1000,
  categories: {},
};

// =============================================================================
// LOGGER
// =============================================================================
class Logger {
  private options: LoggerOptions;
  private entries: LogEntry[] = [];
  private listeners: Set<(entry: LogEntry) => void> = new Set();

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private shouldLog(level: LogLevel, category: string): boolean {
    const categoryLevel = this.options.categories[category];
    const effectiveLevel = categoryLevel ?? this.options.minLevel;
    return level >= effectiveLevel;
  }

  private log(level: LogLevel, category: string, message: string, data?: any): void {
    if (!this.shouldLog(level, category)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stack: level >= LogLevel.ERROR ? new Error().stack : undefined,
    };

    this.entries.push(entry);

    // Trim old entries
    if (this.entries.length > this.options.maxEntries) {
      this.entries = this.entries.slice(-this.options.maxEntries);
    }

    // Console output
    if (this.options.enableConsole) {
      this.consoleOutput(entry);
    }

    // Notify listeners
    this.listeners.forEach(cb => cb(entry));
  }

  private consoleOutput(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString().split('T')[1].slice(0, -1);
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}] [${entry.category}]`;
    
    const args = [prefix, entry.message];
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...args, entry.data ?? '');
        break;
      case LogLevel.INFO:
        console.info(...args, entry.data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(...args, entry.data ?? '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(...args, entry.data ?? '', entry.stack ?? '');
        break;
    }
  }

  // Public API
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  fatal(category: string, message: string, data?: any): void {
    this.log(LogLevel.FATAL, category, message, data);
  }

  // Convenience methods with auto-category detection
  logDebug(message: string, data?: any): void {
    const category = this.inferCategory();
    this.log(LogLevel.DEBUG, category, message, data);
  }

  logInfo(message: string, data?: any): void {
    const category = this.inferCategory();
    this.log(LogLevel.INFO, category, message, data);
  }

  logWarn(message: string, data?: any): void {
    const category = this.inferCategory();
    this.log(LogLevel.WARN, category, message, data);
  }

  logError(message: string, data?: any): void {
    const category = this.inferCategory();
    this.log(LogLevel.ERROR, category, message, data);
  }

  private inferCategory(): string {
    // Try to infer category from call stack
    const stack = new Error().stack || '';
    const match = stack.match(/at (\w+)/g);
    if (match && match.length > 2) {
      return match[2].replace('at ', '') || 'app';
    }
    return 'app';
  }

  // Configuration
  setLevel(level: LogLevel): void {
    this.options.minLevel = level;
  }

  setCategoryLevel(category: string, level: LogLevel): void {
    this.options.categories[category] = level;
  }

  // Queries
  getEntries(filter?: {
    level?: LogLevel;
    category?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let result = this.entries;

    if (filter?.level !== undefined) {
      result = result.filter(e => e.level === filter.level);
    }

    if (filter?.category) {
      result = result.filter(e => e.category === filter.category);
    }

    if (filter?.since) {
      result = result.filter(e => e.timestamp >= filter.since);
    }

    if (filter?.limit) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  clear(): void {
    this.entries = [];
  }

  onLog(callback: (entry: LogEntry) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

// =============================================================================
// GLOBAL INSTANCE
// =============================================================================
export const logger = new Logger({
  minLevel: import.meta?.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
});

// Convenience shortcuts
export const debug = (msg: string, data?: any) => logger.debug(msg, data);
export const info = (msg: string, data?: any) => logger.info(msg, data);
export const warn = (msg: string, data?: any) => logger.warn(msg, data);
export const error = (msg: string, data?: any) => logger.error(msg, data);

export default logger;
