import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSettings } from '../settingsValidation.mjs';

const defaults = {
  themeId: 'enforcer',
  autoMinimize: true,
  stayOnTop: false,
  pomodoroOnly: false,
  timerDuration: 1500,
  restDuration: 300,
  logFilePath: '',
  customTheme: { bg: '#111', accent: '#fff' },
  reminders: {
    idle: { enabled: true, interval: 60, mode: 'stochastic', tone: { freq: 440, type: 'sine', volume: 0.2, duration: 0.4 } },
    review: { enabled: true, interval: 30, mode: 'presets', tone: { freq: 660, type: 'triangle', volume: 0.3, duration: 0.5 } },
  },
  enforcement: { desktopEclipse: false, soundCrescendo: false, kioskMode: false, mantraGate: false },
};

test('normalizeSettings returns defaults for invalid root input', () => {
  assert.deepEqual(normalizeSettings(null, defaults, ['enforcer', 'custom']), defaults);
});

test('normalizeSettings preserves valid values and theme ids', () => {
  const normalized = normalizeSettings({
    themeId: 'custom',
    autoMinimize: false,
    timerDuration: 1800,
    customTheme: { bg: '#222' },
    reminders: {
      idle: { interval: 120, tone: { freq: 900, type: 'square', volume: 0.8, duration: 1.5 } },
    },
    enforcement: { kioskMode: true },
  }, defaults, ['enforcer', 'custom']);

  assert.equal(normalized.themeId, 'custom');
  assert.equal(normalized.autoMinimize, false);
  assert.equal(normalized.timerDuration, 1800);
  assert.equal(normalized.customTheme.bg, '#222');
  assert.equal(normalized.customTheme.accent, '#fff');
  assert.equal(normalized.reminders.idle.interval, 120);
  assert.equal(normalized.reminders.idle.tone.type, 'square');
  assert.equal(normalized.enforcement.kioskMode, true);
});

test('normalizeSettings clamps invalid nested values back to safe ranges/defaults', () => {
  const normalized = normalizeSettings({
    themeId: 'broken',
    pomodoroOnly: 'yes',
    timerDuration: -10,
    restDuration: Number.POSITIVE_INFINITY,
    logFilePath: 44,
    reminders: {
      idle: { interval: 1, mode: 'chaos', tone: { freq: 99999, type: 'noise', volume: 9, duration: 0 } },
    },
    enforcement: { desktopEclipse: 'true', mantraGate: true },
  }, defaults, ['enforcer', 'custom']);

  assert.equal(normalized.themeId, 'enforcer');
  assert.equal(normalized.pomodoroOnly, false);
  assert.equal(normalized.timerDuration, defaults.timerDuration);
  assert.equal(normalized.restDuration, defaults.restDuration);
  assert.equal(normalized.logFilePath, '');
  assert.equal(normalized.reminders.idle.interval, 10);
  assert.equal(normalized.reminders.idle.mode, defaults.reminders.idle.mode);
  assert.equal(normalized.reminders.idle.tone.freq, 2000);
  assert.equal(normalized.reminders.idle.tone.type, defaults.reminders.idle.tone.type);
  assert.equal(normalized.reminders.idle.tone.volume, 1);
  assert.equal(normalized.reminders.idle.tone.duration, 0.1);
  assert.equal(normalized.enforcement.desktopEclipse, false);
  assert.equal(normalized.enforcement.mantraGate, true);
});

