import { useState, useEffect, useRef, useCallback } from 'react';

const ANCHOR_SIDE_TASK_CAP_SECONDS = 10 * 60;
const ANCHOR_HISTORY_LIMIT = 12;

const createIsoTimestamp = () => new Date().toISOString();
const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const createLatencyWorkflow = () => ({
    activeStreamId: 'default',
    streams: {
        default: {
            id: 'default',
            name: 'Primary Stream',
            currentLinkIndex: 0,
            elapsed: 0,
            isRunning: false,
            links: [{ id: 'link_1', label: 'Link I', status: 'active' }],
            history: []
        }
    }
});

const createAnchorHistoryEntry = (event, label, details = {}) => ({
    id: `anchor-history_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    event,
    label,
    timestamp: createIsoTimestamp(),
    ...details,
});

const createAnchorTangent = ({ title, reason = '', disposition = 'later', returnAction }) => ({
    id: `anchor-tangent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    reason,
    disposition,
    returnAction,
    capturedAt: createIsoTimestamp(),
    resolvedAt: null,
});

const createSideTask = (title) => ({
    title,
    startedAt: createIsoTimestamp(),
    elapsedSeconds: 0,
    status: 'active',
    timeCapSeconds: ANCHOR_SIDE_TASK_CAP_SECONDS,
    resolvedAt: null,
});

const createWaitingContext = ({ label, resumeAction }) => ({
    label,
    startedAt: createIsoTimestamp(),
    resumeAction,
    resolvedAt: null,
});

const createResumePrompt = ({ anchorId, title, intent, nextAction, waitLabel, source }) => ({
    anchorId,
    title,
    intent,
    nextAction,
    waitLabel,
    label: waitLabel,
    source,
    openedAt: createIsoTimestamp(),
});

export const createDefaultAnchorState = () => ({
    anchorId: null,
    title: '',
    intent: '',
    nextAction: '',
    status: 'idle',
    elapsedSeconds: 0,
    startedAt: null,
    lastResumeAt: null,
    driftCount: 0,
    returnCount: 0,
    completedReturnCount: 0,
    completionStreak: 0,
    completedAnchorCount: 0,
    waitCount: 0,
    waitSeconds: 0,
    tangentQueue: [],
    history: [],
    waitingContext: null,
    sideTask: null,
    resumePrompt: null,
    lastCompletedAt: null,
    lastAbandonedAt: null,
    lastCloseout: null,
    isComplete: false,
});

const limitAnchorHistory = (history, entry) => [...history, entry].slice(-ANCHOR_HISTORY_LIMIT);

