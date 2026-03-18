import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSessionModeLabel,
  getSessionStateDetails,
  getSessionStateSummary,
  getSessionLatencyHistory,
} from '../sessionArchive.mjs';

test('session archive helpers summarize latency block sessions', () => {
  const log = {
    sessionMode: 'latencyBlocks',
    reviewSource: 'manual',
    sessionState: {
      block: 'capture',
      cycleCount: 3,
      elapsedInBlock: 95,
    },
  };

  assert.equal(getSessionModeLabel(log.sessionMode), 'Latency Blocks');
  assert.equal(getSessionStateSummary(log), '3 cycles • Capture');
  assert.deepEqual(getSessionStateDetails(log), [
    ['Current block', 'Capture'],
    ['Completed cycles', '3'],
    ['Total session time', '0s'],
    ['Elapsed in block', '1m'],
    ['Review path', 'Manual'],
  ]);
});

test('session archive helpers retain readable fallbacks for existing deep work logs', () => {
  const log = {
    sessionMode: 'deepWork',
    sessionState: { elapsedFocusSeconds: 42 },
  };

  assert.equal(getSessionModeLabel(log.sessionMode), 'Deep Work');
  assert.equal(getSessionStateSummary(log), '42s focus');
  assert.deepEqual(getSessionStateDetails(log), [
    ['Focus time', '42s'],
    ['Review path', 'Enforced'],
  ]);
});

test('session archive extracts cycle trails for latency blocks', () => {
  const log = {
    sessionMode: 'latencyBlocks',
    sessionState: {
      history: [
        { block: 'A', label: 'Initiate' },
        { block: 'B', label: 'Validate' },
      ],
    },
  };

  assert.deepEqual(getSessionLatencyHistory(log), [
    { block: 'A', label: 'Initiate' },
    { block: 'B', label: 'Validate' },
  ]);

  const deepWorkLog = { sessionMode: 'deepWork' };
  assert.deepEqual(getSessionLatencyHistory(deepWorkLog), []);
});