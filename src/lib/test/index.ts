/**
 * MiniDev ONE Template - Testing Utilities
 * 
 * Simple test framework for the template.
 */

import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================
interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
  timeout?: number;
  retries?: number;
}

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: Error;
}

interface SuiteResult {
  name: string;
  passed: number;
  failed: number;
  duration: number;
  tests: TestResult[];
}

// =============================================================================
// ASSERTIONS
// =============================================================================
class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

const assert = {
  equal<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
      );
    }
  },

  notEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual === expected) {
      throw new AssertionError(
        message || `Expected not ${JSON.stringify(expected)} but got it`
      );
    }
  },

  deepEqual(actual: any, expected: any, message?: string): void {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new AssertionError(
        message || `Expected ${expectedStr} but got ${actualStr}`
      );
    }
  },

  true(value: any, message?: string): void {
    if (!value) {
      throw new AssertionError(message || `Expected truthy but got ${value}`);
    }
  },

  false(value: any, message?: string): void {
    if (value) {
      throw new AssertionError(message || `Expected falsy but got ${value}`);
    }
  },

  null(value: any, message?: string): void {
    if (value !== null) {
      throw new AssertionError(message || `Expected null but got ${value}`);
    }
  },

  notNull(value: any, message?: string): void {
    if (value === null || value === undefined) {
      throw new AssertionError(message || `Expected not null`);
    }
  },

  throws(fn: () => void, message?: string): void {
    let threw = false;
    try {
      fn();
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new AssertionError(message || 'Expected function to throw');
    }
  },

  notThrows(fn: () => void, message?: string): void {
    try {
      fn();
    } catch (e) {
      throw new AssertionError(message || `Expected function not to throw, but threw: ${(e as Error).message}`);
    }
  },

  typeOf<T>(value: T, expectedType: string, message?: string): void {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new AssertionError(
        message || `Expected type ${expectedType} but got ${actualType}`
      );
    }
  },

  instanceOf(value: any, expectedClass: any, message?: string): void {
    if (!(value instanceof expectedClass)) {
      throw new AssertionError(
        message || `Expected instance of ${expectedClass.name}`
      );
    }
  },

  contains(array: any[], item: any, message?: string): void {
    if (!array.includes(item)) {
      throw new AssertionError(
        message || `Expected array to contain ${JSON.stringify(item)}`
      );
    }
  },

  matches(value: string, regex: RegExp, message?: string): void {
    if (!regex.test(value)) {
      throw new AssertionError(
        message || `Expected "${value}" to match ${regex}`
      );
    }
  },

  fails(message?: string): never {
    throw new AssertionError(message || 'Test intentionally failed');
  },
};

// =============================================================================
// TEST RUNNER
// =============================================================================
class TestRunner {
  private tests: TestCase[] = [];
  private results: SuiteResult[] = [];
  private currentSuite: string = 'default';
  private onlyMode: boolean = false;
  private skipMode: boolean = false;

  describe(name: string, fn: () => void): this {
    const previousSuite = this.currentSuite;
    this.currentSuite = name;
    fn();
    this.currentSuite = previousSuite;
    return this;
  }

  it(name: string, fn: () => void | Promise<void>, options?: { timeout?: number; only?: boolean; skip?: boolean }): this {
    if (options?.only) this.onlyMode = true;
    if (options?.skip) this.skipMode = true;
    
    this.tests.push({
      name: `${this.currentSuite} > ${name}`,
      fn,
      timeout: options?.timeout,
    });
    return this;
  }

  test = this.it;