export const useTimer = (settings, setSettings, playPeep, playAlarm, setIsEnforced) => {
    const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
    const [isActive, setIsActive] = useState(false);
    const [pomodoroState, setPomodoroState] = useState('focus');
    const [focusCount, setFocusCount] = useState(0);
    const [ledger, setLedger] = useState(createLatencyWorkflow);
    const [anchor, setAnchor] = useState(createDefaultAnchorState);

    const [latencySessionTotal, setLatencySessionTotal] = useState(0);
    const timerRef = useRef(null);
    const ledgerRef = useRef(ledger);
    const previousModeRef = useRef(settings.sessionMode);

    useEffect(() => {
        ledgerRef.current = ledger;
    }, [ledger]);
    const sessionMode = settings.sessionMode;

    const transitionPomodoro = useCallback((autoResume = true) => {
        if (pomodoroState === 'focus') {
            setFocusCount(prev => prev + 1);
            setPomodoroState('rest');
            setTimeLeft(settings.restDuration);
            playPeep(440, 0.5);
        } else {
            setPomodoroState('focus');
            setTimeLeft(settings.timerDuration);
            playPeep(880, 0.5);
        }

        if (autoResume) {
            setTimeout(() => setIsActive(true), 100);
        }
    }, [pomodoroState, settings.restDuration, settings.timerDuration, playPeep]);

    const resetLatencyWorkflow = useCallback(() => {
        setIsActive(false);
        setLedger(createLatencyWorkflow());
        setLatencySessionTotal(0);
    }, []);

    const resetAnchorWorkflow = useCallback(() => {
        setIsActive(false);
        setAnchor(createDefaultAnchorState());
    }, []);

    const initializeAnchor = useCallback((payload = {}) => {
        const title = cleanText(payload.title);
        const intent = cleanText(payload.intent);
        const nextAction = cleanText(payload.nextAction);

        if (!title || !intent) {
            return false;
        }

        const anchorId = cleanText(payload.anchorId) || `anchor_${Date.now()}`;
        const startedAt = createIsoTimestamp();

        setIsActive(false);
        setAnchor({
            ...createDefaultAnchorState(),
            anchorId,
            title,
            intent,
            nextAction,
            status: 'active',
            startedAt,
            lastResumeAt: startedAt,
            history: [
                createAnchorHistoryEntry('anchor-started', 'Anchor started', {
                    title,
                    intent,
                    nextAction,
                }),
            ],
        });
        playPeep(880, 0.2);
        return true;
    }, [playPeep]);

    const toggleAnchor = useCallback(() => {
        setAnchor(prev => {
            if (!prev.title || !prev.intent) {
                return prev;
            }

            if (prev.status === 'active') {
                return {
                    ...prev,
                    status: 'paused',
                    history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('anchor-paused', 'Anchor paused', {
                        nextAction: prev.nextAction,
                    })),
                };
            }

            const resumedAt = createIsoTimestamp();
            return {
                ...prev,
                status: 'active',
                startedAt: prev.startedAt || resumedAt,
                lastResumeAt: resumedAt,
                returnCount: prev.returnCount + 1,
                completedReturnCount: prev.completedReturnCount + 1,
                completionStreak: prev.completionStreak + 1,
                waitingContext: null,
                resumePrompt: null,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('return-resumed', 'Returned to anchor', {
                    nextAction: prev.resumePrompt?.nextAction || prev.waitingContext?.resumeAction || prev.nextAction,
                })),
            };
        });
    }, []);

    const pauseAnchor = useCallback((returnAction) => {
        const nextAction = cleanText(returnAction);

        setAnchor(prev => {
            if (prev.status !== 'active') {
                return prev;
            }

            const resolvedNextAction = nextAction || prev.nextAction || prev.waitingContext?.resumeAction || '';
            return {
                ...prev,
                status: 'paused',
                nextAction: resolvedNextAction,
                waitingContext: prev.waitingContext
                    ? { ...prev.waitingContext, resumeAction: resolvedNextAction }
                    : prev.waitingContext,
                sideTask: prev.sideTask?.status === 'active'
                    ? { ...prev.sideTask, status: 'paused', resolvedAt: createIsoTimestamp() }
                    : prev.sideTask,
                resumePrompt: createResumePrompt({
                    anchorId: prev.anchorId,
                    title: prev.title,
                    intent: prev.intent,
                    nextAction: resolvedNextAction,
                    waitLabel: prev.waitingContext?.label || 'Paused',
                    source: 'pause',
                }),
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('anchor-paused', 'Anchor paused', {
                    nextAction: resolvedNextAction,
                })),
            };
        });
        setIsActive(false);
        playPeep(440, 0.2);
        return true;
    }, [playPeep]);

    const updateReturnAction = useCallback((value) => {
        const nextAction = cleanText(typeof value === 'string' ? value : value?.nextAction);
        if (!nextAction) {
            return false;
        }

        setAnchor(prev => ({
            ...prev,
            nextAction,
            waitingContext: prev.waitingContext
                ? { ...prev.waitingContext, resumeAction: nextAction }
                : prev.waitingContext,
            resumePrompt: prev.resumePrompt
                ? { ...prev.resumePrompt, nextAction }
                : prev.resumePrompt,
        }));
        return true;
    }, []);

    const captureTangent = useCallback((payload = {}) => {
        const title = cleanText(payload.title);
        const returnAction = cleanText(payload.returnAction);
        const reason = cleanText(payload.reason);
        const disposition = payload.disposition === 'discard' ? 'discard' : 'later';

        if (!title || !returnAction) {
            return false;
        }

        setAnchor(prev => {
            if (!prev.title) {
                return prev;
            }

            const tangent = createAnchorTangent({
                title,
                reason,
                disposition,
                returnAction,
            });

            // Auto-start the tangent as a side task
            const pausedPrevTask = prev.sideTask?.status === 'active'
                ? { ...prev.sideTask, status: 'paused', resolvedAt: createIsoTimestamp() }
                : prev.sideTask;

            const sideTask = createSideTask(title);
            sideTask.tangentId = tangent.id;

            return {
                ...prev,
                driftCount: prev.driftCount + 1,
                tangentQueue: [...prev.tangentQueue, tangent],
                sideTask: pausedPrevTask?.status === 'done' || !pausedPrevTask ? sideTask : sideTask,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('tangent-captured', 'Tangent captured & started as task', {
                    title,
                    reason,
                    returnAction,
                    disposition,
                })),
            };
        });
        playPeep(440, 0.2);
        return true;
    }, [playPeep]);

    const enterWaiting = useCallback((payload = {}) => {
        const label = cleanText(payload.label);
        const resumeAction = cleanText(payload.resumeAction);
        const returnAction = cleanText(payload.returnAction) || resumeAction;

        if (!label || !resumeAction) {
            return false;
        }

        const startedAt = createIsoTimestamp();

        setAnchor(prev => {
            if (!prev.title) {
                return prev;
            }

            return {
                ...prev,
                status: 'waiting',
                waitCount: prev.waitCount + 1,
                waitingContext: createWaitingContext({ label, resumeAction }),
                nextAction: returnAction || prev.nextAction || resumeAction,
                sideTask: prev.sideTask?.status === 'active'
                    ? { ...prev.sideTask, status: 'paused', resolvedAt: startedAt }
                    : prev.sideTask,
                resumePrompt: null,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('wait-started', 'Waiting started', {
                    label,
                    resumeAction,
                })),
            };
        });
        setIsActive(false);
        playPeep(440, 0.2);
        return true;
    }, [playPeep]);

    const startTangentAsTask = useCallback((tangentId) => {
        if (!tangentId) {
            return false;
        }

        setAnchor(prev => {
            const tangent = prev.tangentQueue.find(t => t.id === tangentId);
            if (!tangent) {
                return prev;
            }

            // Pause any currently active side task
            const pausedPrev = prev.sideTask?.status === 'active'
                ? { ...prev.sideTask, status: 'paused', resolvedAt: createIsoTimestamp() }
                : prev.sideTask;

            const sideTask = createSideTask(tangent.title);
            sideTask.tangentId = tangent.id;

            return {
                ...prev,
                sideTask,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('tangent-task-started', 'Tangent started as task', {
                    title: tangent.title,
                    tangentId,
                })),
            };
        });
        playPeep(880, 0.2);
        return true;
    }, [playPeep]);

    const toggleSideTask = useCallback(() => {
        setAnchor(prev => {
            if (!prev.sideTask || prev.sideTask.status === 'done' || prev.sideTask.status === 'timedOut') {
                return prev;
            }

            const isPausing = prev.sideTask.status === 'active';

            return {
                ...prev,
                sideTask: {
                    ...prev.sideTask,
                    status: isPausing ? 'paused' : 'active',
                    resolvedAt: isPausing ? createIsoTimestamp() : null,
                },
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry(
                    isPausing ? 'side-task-paused' : 'side-task-resumed',
                    isPausing ? 'Side task paused' : 'Side task resumed',
                    { title: prev.sideTask.title }
                )),
            };
        });
        playPeep(440, 0.2);
        return true;
    }, [playPeep]);

    const completeSideTask = useCallback(() => {
        setAnchor(prev => {
            if (!prev.sideTask) {
                return prev;
            }

            const completedAt = createIsoTimestamp();
            const tangentId = prev.sideTask.tangentId;

            return {
                ...prev,
                sideTask: {
                    ...prev.sideTask,
                    status: 'done',
                    resolvedAt: completedAt,
                },
                // Mark the tangent in the queue as resolved so done state persists
                tangentQueue: tangentId
                    ? prev.tangentQueue.map(t =>
                        t.id === tangentId ? { ...t, resolvedAt: completedAt } : t
                      )
                    : prev.tangentQueue,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('side-task-complete', 'Side task completed', {
                    title: prev.sideTask.title,
                })),
            };
        });
        playPeep(880, 0.2);
        return true;
    }, [playPeep]);

    const resolveWaiting = useCallback((payload = {}) => {
        const returnAction = cleanText(payload.nextAction || payload.returnAction);
        const resolvedAt = createIsoTimestamp();

        setAnchor(prev => {
            if (prev.status !== 'waiting' || !prev.waitingContext) {
                return prev;
            }

            const nextAction = returnAction || prev.waitingContext.resumeAction || prev.nextAction;
            const sideTask = prev.sideTask?.status === 'active'
                ? {
                    ...prev.sideTask,
                    status: 'paused',
                    resolvedAt,
                }
                : prev.sideTask;

            return {
                ...prev,
                status: 'paused',
                nextAction,
                waitingContext: {
                    ...prev.waitingContext,
                    resolvedAt,
                    resumeAction: nextAction,
                },
                sideTask,
                resumePrompt: createResumePrompt({
                    anchorId: prev.anchorId,
                    title: prev.title,
                    intent: prev.intent,
                    nextAction,
                    waitLabel: prev.waitingContext.label,
                    source: 'wait-resolved',
                }),
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('wait-resolved', 'Waiting resolved', {
                    label: prev.waitingContext.label,
                    nextAction,
                })),
            };
        });
        return true;
    }, []);

    const resumeAnchor = useCallback((payload = {}) => {
        const explicitNextAction = cleanText(payload.nextAction || payload.returnAction);
        const resumedAt = createIsoTimestamp();
        let shouldPlay = false;

        setAnchor(prev => {
            if (!prev.title || prev.status === 'active') {
                return prev;
            }

            const nextAction = explicitNextAction
                || prev.resumePrompt?.nextAction
                || prev.waitingContext?.resumeAction
                || prev.nextAction;

            shouldPlay = true;

            return {
                ...prev,
                status: 'active',
                nextAction,
                lastResumeAt: resumedAt,
                returnCount: prev.returnCount + 1,
                completedReturnCount: prev.completedReturnCount + 1,
                completionStreak: prev.completionStreak + 1,
                waitingContext: null,
                resumePrompt: null,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('return-resumed', 'Return resumed', {
                    nextAction,
                    fromStatus: prev.status,
                })),
                sideTask: prev.sideTask?.status === 'timedOut'
                    ? {
                        ...prev.sideTask,
                        resolvedAt: prev.sideTask.resolvedAt || resumedAt,
                    }
                    : prev.sideTask,
            };
        });

        if (shouldPlay) {
            playPeep(880, 0.2);
        }

        return shouldPlay;
    }, [playPeep]);

    const dismissResumePrompt = useCallback(() => {
        setAnchor(prev => ({
            ...prev,
            resumePrompt: null,
        }));
    }, []);

    const completeAnchor = useCallback((payload = {}) => {
        const outcome = cleanText(payload.outcome);
        const nextStep = cleanText(payload.nextStep);
        const driftCause = cleanText(payload.driftCause);
        const notesSummary = cleanText(payload.notesSummary);
        const tangentFollowUp = cleanText(payload.tangentFollowUp);
        const completedAt = createIsoTimestamp();
        let shouldPlay = false;

        setAnchor(prev => {
            if (!prev.title) {
                return prev;
            }

            shouldPlay = true;
            return {
                ...prev,
                status: 'idle',
                isComplete: true,
                completedAnchorCount: prev.completedAnchorCount + 1,
                completionStreak: prev.completionStreak + 1,
                lastCompletedAt: completedAt,
                lastCloseout: {
                    outcome,
                    nextStep,
                    driftCause,
                    notesSummary,
                    tangentFollowUp,
                    completedAt,
                },
                sideTask: prev.sideTask?.status === 'active'
                    ? {
                        ...prev.sideTask,
                        status: 'done',
                        resolvedAt: completedAt,
                    }
                    : prev.sideTask,
                waitingContext: null,
                resumePrompt: null,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('anchor-completed', 'Anchor completed', {
                    outcome,
                    nextStep,
                    driftCause,
                })),
            };
        });

        setIsActive(false);
        if (shouldPlay) {
            playPeep(440, 0.2);
        }

        return shouldPlay;
    }, [playPeep]);

    const abandonAnchor = useCallback((payload = {}) => {
        const reason = cleanText(payload.reason);
        const abandonedAt = createIsoTimestamp();

        setAnchor(prev => {
            if (!prev.title) {
                return prev;
            }

            return {
                ...prev,
                status: 'idle',
                isComplete: false,
                completionStreak: 0,
                lastAbandonedAt: abandonedAt,
                waitingContext: null,
                resumePrompt: null,
                sideTask: prev.sideTask?.status === 'active'
                    ? {
                        ...prev.sideTask,
                        status: 'paused',
                        resolvedAt: abandonedAt,
                    }
                    : prev.sideTask,
                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('anchor-abandoned', 'Anchor abandoned', {
                    reason,
                })),
            };
        });
        setIsActive(false);
        playPeep(440, 0.2);
        return true;
    }, [playPeep]);

    const resetStream = useCallback(() => {
        setLedger(prev => {
            const streamId = prev.activeStreamId;
            const s = prev.streams[streamId];
            if (!s) return prev;
            return {
                ...prev,
                streams: {
                    ...prev.streams,
                    [streamId]: {
                        ...s,
                        currentLinkIndex: 0,
                        elapsed: 0,
                        isRunning: false,
                        links: [{ id: 'link_1', label: 'Link I', status: 'active' }],
                        history: []
                    }
                }
            };
        });
    }, []);

    const addStream = useCallback((name) => {
        const id = `stream_${Date.now()}`;
        setLedger(prev => ({
            ...prev,
            activeStreamId: id,
            streams: {
                ...prev.streams,
                [id]: {
                    id,
                    name,
                    currentLinkIndex: 0,
                    elapsed: 0,
                    isRunning: false,
                    links: [{ id: 'link_1', label: 'Link I', status: 'active' }],
                    history: []
                }
            }
        }));
    }, []);

    const switchStream = useCallback((streamId) => {
        setLedger(prev => ({ ...prev, activeStreamId: streamId }));
    }, []);

    const removeStream = useCallback((streamId) => {
        if (streamId === 'default') return;
        setLedger(prev => {
            const nextStreams = { ...prev.streams };
            delete nextStreams[streamId];
            const nextActiveId = prev.activeStreamId === streamId ? 'default' : prev.activeStreamId;
            return {
                ...prev,
                activeStreamId: nextActiveId,
                streams: nextStreams
            };
        });
    }, []);

    const toggleStream = useCallback((streamId) => {
        setLedger(prev => {
            const s = prev.streams[streamId];
            if (!s) return prev;
            return {
                ...prev,
                streams: {
                    ...prev.streams,
                    [streamId]: {
                        ...s,
                        isRunning: !s.isRunning
                    }
                }
            };
        });
    }, []);

    const renameStream = useCallback((streamId, newName) => {
        setLedger(prev => {
            const s = prev.streams[streamId];
            if (!s) return prev;
            return {
                ...prev,
                streams: {
                    ...prev.streams,
                    [streamId]: {
                        ...s,
                        name: newName
                    }
                }
            };
        });
    }, []);

    const endStream = useCallback((streamId, reviewNotes) => {
        setLedger(prev => {
            const s = prev.streams[streamId];
            if (!s) return prev;
            
            const nextStreams = {
                ...prev.streams,
                [streamId]: {
                    ...s,
                    isRunning: false,
                    isFinished: true,
                    reviewNotes: reviewNotes || '',
                    history: [...s.history, {
                        block: `End Stream`,
                        label: 'Stream Finished',
                        duration: s.elapsed,
                        comment: reviewNotes || 'No review notes',
                        timestamp: new Date().toISOString()
                    }].slice(-6)
                }
            };

            let nextActiveId = prev.activeStreamId;
            if (prev.activeStreamId === streamId) {
                const newId = `stream_${Date.now()}`;
                const baseName = `Stream ${Object.keys(nextStreams).length + 1}`;
                nextStreams[newId] = {
                    id: newId,
                    name: baseName,
                    currentLinkIndex: 0,
                    elapsed: 0,
                    isRunning: false,
                    links: [{ id: 'link_1', label: 'Link I', status: 'active' }],
                    history: []
                };
                nextActiveId = newId;
            }

            return {
                ...prev,
                activeStreamId: nextActiveId,
                streams: nextStreams
            };
        });
        playPeep(440, 0.2);
    }, [playPeep]);

    const updateLinkNote = useCallback((streamId, linkId, note) => {
        setLedger(prev => {
            const s = prev.streams[streamId];
            if (!s) return prev;
            return {
                ...prev,
                streams: {
                    ...prev.streams,
                    [streamId]: {
                        ...s,
                        links: s.links.map(l => l.id === linkId ? { ...l, note } : l)
                    }
                }
            };
        });
    }, []);

    const advanceLatencyBlock = useCallback((outcome = 'advance', comment = '') => {
        const streamId = ledger.activeStreamId;
        const currentStream = ledger.streams[streamId];
        if (!currentStream) return;

        const linkIndex = currentStream.currentLinkIndex;
        const stepDuration = currentStream.elapsed; // In a ledger, elapsed is often per link or per stream. Let's treat it as link-elapsed for this logic.

        const buildEntry = (label) => ({
            block: `Link ${linkIndex + 1}`,
            label,
            duration: stepDuration,
            comment: comment || '',
            timestamp: new Date().toISOString()
        });

        setLedger(prev => {
            const s = prev.streams[streamId];
            const nextLinks = [...s.links];

            if (outcome === 'failure') {
                return {
                    ...prev,
                    streams: {
                        ...prev.streams,
                        [streamId]: {
                            ...s,
                            currentLinkIndex: 0,
                            elapsed: 0,
                            isRunning: false,
                            history: [...s.history, buildEntry('Chain broken. Restarting.')].slice(-6)
                        }
                    }
                };
            }

            const isLast = linkIndex === s.links.length - 1;
            if (isLast) {
                // Add a new link dynamically
                const newId = `link_${s.links.length + 1}`;
                nextLinks[linkIndex] = { ...nextLinks[linkIndex], status: 'completed' };
                nextLinks.push({ id: newId, label: `Link ${s.links.length + 1}`, status: 'active' });
                return {
                    ...prev,
                    streams: {
                        ...prev.streams,
                        [streamId]: {
                            ...s,
                            currentLinkIndex: linkIndex + 1,
                            elapsed: 0, // Reset timer for new link
                            isRunning: false,
                            links: nextLinks,
                            history: [...s.history, buildEntry(`Link ${linkIndex + 1} finalized.`)].slice(-6)
                        }
                    }
                };
            } else {
                nextLinks[linkIndex] = { ...nextLinks[linkIndex], status: 'completed' };
                nextLinks[linkIndex + 1] = { ...nextLinks[linkIndex + 1], status: 'active' };
                return {
                    ...prev,
                    streams: {
                        ...prev.streams,
                        [streamId]: {
                            ...s,
                            currentLinkIndex: linkIndex + 1,
                            elapsed: 0,
                            isRunning: false,
                            links: nextLinks,
                            history: [...s.history, buildEntry(`Link ${linkIndex + 1} finalized.`)].slice(-6)
                        }
                    }
                };
            }
        });

        playPeep(880, 0.2);
    }, [ledger.activeStreamId, ledger.streams, playPeep]);

    useEffect(() => {
        if (previousModeRef.current === sessionMode) {
            return;
        }

        previousModeRef.current = sessionMode;
        clearInterval(timerRef.current);
        setIsActive(false);
        setPomodoroState('focus');
        setFocusCount(0);
        setTimeLeft(settings.timerDuration);
        resetLatencyWorkflow();
        resetAnchorWorkflow();
    }, [sessionMode, settings.timerDuration, resetLatencyWorkflow, resetAnchorWorkflow]);

    useEffect(() => {
        if (sessionMode === 'latencyBlocks' || sessionMode === 'anchor' || isActive) {
            return;
        }

        setTimeLeft(sessionMode === 'pomodoro' && pomodoroState === 'rest'
            ? settings.restDuration
            : settings.timerDuration);
    }, [sessionMode, isActive, pomodoroState, settings.restDuration, settings.timerDuration]);

    useEffect(() => {
        clearInterval(timerRef.current);

        if (sessionMode === 'anchor') {
            timerRef.current = setInterval(() => {
                setAnchor(prev => {
                    // Always tick sideTask if it's active, regardless of anchor status
                    let nextSideTask = prev.sideTask?.status === 'active'
                        ? { ...prev.sideTask, elapsedSeconds: prev.sideTask.elapsedSeconds + 1 }
                        : prev.sideTask;

                    const timedOut = nextSideTask?.status === 'active'
                        && nextSideTask.elapsedSeconds >= nextSideTask.timeCapSeconds;

                    if (timedOut) {
                        const timedOutAt = createIsoTimestamp();
                        nextSideTask = {
                            ...nextSideTask,
                            status: 'timedOut',
                            resolvedAt: timedOutAt,
                        };
                    }

                    if (prev.status === 'active') {
                        return {
                            ...prev,
                            elapsedSeconds: prev.elapsedSeconds + 1,
                            sideTask: timedOut ? nextSideTask : (prev.sideTask?.status === 'active' ? nextSideTask : prev.sideTask),
                            ...(timedOut ? {
                                history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('side-task-timedout', 'Side task timed out', {
                                    title: nextSideTask.title,
                                })),
                            } : {}),
                        };
                    }

                    if (prev.status !== 'waiting') {
                        return { ...prev, sideTask: nextSideTask };
                    }

                    // waiting branch
                    const nextWaitSeconds = prev.waitSeconds + 1;

                    if (timedOut) {
                        return {
                            ...prev,
                            status: 'paused',
                            waitSeconds: nextWaitSeconds,
                            sideTask: nextSideTask,
                            resumePrompt: createResumePrompt({
                                anchorId: prev.anchorId,
                                title: prev.title,
                                intent: prev.intent,
                                nextAction: prev.waitingContext?.resumeAction || prev.nextAction,
                                waitLabel: prev.waitingContext?.label || nextSideTask.title,
                                source: 'side-task-timeout',
                            }),
                            history: limitAnchorHistory(prev.history, createAnchorHistoryEntry('side-task-timedout', 'Side task timed out', {
                                title: nextSideTask.title,
                            })),
                        };
                    }

                    return {
                        ...prev,
                        waitSeconds: nextWaitSeconds,
                        sideTask: nextSideTask,
                    };
                });
            }, 1000);
            return () => clearInterval(timerRef.current);
        }

        if (sessionMode === 'latencyBlocks') {
            timerRef.current = setInterval(() => {
                const streams = Object.values(ledgerRef.current.streams);
                const anyRunning = streams.some(s => s.isRunning);
                
                if (anyRunning) {
                    setLedger(prev => {
                        const nextStreams = { ...prev.streams };
                        for (const id in nextStreams) {
                            if (nextStreams[id].isRunning) {
                                nextStreams[id] = { ...nextStreams[id], elapsed: nextStreams[id].elapsed + 1 };
                            }
                        }
                        return { ...prev, streams: nextStreams };
                    });
                    setLatencySessionTotal(prev => prev + 1);
                }
            }, 1000);
            return () => clearInterval(timerRef.current);
        }

        if (!isActive) {
            return () => clearInterval(timerRef.current);
        }

        if (timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
            return () => clearInterval(timerRef.current);
        }

        setIsActive(false);
        playAlarm();

        if (sessionMode === 'pomodoro') {
            transitionPomodoro(true);
        } else {
            setIsEnforced(true);
            if (window.electron) window.electron.triggerEnforce();
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, sessionMode, playAlarm, transitionPomodoro, setIsEnforced]);

    const adjustTimer = useCallback((amt) => {
        if (sessionMode === 'latencyBlocks' || sessionMode === 'anchor') {
            return;
        }

        const key = pomodoroState === 'focus' ? 'timerDuration' : 'restDuration';
        const nd = Math.max(60, settings[key] + amt);
        setSettings(prev => ({ ...prev, [key]: nd }));
        if (!isActive) setTimeLeft(nd);
    }, [sessionMode, pomodoroState, settings, setSettings, isActive]);

    const resetTimer = useCallback(() => {
        playPeep(440);
        setIsActive(false);
        if (sessionMode === 'anchor') {
            resetAnchorWorkflow();
            return;
        }
        if (sessionMode === 'latencyBlocks') {
            resetLatencyWorkflow();
            return;
        }

        setTimeLeft(pomodoroState === 'focus' ? settings.timerDuration : settings.restDuration);
    }, [sessionMode, pomodoroState, settings.timerDuration, settings.restDuration, playPeep, resetLatencyWorkflow, resetAnchorWorkflow]);

    const forceFinish = useCallback(() => {
        setIsActive(false);

        if (sessionMode === 'anchor') {
            completeAnchor();
            return;
        }

        if (sessionMode === 'pomodoro') {
            transitionPomodoro(true);
            return;
        }

        playPeep(880);

        if (sessionMode === 'deepWork') {
            setIsEnforced(true);
            if (window.electron) window.electron.triggerEnforce();
            return;
        }

        advanceLatencyBlock();
    }, [sessionMode, playPeep, transitionPomodoro, setIsEnforced, advanceLatencyBlock, completeAnchor]);

    return {
        timeLeft, setTimeLeft,
        isActive, setIsActive,
        pomodoroState, setPomodoroState,
        focusCount, setFocusCount,
        ledger, setLedger,
        anchor, setAnchor,
        latencySessionTotal,
        initializeAnchor,
        toggleAnchor,
        pauseAnchor,
        updateReturnAction,
        captureTangent,
        enterWaiting,
        startTangentAsTask,
        toggleSideTask,
        completeSideTask,
        resolveWaiting,
        resumeAnchor,
        dismissResumePrompt,
        completeAnchor,
        abandonAnchor,
        advanceLatencyBlock,
        resetLatencyWorkflow,
        resetAnchorWorkflow,
        resetStream,
        addStream,
        switchStream,
        removeStream,
        toggleStream,
        renameStream,
        endStream,
        updateLinkNote,
        adjustTimer, resetTimer, forceFinish
    };
};
