const REMINDER_MODES = new Set(['stochastic', 'presets']);
const OSC_TYPES = new Set(['sine', 'triangle', 'square', 'sawtooth']);

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const asBoolean = (value, fallback) => (typeof value === 'boolean' ? value : fallback);
const asString = (value, fallback) => (typeof value === 'string' ? value : fallback);
const asNumber = (value, fallback, min = -Infinity, max = Infinity) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};
const asNumberInRange = (value, fallback, min, max) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  if (value < min || value > max) return fallback;
  return value;
};

const normalizeTone = (tone, fallback) => {
  const source = isPlainObject(tone) ? tone : {};
  return {
    freq: asNumber(source.freq, fallback.freq, 100, 2000),
    type: OSC_TYPES.has(source.type) ? source.type : fallback.type,
    volume: asNumber(source.volume, fallback.volume, 0, 1),
    duration: asNumber(source.duration, fallback.duration, 0.1, 2),
  };
};

const normalizeReminder = (reminder, fallback) => {
  const source = isPlainObject(reminder) ? reminder : {};
  return {
    enabled: asBoolean(source.enabled, fallback.enabled),
    interval: Math.round(asNumber(source.interval, fallback.interval, 10, 3600)),
    mode: REMINDER_MODES.has(source.mode) ? source.mode : fallback.mode,
    tone: normalizeTone(source.tone, fallback.tone),
  };
};

const normalizeTheme = (theme, fallback) => {
  const source = isPlainObject(theme) ? theme : {};
  return Object.keys(fallback).reduce((normalized, key) => {
    normalized[key] = asString(source[key], fallback[key]);
    return normalized;
  }, {});
};

export const normalizeSettings = (parsed, defaults, themeIds = []) => {
  if (!isPlainObject(parsed)) {
    return defaults;
  }

  const validThemeIds = new Set(themeIds);
  const reminders = Object.keys(defaults.reminders).reduce((normalized, key) => {
    normalized[key] = normalizeReminder(parsed.reminders?.[key], defaults.reminders[key]);
    return normalized;
  }, {});

  const enforcement = Object.keys(defaults.enforcement).reduce((normalized, key) => {
    normalized[key] = asBoolean(parsed.enforcement?.[key], defaults.enforcement[key]);
    return normalized;
  }, {});

  return {
    ...defaults,
    themeId: validThemeIds.has(parsed.themeId) ? parsed.themeId : defaults.themeId,
    autoMinimize: asBoolean(parsed.autoMinimize, defaults.autoMinimize),
    stayOnTop: asBoolean(parsed.stayOnTop, defaults.stayOnTop),
    pomodoroOnly: asBoolean(parsed.pomodoroOnly, defaults.pomodoroOnly),
    timerDuration: Math.round(asNumberInRange(parsed.timerDuration, defaults.timerDuration, 60, 86400)),
    restDuration: Math.round(asNumberInRange(parsed.restDuration, defaults.restDuration, 60, 86400)),
    logFilePath: asString(parsed.logFilePath, defaults.logFilePath),
    customTheme: normalizeTheme(parsed.customTheme, defaults.customTheme),
    reminders,
    enforcement,
  };
};

