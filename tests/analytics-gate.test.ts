import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGate } from '../src/scripts/analytics-gate.ts';

const ok = { hostname: 'elinsoft.co.uk', webdriver: false, prod: true };

test('production host is counted', () => {
  assert.deepEqual(evaluateGate(ok), { counted: true });
});

test('www host is counted', () => {
  assert.deepEqual(evaluateGate({ ...ok, hostname: 'www.elinsoft.co.uk' }), { counted: true });
});

test('localhost is not counted', () => {
  assert.deepEqual(evaluateGate({ ...ok, hostname: 'localhost' }), { counted: false, reason: 'host' });
});

test('preview workers.dev host is not counted', () => {
  assert.deepEqual(evaluateGate({ ...ok, hostname: 'elinsoft-site.example.workers.dev' }), { counted: false, reason: 'host' });
});

test('lookalike host is not counted', () => {
  assert.deepEqual(evaluateGate({ ...ok, hostname: 'elinsoft.co.uk.evil.test' }), { counted: false, reason: 'host' });
});

test('automated browser is not counted', () => {
  assert.deepEqual(evaluateGate({ ...ok, webdriver: true }), { counted: false, reason: 'webdriver' });
});

test('dev build is not counted', () => {
  assert.deepEqual(evaluateGate({ ...ok, prod: false }), { counted: false, reason: 'dev build' });
});

test('an exception means not counted', () => {
  const bad = {
    get hostname(): string {
      throw new Error('boom');
    },
    webdriver: false,
    prod: true,
  };
  assert.deepEqual(evaluateGate(bad), { counted: false, reason: 'error' });
});
