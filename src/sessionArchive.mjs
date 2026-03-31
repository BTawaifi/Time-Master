const MODE_LABELS = {
  anchor: 'Anchor',
  deepWork: 'Deep Work',
  pomodoro: 'Pomodoro',
  latencyBlocks: 'Neuro-Ledger',
  quickNote: 'Quick Note',
};

const titleCase = (value) => value
  ? `${value.charAt(0).toUpperCase()}${value.slice(1)}`
  : 'Unknown';

const formatDurationCompact = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${remainingSeconds}s`;
};

export const getSessionModeLabel = (sessionMode) => MODE_LABELS[sessionMode] || 'Session';

export const getSessionStateSummary = (log) => {
  const state = log?.sessionState || {};

  if (log?.sessionMode === 'quickNote') {
    return 'Manual Note';
  }

  if (log?.sessionMode === 'pomodoro') {
    return `${titleCase(state.phase || 'focus')} • ${state.completedFocusSessions || 0} focus cycles`;
  }

  if (log?.sessionMode === 'latencyBlocks') {
    const streamsCount = Object.keys(state.ledger?.streams || {}).length;
    return `${streamsCount} Streams • ${formatDurationCompact(state.totalSessionSeconds)}`;
  }

  if (log?.sessionMode === 'anchor') {
    const returns = state.completedReturnCount || 0;
    const waits = state.waitCount || 0;
    return `${returns} returns • ${waits} waits • ${formatDurationCompact(state.elapsedSeconds)}`;
  }

  return `${formatDurationCompact(state.elapsedFocusSeconds)} focus`;
};

export const getSessionStateDetails = (log) => {
  const state = log?.sessionState || {};

  if (log?.sessionMode === 'quickNote') {
    return [
      ['Note type', 'Quick Note']
    ];
  }

  if (log?.sessionMode === 'pomodoro') {
    return [
      ['Phase', titleCase(state.phase || 'focus')],
      ['Completed focus cycles', String(state.completedFocusSessions || 0)],
    ];
  }

  if (log?.sessionMode === 'latencyBlocks') {
    const streams = Object.values(state.ledger?.streams || {});
    const details = [
      ['Streams', String(streams.length)],
      ['Total Time', formatDurationCompact(state.totalSessionSeconds)],
    ];

    streams.forEach(s => {
      details.push([`Stream: ${s.name}`, `${s.links.length} links`]);
    });

    return details;
  }

  if (log?.sessionMode === 'anchor') {
    return [
      ['Anchor', state.title || log.activity || 'Anchor Session'],
      ['Focus time', formatDurationCompact(state.elapsedSeconds)],
      ['Successful returns', String(state.completedReturnCount || 0)],
      ['Tangents', String(state.tangentCount ?? state.tangentQueue?.length ?? 0)],
      ['Wait count', String(state.waitCount || 0)],
      ['Unresolved tangents', String(state.unresolvedTangentCount ?? 0)],
      ['Next step', log.nextStep || 'None recorded'],
    ];
  }

  return [
    ['Focus time', formatDurationCompact(state.elapsedFocusSeconds)],
    ['Review path', titleCase(log.reviewSource || 'enforced')],
  ];
};

export const getSessionLatencyHistory = (log) => {
  if (log?.sessionMode !== 'latencyBlocks') {
    return [];
  }

  return log?.sessionState?.history || [];
};
