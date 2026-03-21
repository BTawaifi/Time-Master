import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (settings, setSettings, playPeep, playAlarm, setIsEnforced) => {
    const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
    const [isActive, setIsActive] = useState(false);
    const [pomodoroState, setPomodoroState] = useState('focus');
    const [focusCount, setFocusCount] = useState(0);
    const [ledger, setLedger] = useState({
        activeStreamId: 'default',
        streams: {
            'default': {
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
        setLedger({
            activeStreamId: 'default',
            streams: {
                'default': {
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
        setLatencySessionTotal(0);
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

            // Switch to a different non-finished stream if available
            let nextActiveId = prev.activeStreamId;
            if (prev.activeStreamId === streamId) {
                const availableStreams = Object.values(nextStreams).filter(st => !st.isFinished && st.id !== streamId);
                nextActiveId = availableStreams.length > 0 ? availableStreams[0].id : streamId;
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
    }, [sessionMode, settings.timerDuration, resetLatencyWorkflow]);

    useEffect(() => {
        if (sessionMode === 'latencyBlocks' || isActive) {
            return;
        }

        setTimeLeft(sessionMode === 'pomodoro' && pomodoroState === 'rest'
            ? settings.restDuration
            : settings.timerDuration);
    }, [sessionMode, isActive, pomodoroState, settings.restDuration, settings.timerDuration]);

    useEffect(() => {
        clearInterval(timerRef.current);

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
        if (sessionMode === 'latencyBlocks') {
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
        if (sessionMode === 'latencyBlocks') {
            resetLatencyWorkflow();
            return;
        }

        setTimeLeft(pomodoroState === 'focus' ? settings.timerDuration : settings.restDuration);
    }, [sessionMode, pomodoroState, settings.timerDuration, settings.restDuration, playPeep, resetLatencyWorkflow]);

    const forceFinish = useCallback(() => {
        setIsActive(false);

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
    }, [sessionMode, playPeep, transitionPomodoro, setIsEnforced, advanceLatencyBlock]);

    return {
        timeLeft, setTimeLeft,
        isActive, setIsActive,
        pomodoroState, setPomodoroState,
        focusCount, setFocusCount,
        ledger,
        latencySessionTotal,
        advanceLatencyBlock,
        resetLatencyWorkflow,
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
