import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSessionReviewMeta,
  shouldShowLatencyReviewAction,
} from '../sessionReview.mjs';

test('shouldShowLatencyReviewAction only enables manual review for latency sessions with progress or a goal', () => {
  assert.equal(shouldShowLatencyReviewAction({
    sessionMode: 'deepWork',
    latencyCycleCount: 2,
    latencyHistory: [{ block: 'capture', label: 'done' }],
    bet: 'Ship the patch',
  }), false);

  assert.equal(shouldShowLatencyReviewAction({
    sessionMode: 'latencyBlocks',
    latencyCycleCount: 0,
    latencyHistory: [],
    bet: '   ',
  }), false);

  assert.equal(shouldShowLatencyReviewAction({
    sessionMode: 'latencyBlocks',
    latencyCycleCount: 1,
    latencyHistory: [],
    bet: '',
  }), true);
});

test('getSessionReviewMeta distinguishes manual latency review from enforced review', () => {
  assert.deepEqual(getSessionReviewMeta({
    sessionMode: 'latencyBlocks',
    isEnforcedReview: false,
  }), {
    title: 'Latency Review',
    description: 'Capture what this loop produced before you reset it.',
    badgeText: 'MANUAL SAVE',
    badgeClassName: 'bg-white/5 border-white/10 text-main',
  });

  assert.deepEqual(getSessionReviewMeta({
    sessionMode: 'deepWork',
    isEnforcedReview: true,
  }), {
    title: 'Session Review',
    description: 'Check your progress.',
    badgeText: 'STAY FOCUSED',
    badgeClassName: 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse',
  });
});