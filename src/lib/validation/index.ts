/**
 * MiniDev ONE Template - Validation & Error Handling
 * 
 * Schema validation, error classes, and error boundaries.
 */

import { logger } from '@/lib/logger';

// =============================================================================
// ERROR CLASSES
// =============================================================================
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context: Record<string, any>;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 500,
    context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    
    Error.captureStackTrace(this, this.constructor);
    logger.error(`[${code}] ${message}`, context);
  }

  toJSON(): Record<string, any> {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        context: this.context,
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` ${id}` : ''} not found`, 'NOT_FOUND', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'CONFLICT', 409, context);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// =============================================================================
// VALIDATOR
// =============================================================================
type Rule = {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'uuid';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => string | null;
};

type Schema = Record<string, Rule>;

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

class Validator {
  validate(data: any, schema: Schema): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data?.[field];
      
      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (value === undefined || value === null) {
        continue; // Optional field
      }

      // Type check
      if (rules.type) {
        const typeError = this.validateType(value, rules.type, field);
        if (typeError) {
          errors[field] = typeError;
          continue;
        }
      }

      // Number constraints
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors[field] = `${field} must be at least ${rules.min}`;
        }
        if (rules.max !== undefined && value > rules.max) {
          errors[field] = `${field} must be at most ${rules.max}`;
        }
      }

      // String constraints
      if (typeof value === 'string') {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors[field] = `${field} must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors[field] = `${field} must be at most ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors[field] = `${field} format is invalid`;
        }
      }

      // Enum check
      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
      }

      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          errors[field] = customError;
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private validateType(value: any, type: string, field: string): string | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') return `${field} must be a string`;
        break;
      case 'number':
        if (typeof value !== 'number') return `${field} must be a number`;
        break;
      case 'boolean':
        if (typeof value !== 'boolean') return `${field} must be a boolean`;
        break;
      case 'array':
        if (!Array.isArray(value)) return `${field} must be an array`;
        break;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return `${field} must be an object`;
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return `${field} must be a valid email`;
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          return `${field} must be a valid URL`;
        }
        break;
      case 'uuid':
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
          return `${field} must be a valid UUID`;
        }
        break;
    }
    return null;
  }

  // Schema builders
  string(required: boolean = false): Rule {
    return { required, type: 'string' };
  }

  number(required: boolean = false, min?: number, max?: number): Rule {
    return { required, type: 'number', min, max };
  }

  email(required: boolean = false): Rule {
    return { required, type: 'email' };
  }

  url(required: boolean = false): Rule {
    return { required, type: 'url' };
  }

  uuid(required: boolean = false): Rule {
    return { required, type: 'uuid' };
  }

  enum(values: any[], required: boolean = false): Rule {
    return { required, type: 'string', enum: values };
  }

  optional(rule: Rule): Rule {
    return { ...rule, required: false };
  }
}

// =============================================================================
// ERROR BOUNDARY
// =============================================================================
type ErrorHandler = (error: Error, context: Record<string, any>) => void;

class ErrorBoundary {
  private handlers: Map<string, ErrorHandler> = new Map();
  private fallbackHandler: ErrorHandler | null = null;

  wrap<T extends (...args: any[]) => any>(
    fn: T,
    context: Record<string, any> = {}
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error as Error, context);
        return undefined as any;
      }
    };
  }

  async wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: Record<string, any> = {}
  ): Promise<UnwrapPromise<ReturnType<T>> | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error as Error, context);
      return undefined as any;
    }
  }

  registerHandler(name: string, handler: ErrorHandler): void {
    this.handlers.set(name, handler);
  }

  setFallback(handler: ErrorHandler): void {
    this.fallbackHandler = handler;
  }

  handleError(error: Error, context: Record<string, any> = {}): void {
    logger.error('Error caught by boundary', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    });

    const handler = this.handlers.get(error.name) || this.handlers.get('default');
    
    if (handler) {
      handler(error, context);
    } else if (this.fallbackHandler) {
      this.fallbackHandler(error, context);
    }
  }
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// =============================================================================
// GLOBAL INSTANCES
// =============================================================================
export const validator = new Validator();
export const errorBoundary = new ErrorBoundary();

// Set default fallback
errorBoundary.setFallback((error, context) => {
  // In production, report to error service
  console.error('Unhandled error:', error, context);
});

// =============================================================================
// SCHEMAS
// =============================================================================
export const schemas = {
  project: {
    name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    type: { required: true, enum: ['game', 'app', 'website'] },
    category: { required: true, type: 'string' },
    description: { required: false, type: 'string', maxLength: 500 },
  },
  
  gameConfig: {
    type: { required: true, enum: ['platformer', 'snake', 'breakout', 'puzzle', 'shooter', 'racing', 'idle', 'tower', 'tactics', 'arcade', 'rpg', 'adventure', 'card', 'word', 'visual', 'sandbox'] },
    difficulty: { required: false, enum: ['easy', 'medium', 'hard'] },
    lives: { required: false, type: 'number', min: 0, max: 99 },
    timerDuration: { required: false, type: 'number', min: 0 },
  },

  leaderboardEntry: {
    playerId: { required: true, type: 'uuid' },
    playerName: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    score: { required: true, type: 'number', min: 0 },
  },
};

export default { validator, errorBoundary, schemas };
