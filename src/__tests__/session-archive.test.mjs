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
      totalSessionSeconds: 120,
      ledger: {
        streams: {
          stream_1: { name: 'Alpha', links: [{ id: 'l1' }, { id: 'l2' }] },
        }
      }
    },
  };

  assert.equal(getSessionModeLabel(log.sessionMode), 'Neuro-Ledger');
  assert.equal(getSessionStateSummary(log), '1 Streams • 2m');
  assert.deepEqual(getSessionStateDetails(log), [
    ['Streams', '1'],
    ['Total Time', '2m'],
    ['Stream: Alpha', '2 links']
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

test('session archive helpers summarize quickNote sessions', () => {
  const log = {
    sessionMode: 'quickNote',
    sessionState: {},
  };

  assert.equal(getSessionModeLabel(log.sessionMode), 'Quick Note');
  assert.equal(getSessionStateSummary(log), 'Manual Note');
  assert.deepEqual(getSessionStateDetails(log), [
    ['Note type', 'Quick Note']
  ]);
});