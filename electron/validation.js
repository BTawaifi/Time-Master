const ENFORCEMENT_KEYS = [
  'desktopEclipse',
  'soundCrescendo',
  'mantraGate',
  'kioskMode',
];

const DATE_KEY_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function normalizeEnforcementConfig(config) {
  const source = isPlainObject(config) ? config : {};
  return ENFORCEMENT_KEYS.reduce((normalized, key) => {
    normalized[key] = source[key] === true;
    return normalized;
  }, {});
}

function normalizeEclipseLevel(level) {
  if (typeof level !== 'number' || !Number.isFinite(level)) {
    return 0;
  }

  return Math.max(0, Math.min(9, Math.floor(level)));
}

function isValidLogPayload(payload) {
  if (!isPlainObject(payload)) {
    return false;
  }

  return Object.entries(payload).every(([dateKey, dayLogs]) => {
    if (!DATE_KEY_REGEX.test(dateKey) || !Array.isArray(dayLogs)) {
      return false;
    }

    return dayLogs.every((entry) => isPlainObject(entry));
  });
}

module.exports = {
  ENFORCEMENT_KEYS,
  isPlainObject,
  isBoolean,
  normalizeEnforcementConfig,
  normalizeEclipseLevel,
  isValidLogPayload,
};

