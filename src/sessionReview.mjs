export const shouldShowLatencyReviewAction = ({
  sessionMode,
  latencyCycleCount,
  latencyHistory,
  bet,
}) => {
  if (sessionMode !== 'latencyBlocks') {
    return false;
  }

  return latencyCycleCount > 0 || latencyHistory.length > 0 || Boolean(bet?.trim());
};

export const getSessionReviewMeta = ({ sessionMode, isEnforcedReview }) => {
  if (sessionMode === 'anchor') {
    return {
      title: 'Anchor Closeout',
      description: 'Capture the outcome, next move, and what caused drift.',
      badgeText: 'ANCHOR SAVE',
      badgeClassName: 'bg-app-primary/10 border-app-primary/20 text-app-primary',
    };
  }

  if (sessionMode === 'latencyBlocks' && !isEnforcedReview) {
    return {
      title: 'Latency Review',
      description: 'Capture what this loop produced before you reset it.',
      badgeText: 'MANUAL SAVE',
      badgeClassName: 'bg-white/5 border-white/10 text-main',
    };
  }

  return {
    title: 'Session Review',
    description: 'Check your progress.',
    badgeText: 'STAY FOCUSED',
    badgeClassName: 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse',
  };
};