  async run(): Promise<SuiteResult[]> {
    if (this.tests.length === 0) {
      logger.info('test', 'No tests to run');
      return [];
    }

    const results: SuiteResult[] = [];
    let currentSuiteTests: TestResult[] = [];
    let currentSuiteName = '';
    let suiteStartTime = Date.now();

    for (const test of this.tests) {
      if (test.name.split(' > ')[0] !== currentSuiteName) {
        if (currentSuiteTests.length > 0) {
          results.push({
            name: currentSuiteName,
            passed: currentSuiteTests.filter(t => t.passed).length,
            failed: currentSuiteTests.filter(t => !t.passed).length,
            duration: Date.now() - suiteStartTime,
            tests: currentSuiteTests,
          });
        }
        currentSuiteName = test.name.split(' > ')[0];
        currentSuiteTests = [];
        suiteStartTime = Date.now();
      }

      if (this.skipMode) {
        currentSuiteTests.push({
          name: test.name,
          passed: false,
          duration: 0,
          error: new Error('Skipped'),
        });
        this.skipMode = false;
        continue;
      }

      const startTime = Date.now();
      try {
        await this.runTest(test);
        currentSuiteTests.push({
          name: test.name,
          passed: true,
          duration: Date.now() - startTime,
        });
      } catch (error) {
        currentSuiteTests.push({
          name: test.name,
          passed: false,
          duration: Date.now() - startTime,
          error: error as Error,
        });
      }
    }

    if (currentSuiteTests.length > 0) {
      results.push({
        name: currentSuiteName,
        passed: currentSuiteTests.filter(t => t.passed).length,
        failed: currentSuiteTests.filter(t => !t.passed).length,
        duration: Date.now() - suiteStartTime,
        tests: currentSuiteTests,
      });
    }

    this.results = results;
    this.printResults(results);
    return results;
  }

  private async runTest(test: TestCase): Promise<void> {
    if (test.timeout) {
      await Promise.race([
        test.fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), test.timeout)),
      ]);
    } else {
      await test.fn();
    }
  }

  private printResults(results: SuiteResult[]): void {
    const totalTests = results.reduce((sum, r) => sum + r.passed + r.failed, 0);
    const passedTests = results.reduce((sum, r) => sum + r.passed, 0);
    const failedTests = results.reduce((sum, r) => sum + r.failed, 0);

    console.log('\n' + '='.repeat(60));
    console.log(`TEST RESULTS: ${passedTests}/${totalTests} passed`);
    console.log('='.repeat(60));

    for (const suite of results) {
      console.log(`\n${suite.name} (${suite.passed}/${suite.passed + suite.failed})`);
      console.log('-'.repeat(40));

      for (const test of suite.tests) {
        const icon = test.passed ? '✓' : '✗';
        const status = test.passed ? '\x1b[32m' : '\x1b[31m';
        const duration = `(${test.duration}ms)`;
        console.log(`${status}${icon}\x1b[0m ${test.name} ${duration}`);
        
        if (!test.passed && test.error) {
          console.log(`  \x1b[31m${test.error.message}\x1b[0m`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    
    if (failedTests > 0) {
      console.log(`\x1b[31m${failedTests} test(s) failed\x1b[0m`);
      process.exit(1);
    } else {
      console.log('\x1b[32mAll tests passed!\x1b[0m');
    }
  }
}

// =============================================================================
// MOCK UTILITIES
// =============================================================================
function createMock<T extends object>(overrides?: Partial<T>): T {
  return { ...{} } as T;
}

function spy<T extends object, K extends keyof T>(
  obj: T,
  method: K,
  fn: (...args: any[]) => any
): { original: T[K]; calls: any[][]; restore: () => void } {
  const original = obj[method];
  const calls: any[][] = [];

  obj[method] = ((...args: any[]) => {
    calls.push(args);
    return fn(...args);
  }) as any;

  return {
    original,
    calls,
    restore: () => {
      obj[method] = original;
    },
  };
}

function stub<T extends object, K extends keyof T>(
  obj: T,
  method: K,
  returnValue?: any
): { original: T[K]; restore: () => void } {
  const original = obj[method];
  obj[method] = () => returnValue;
  return {
    original,
    restore: () => {
      obj[method] = original;
    },
  };
}

// =============================================================================
// TEST UTILITIES
// =============================================================================
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function sleep(fn: () => void, condition: () => boolean, timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 50);
      }
    };
    
    fn();
    check();
  });
}

// =============================================================================
// GLOBAL TEST INSTANCE
// =============================================================================
export const test = new TestRunner();
export { assert, createMock, spy, stub, wait, randomId, sleep };
export default test;
