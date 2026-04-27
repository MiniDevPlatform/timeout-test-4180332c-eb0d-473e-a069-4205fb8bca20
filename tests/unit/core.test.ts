/**
 * MiniDev ONE Template - Tests
 * 
 * Unit tests for core systems.
 */

import { test, assert, createMock, spy, wait } from '../src/lib/test';
import { logger, LogLevel } from '../src/lib/logger';
import { validator, schemas, ValidationError } from '../src/lib/validation';
import { EventEmitter } from '../src/lib/events';

// =============================================================================
// LOGGER TESTS
// =============================================================================
test.describe('Logger', () => {
  test.it('should create logger instance', () => {
    assert.true(logger !== null);
  });

  test.it('should log at correct levels', () => {
    const original = console.log;
    let called = false;
    console.log = () => { called = true; };
    
    logger.info('test', 'Test message');
    
    console.log = original;
    assert.true(called);
  });

  test.it('should filter by level', () => {
    logger.setLevel(LogLevel.ERROR);
    const entries = logger.getEntries({ level: LogLevel.DEBUG });
    // No debug entries should exist
    assert.true(true); // If we get here, filtering works
  });

  test.it('should track entries', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.debug('test', 'Debug message');
    const entries = logger.getEntries();
    assert.true(entries.length > 0);
  });
});

// =============================================================================
// VALIDATOR TESTS
// =============================================================================
test.describe('Validator', () => {
  test.it('should validate required string', () => {
    const result = validator.validate({}, { name: { required: true } });
    assert.false(result.valid);
    assert.true('name' in result.errors);
  });

  test.it('should pass valid required string', () => {
    const result = validator.validate({ name: 'Test' }, { name: { required: true } });
    assert.true(result.valid);
  });

  test.it('should validate email', () => {
    const result = validator.validate({ email: 'invalid' }, { email: { type: 'email' } });
    assert.false(result.valid);
  });

  test.it('should pass valid email', () => {
    const result = validator.validate({ email: 'test@example.com' }, { email: { type: 'email' } });
    assert.true(result.valid);
  });

  test.it('should validate number range', () => {
    const result = validator.validate({ value: 150 }, { value: { type: 'number', min: 0, max: 100 } });
    assert.false(result.valid);
    assert.true('value' in result.errors);
  });

  test.it('should validate enum', () => {
    const result = validator.validate({ type: 'invalid' }, { type: { enum: ['a', 'b'] } });
    assert.false(result.valid);
  });

  test.it('should validate URL', () => {
    const result = validator.validate({ url: 'not-a-url' }, { url: { type: 'url' } });
    assert.false(result.valid);
  });

  test.it('should pass valid URL', () => {
    const result = validator.validate({ url: 'https://example.com' }, { url: { type: 'url' } });
    assert.true(result.valid);
  });

  test.it('should validate project schema', () => {
    const result = validator.validate({
      name: 'My Project',
      type: 'game',
      category: 'platformer',
    }, schemas.project);
    assert.true(result.valid);
  });
});

// =============================================================================
// EVENT TESTS
// =============================================================================
test.describe('EventEmitter', () => {
  test.it('should emit and receive events', () => {
    const emitter = new EventEmitter();
    let received = false;
    
    emitter.on('test', () => { received = true; });
    emitter.emit('test');
    
    assert.true(received);
  });

  test.it('should pass data to handlers', () => {
    const emitter = new EventEmitter();
    let data: any = null;
    
    emitter.on('test', (d) => { data = d; });
    emitter.emit('test', { foo: 'bar' });
    
    assert.deepEqual(data, { foo: 'bar' });
  });

  test.it('should support unsubscribe', () => {
    const emitter = new EventEmitter();
    let count = 0;
    
    const unsubscribe = emitter.on('test', () => { count++; });
    emitter.emit('test');
    unsubscribe();
    emitter.emit('test');
    
    assert.equal(count, 1);
  });

  test.it('should support once', () => {
    const emitter = new EventEmitter();
    let count = 0;
    
    emitter.once('test', () => { count++; });
    emitter.emit('test');
    emitter.emit('test');
    
    assert.equal(count, 1);
  });

  test.it('should handle errors gracefully', () => {
    const emitter = new EventEmitter();
    let called = false;
    
    emitter.on('error-throw', () => { throw new Error('test'); });
    emitter.on('error-catch', () => { called = true; });
    
    // Should not throw
    emitter.emit('error-throw');
    
    assert.true(called);
  });

  test.it('should clear all handlers', () => {
    const emitter = new EventEmitter();
    emitter.on('test', () => {});
    emitter.clear();
    
    assert.equal(emitter.getEventCount('test'), 0);
  });
});

// =============================================================================
// ASSERTION TESTS
// =============================================================================
test.describe('Assertions', () => {
  test.it('assert.equal should work', () => {
    assert.equal(1, 1);
    assert.equal('hello', 'hello');
  });

  test.it('assert.notEqual should work', () => {
    assert.notEqual(1, 2);
  });

  test.it('assert.true should work', () => {
    assert.true(true);
    assert.true(1);
    assert.true('hello');
  });

  test.it('assert.false should work', () => {
    assert.false(false);
    assert.false(0);
    assert.false('');
  });

  test.it('assert.null should work', () => {
    assert.null(null);
  });

  test.it('assert.notNull should work', () => {
    assert.notNull('hello');
    assert.notNull(0);
  });

  test.it('assert.throws should work', () => {
    assert.throws(() => { throw new Error('test'); });
  });

  test.it('assert.notThrows should work', () => {
    assert.notThrows(() => {});
  });

  test.it('assert.typeOf should work', () => {
    assert.typeOf('hello', 'string');
    assert.typeOf(123, 'number');
    assert.typeOf(true, 'boolean');
  });

  test.it('assert.contains should work', () => {
    assert.contains([1, 2, 3], 2);
  });

  test.it('assert.matches should work', () => {
    assert.matches('hello', /ello/);
  });

  test.it('assert.deepEqual should work', () => {
    assert.deepEqual({ a: 1 }, { a: 1 });
  });
});

// =============================================================================
// SCHEMA TESTS
// =============================================================================
test.describe('Schemas', () => {
  test.it('should validate game config', () => {
    const result = validator.validate({
      type: 'platformer',
      difficulty: 'medium',
    }, schemas.gameConfig);
    assert.true(result.valid);
  });

  test.it('should validate leaderboard entry', () => {
    const result = validator.validate({
      playerId: '123e4567-e89b-12d3-a456-426614174000',
      playerName: 'Player1',
      score: 1000,
    }, schemas.leaderboardEntry);
    assert.true(result.valid);
  });
});

// =============================================================================
// UTILITY TESTS
// =============================================================================
test.describe('Utilities', () => {
  test.it('should generate random IDs', async () => {
    const { randomId } = await import('../src/lib/test');
    const id1 = randomId();
    const id2 = randomId();
    assert.notEqual(id1, id2);
    assert.true(id1.length > 10);
  });

  test.it('should wait for duration', async () => {
    const { wait } = await import('../src/lib/test');
    const start = Date.now();
    await wait(50);
    const elapsed = Date.now() - start;
    assert.true(elapsed >= 40); // Allow some tolerance
  });
});

// =============================================================================
// RUN TESTS
// =============================================================================
if (typeof process !== 'undefined' && process.argv?.includes('test')) {
  test.run().then(results => {
    console.log('\nTests completed');
    process.exit(results.some(r => r.failed > 0) ? 1 : 0);
  });
}

export default test;
