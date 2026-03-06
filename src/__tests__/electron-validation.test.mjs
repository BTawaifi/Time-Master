import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  isBoolean,
  normalizeEnforcementConfig,
  normalizeEclipseLevel,
  isValidLogPayload,
} = require('../../electron/validation.js');

test('isBoolean only accepts literal booleans', () => {
  assert.equal(isBoolean(true), true);
  assert.equal(isBoolean(false), true);
  assert.equal(isBoolean('true'), false);
  assert.equal(isBoolean(1), false);
  assert.equal(isBoolean(null), false);
});

test('normalizeEnforcementConfig keeps known flags and defaults invalid input to false', () => {
  assert.deepEqual(
    normalizeEnforcementConfig({
      desktopEclipse: true,
      soundCrescendo: false,
      mantraGate: 'yes',
      kioskMode: true,
      extraFlag: true,
    }),
    {
      desktopEclipse: true,
      soundCrescendo: false,
      mantraGate: false,
      kioskMode: true,
    },
  );

  assert.deepEqual(normalizeEnforcementConfig(null), {
    desktopEclipse: false,
    soundCrescendo: false,
    mantraGate: false,
    kioskMode: false,
  });
});

test('normalizeEclipseLevel clamps and floors numeric input', () => {
  assert.equal(normalizeEclipseLevel(0), 0);
  assert.equal(normalizeEclipseLevel(3.8), 3);
  assert.equal(normalizeEclipseLevel(99), 9);
  assert.equal(normalizeEclipseLevel(-4), 0);
  assert.equal(normalizeEclipseLevel(Number.NaN), 0);
  assert.equal(normalizeEclipseLevel('5'), 0);
});

test('isValidLogPayload accepts date-keyed plain-object log arrays', () => {
  assert.equal(
    isValidLogPayload({
      '2026-03-06': [
        { id: 1, activity: 'Deep work', utility: 8 },
        { id: 2, activity: 'Review', utility: 6 },
      ],
      '2026-03-07': [],
    }),
    true,
  );
});

test('isValidLogPayload rejects malformed log structures', () => {
  assert.equal(isValidLogPayload(null), false);
  assert.equal(isValidLogPayload([]), false);
  assert.equal(isValidLogPayload({ today: [] }), false);
  assert.equal(isValidLogPayload({ '2026-03-06': {} }), false);
  assert.equal(isValidLogPayload({ '2026-03-06': [null] }), false);
  assert.equal(isValidLogPayload({ '2026-03-06': [['nested-array']] }), false);
});

