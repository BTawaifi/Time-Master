import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  USER_DATA_ENTRY_NAMES,
  SESSION_DATA_ENTRY_NAMES,
  buildMigrationTargets,
} = require('../../electron/storageMigration.js');

test('buildMigrationTargets routes durable app data to the correct persistent roots', () => {
  const localUserDataDir = 'C:/Users/Test/AppData/Local/time-master/state';
  const localSessionDataDir = 'C:/Users/Test/AppData/Local/time-master/session-data-v2';

  assert.deepEqual(buildMigrationTargets({ localUserDataDir, localSessionDataDir }), [
    { entryName: 'allowed_paths.json', destinationRoot: localUserDataDir },
    { entryName: 'time_master_logs.json', destinationRoot: localUserDataDir },
    { entryName: 'Preferences', destinationRoot: localSessionDataDir },
    { entryName: 'Local Storage', destinationRoot: localSessionDataDir },
  ]);
});

test('migration entry lists stay limited to user settings and required browser storage', () => {
  assert.deepEqual(USER_DATA_ENTRY_NAMES, [
    'allowed_paths.json',
    'time_master_logs.json',
  ]);
  assert.deepEqual(SESSION_DATA_ENTRY_NAMES, [
    'Preferences',
    'Local Storage',
  ]);
});