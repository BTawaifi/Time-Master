const USER_DATA_ENTRY_NAMES = [
  'allowed_paths.json',
  'time_master_logs.json',
];

const SESSION_DATA_ENTRY_NAMES = [
  'Preferences',
  'Local Storage',
];

function buildMigrationTargets({ localUserDataDir, localSessionDataDir }) {
  return [
    ...USER_DATA_ENTRY_NAMES.map((entryName) => ({
      entryName,
      destinationRoot: localUserDataDir,
    })),
    ...SESSION_DATA_ENTRY_NAMES.map((entryName) => ({
      entryName,
      destinationRoot: localSessionDataDir,
    })),
  ];
}

module.exports = {
  USER_DATA_ENTRY_NAMES,
  SESSION_DATA_ENTRY_NAMES,
  buildMigrationTargets,
};