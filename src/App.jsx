import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSettings } from './context/SettingsContext';
import { useAudio } from './hooks/useAudio';
import { useTimer } from './hooks/useTimer';
import { THEMES, LATENCY_BLOCKS } from './constants';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { CustomThemeModal } from './components/CustomThemeModal';
import { CustomToneModal } from './components/CustomToneModal';
import { ActiveTimerView } from './components/ActiveTimerView';
import { SessionReviewView } from './components/SessionReviewView';
import { ArchiveView } from './components/ArchiveView';
import { EnforcerOverlay } from './components/EnforcerOverlay';
import { QuickNotesPanel } from './components/QuickNotesPanel';

function App() {
    const { settings, setSettings } = useSettings();
    const [isEnforced, setIsEnforced] = useState(false);
    const [showArchives, setShowArchives] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [showToneModal, setShowToneModal] = useState(null);
    const [showQuickNotes, setShowQuickNotes] = useState(false);
    const [archiveData, setArchiveData] = useState({});
    const [isMaximized, setIsMaximized] = useState(false);
    const [showManualReview, setShowManualReview] = useState(false);
    const [formData, setFormData] = useState({ activity: '', output: '', method: '', utility: 5, friction: '', uncertainty: 'stable', focusDepth: 5, energyLevel: 5, hypothesisValid: true, hypothesisNote: '', nextStep: '', quickWin: '', bet: '', unlocked: false });

    // Aggressive Protocol state
    const [enforcementLevel, setEnforcementLevel] = useState(0);
    const enforcementStartRef = useRef(null);
    const escalationAudioRef = useRef(null);

    const { playReminder, playAlarm, playPeep } = useAudio(settings);
    const [isAlerting, setIsAlerting] = useState(false);
    const isReviewing = isEnforced || showManualReview;

    const triggerNotify = useCallback((scope) => {
        playReminder(scope);
        setIsAlerting(true);
        setTimeout(() => setIsAlerting(false), 2400); // 3 repeats of 0.8s pulse
    }, [playReminder]);

    const {
        timeLeft, setTimeLeft,
        isActive, setIsActive,
        pomodoroState,
        focusCount,
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
        adjustTimer,
        resetTimer,
        forceFinish
        } = useTimer(settings, setSettings, playPeep, playAlarm, setIsEnforced);

    // Sync enforcement config to Electron main process
    useEffect(() => {
        if (window.electron) {
            window.electron.setEnforcement(settings.enforcement);
        }
    }, [settings.enforcement]);

    useEffect(() => {
        if (window.electron) {
            window.electron.setStayOnTop(settings.stayOnTop);
        }
    }, [settings.stayOnTop]);

    useEffect(() => {
        if (window.electron) {
            const isIdle = !isActive && !isReviewing;
            const useKiosk = 
                (isEnforced && Array.isArray(settings.enforcement?.kioskMode) && settings.enforcement.kioskMode.includes('review')) || 
                (isActive && Array.isArray(settings.enforcement?.kioskMode) && settings.enforcement.kioskMode.includes('active')) ||
                (isIdle && Array.isArray(settings.enforcement?.kioskMode) && settings.enforcement.kioskMode.includes('idle'));
            window.electron.setKiosk(Boolean(useKiosk));
        }
    }, [isEnforced, isActive, isReviewing, settings.enforcement?.kioskMode]);

    useEffect(() => {
        const activeTheme = settings.themeId === 'custom' ? settings.customTheme : (THEMES.find(t => t.id === settings.themeId) || THEMES[0]);
        const root = document.documentElement;
        
        // Base mapping
        root.style.setProperty('--bg-color', activeTheme.bg);
        root.style.setProperty('--accent-color', activeTheme.accent);
        root.style.setProperty('--accent-contrast', activeTheme.contrast);
        root.style.setProperty('--card-bg', activeTheme.card);
        root.style.setProperty('--input-bg', activeTheme.input);
        root.style.setProperty('--input-text', activeTheme.inputText);
        root.style.setProperty('--input-placeholder', activeTheme.inputPlaceholder);
        root.style.setProperty('--text-main', activeTheme.text);
        root.style.setProperty('--text-data', activeTheme.dataText);
        root.style.setProperty('--text-dim', activeTheme.dim || 'rgba(255,255,255,0.4)');

        // Derived / App specific mapping
        const isLightTheme = activeTheme.id === 'paper' || activeTheme.id === 'nordic' || activeTheme.id === 'champagne';
        const tintBase = isLightTheme ? '0, 0, 0' : '255, 255, 255';
        
        root.style.setProperty('--border-color', `rgba(${tintBase}, 0.08)`);
        root.style.setProperty('--border-light', `rgba(${tintBase}, 0.15)`);
        root.style.setProperty('--primary-hover', activeTheme.accent + 'dd');
        root.style.setProperty('--primary-bg', activeTheme.accent + '20');
        root.style.setProperty('--surface-hover', `rgba(${tintBase}, 0.05)`);
        root.style.setProperty('--tint-low', `rgba(${tintBase}, 0.03)`);
        root.style.setProperty('--tint-medium', `rgba(${tintBase}, 0.08)`);
        
        // Mode specific constant overrides
        root.style.setProperty('--success-color', '#10B981');
        root.style.setProperty('--success-bg', 'rgba(16, 185, 129, 0.1)');
        root.style.setProperty('--danger-color', '#EF4444');
        root.style.setProperty('--danger-bg', 'rgba(239, 68, 68, 0.1)');
    }, [settings.themeId, settings.customTheme]);

    const handleEnforce = useCallback(() => {
        setIsEnforced(true);
        setIsActive(false);
    }, [setIsActive]);

    useEffect(() => {
        if (!window.electron) {
            return undefined;
        }

        const unsubscribeMaximized = window.electron.onMaximized((state) => setIsMaximized(state));
        const unsubscribeEnforce = window.electron.onEnforce(handleEnforce);

        return () => {
            unsubscribeMaximized?.();
            unsubscribeEnforce?.();
        };
    }, [handleEnforce]);

    const isLedgerRunning = useMemo(() => 
        settings.sessionMode === 'latencyBlocks' && Object.values(ledger?.streams || {}).some(s => s.isRunning),
    [settings.sessionMode, ledger?.streams]);
    const isCurrentlyActive = useMemo(() => isActive || isLedgerRunning, [isActive, isLedgerRunning]);

    useEffect(() => {
        const timers = [];
        const scheduleReminder = (scope, enabled) => {
            const config = settings.reminders?.[scope];
            if (!enabled || !config?.enabled || !Number.isFinite(config.interval) || config.interval <= 0) {
                return;
            }
            const timerId = window.setInterval(() => triggerNotify(scope), config.interval * 1000);
            timers.push(timerId);
        };

        const isIdle = !isCurrentlyActive && !isReviewing;
        const isSonicOn = Array.isArray(settings.enforcement?.soundCrescendo) && (
            (isEnforced && settings.enforcement.soundCrescendo.includes('review')) || 
            (isCurrentlyActive && settings.enforcement.soundCrescendo.includes('active')) ||
            (isIdle && settings.enforcement.soundCrescendo.includes('idle'))
        );
        scheduleReminder('idle', isIdle && !showArchives && !showSettingsModal && !showCustomModal && !showToneModal);
        scheduleReminder('focus', isCurrentlyActive && !isReviewing && !showArchives);
        scheduleReminder('review', isReviewing && !showArchives && !isSonicOn);

        return () => {
            timers.forEach(window.clearInterval);
        };
    }, [
        settings.reminders,
        settings.enforcement,
        playReminder,
        isActive,
        isCurrentlyActive,
        isEnforced,
        isReviewing,
        showArchives,
        showSettingsModal,
        showCustomModal,
        showToneModal,
    ]);

    // Enforcement level escalation — increments every 30s while in review
    // Enforcement level escalation — increments every 30s while in review, active, or idle mode if selected
    useEffect(() => {
        const isIdle = !isCurrentlyActive && !isReviewing;
        const isEclipseIdle = Array.isArray(settings.enforcement?.desktopEclipse) && settings.enforcement.desktopEclipse.includes('idle') && isIdle;
        const isEclipseActive = Array.isArray(settings.enforcement?.desktopEclipse) && settings.enforcement.desktopEclipse.includes('active') && isCurrentlyActive;
        const isEclipseReview = Array.isArray(settings.enforcement?.desktopEclipse) && settings.enforcement.desktopEclipse.includes('review') && isReviewing;
        
        if (isReviewing || isEclipseActive || isEclipseIdle) {
            enforcementStartRef.current = Date.now();
            setEnforcementLevel(1);
            if (window.electron) window.electron.setEclipseLevel(1);
            const escalationInterval = (settings.reminders?.review?.interval || 30) * 1000;
            const interval = setInterval(() => {
                setEnforcementLevel(prev => {
                    const next = prev + 1;
                    if (window.electron) window.electron.setEclipseLevel(next);
                    return next;
                });
            }, escalationInterval);
            return () => clearInterval(interval);
        } else {
            setEnforcementLevel(0);
            if (window.electron) window.electron.setEclipseLevel(0);
            enforcementStartRef.current = null;
        }
    }, [isReviewing, isCurrentlyActive, settings.enforcement?.desktopEclipse, settings.reminders?.review?.interval]);

    // Aggressive Protocol: Sonic Escalation — plays escalating tones during enforcement
    useEffect(() => {
        const isIdle = !isCurrentlyActive && !isReviewing;
        const isSonicIdle = Array.isArray(settings.enforcement?.soundCrescendo) && settings.enforcement.soundCrescendo.includes('idle') && isIdle;
        const isSonicActive = Array.isArray(settings.enforcement?.soundCrescendo) && settings.enforcement.soundCrescendo.includes('active') && isCurrentlyActive;
        const isSonicReview = Array.isArray(settings.enforcement?.soundCrescendo) && settings.enforcement.soundCrescendo.includes('review') && isEnforced;
        
        if ((!isSonicReview && !isSonicActive && !isSonicIdle) || enforcementLevel < 1) {
            return undefined;
        }

        const volume = Math.min(0.8, 0.03 + enforcementLevel * 0.07);
        const freq = Math.min(2500, 200 + enforcementLevel * 120);
        const dur = Math.min(0.8, 0.15 + enforcementLevel * 0.08);
        let audioCtx;
        let osc;
        let gain;
        let isDisposed = false;

        const cleanup = () => {
            if (isDisposed) {
                return;
            }

            isDisposed = true;
            escalationAudioRef.current = null;

            try {
                if (osc) {
                    osc.onended = null;
                }
            } catch (_error) { }
            try { osc?.disconnect(); } catch (_error) { }
            try { gain?.disconnect(); } catch (_error) { }
            try {
                if (audioCtx && audioCtx.state !== 'closed') {
                    audioCtx.close().catch(() => { });
                }
            } catch (_error) { }
        };

        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            escalationAudioRef.current = audioCtx;
            osc = audioCtx.createOscillator();
            gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (enforcementLevel < 4) {
                osc.type = 'sine';
            } else if (enforcementLevel < 8) {
                osc.type = 'triangle';
            } else if (enforcementLevel < 12) {
                osc.type = 'square';
            } else {
                osc.type = 'sawtooth';
            }

            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
            osc.onended = cleanup;
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + dur);
        } catch (e) {
            cleanup();
            console.error("Sonic escalation failed:", e);
        }

        return cleanup;
    }, [enforcementLevel, isEnforced, isCurrentlyActive, isReviewing, settings.enforcement?.soundCrescendo]);



    const handleSystemMinimize = useCallback(() => {
        if (settings.autoMinimize && window.electron) {
            window.electron.minimizeApp();
        }
    }, [settings.autoMinimize]);

    const prevActiveRef = useRef(false);

    useEffect(() => {
        if (isCurrentlyActive && !prevActiveRef.current && !isEnforced) {
            handleSystemMinimize();
        }
        prevActiveRef.current = isCurrentlyActive;
    }, [isCurrentlyActive, isEnforced, handleSystemMinimize]);

    const buildLogData = useCallback((base, isSkipped = false) => {
        return {
            ...base,
            skipped: isSkipped,
            sessionMode: settings.sessionMode,
            reviewSource: showManualReview ? 'manual' : 'enforced',
            sessionState: settings.sessionMode === 'pomodoro'
                ? { phase: pomodoroState, completedFocusSessions: focusCount }
                : settings.sessionMode === 'latencyBlocks'
                    ? {
                        ledger: ledger,
                        totalSessionSeconds: latencySessionTotal,
                    }
                    : { elapsedFocusSeconds: Math.max(0, settings.timerDuration - timeLeft) },
        };
    }, [
        settings.sessionMode,
        settings.timerDuration,
        pomodoroState,
        focusCount,
        ledger,
        latencySessionTotal,
        showManualReview,
        timeLeft,
    ]);

    const resetReviewForm = useCallback(() => {
        const reset = {
            activity: '',
            output: '',
            method: '',
            utility: 5,
            friction: '',
            uncertainty: 'stable',
            focusDepth: 5,
            energyLevel: 5,
            hypothesisValid: true,
            hypothesisNote: '',
            nextStep: '',
            quickWin: '',
            unlocked: false,
        };

        setFormData(prev => ({ ...prev, ...reset }));
    }, []);

    const openManualReview = useCallback(() => {
        setIsActive(false);
        setShowManualReview(true);
    }, [setIsActive]);

    const handleAuthorization = (shouldPivot) => {
        if (!formData.activity || !formData.output || !formData.nextStep) return;
        if (window.electron) {
            const logData = buildLogData({ ...formData, pivot: shouldPivot });



            if (window.electron) window.electron.saveLog(logData, settings.logFilePath);
            setIsEnforced(false);
            setShowManualReview(false);
            if (window.electron) window.electron.cancelEnforce();
            resetReviewForm();
            if (!shouldPivot) {
                if (settings.sessionMode === 'latencyBlocks') {
                    resetLatencyWorkflow();
                    setIsActive(false);
                    playPeep(880, 0.2);
                } else {
                    setTimeLeft(settings.timerDuration);
                    setIsActive(true);
                    playPeep(880, 0.2);
                }
            } else {
                if (settings.sessionMode === 'latencyBlocks') {
                    resetLatencyWorkflow();
                } else {
                    setTimeLeft(settings.timerDuration);
                }
                setIsActive(false);
                playPeep(440, 0.2);
                // We purposefully do NOT call handleSystemMinimize() here so the window stays visible
                // for the 'Save & Modify' pivot, preserving the user's focus on reconfiguration.
            }
        }
    };

    const handleGoBack = () => {
        playPeep(440, 0.2);
        setIsEnforced(false);
        setShowManualReview(false);
        if (window.electron) window.electron.cancelEnforce();
        
        // If timer is finished (timeLeft <= 0), ensure it stays inactive/idle
        if (timeLeft <= 0) {
            setIsActive(false);
            if (settings.sessionMode === 'latencyBlocks') {
                resetLatencyWorkflow();
            } else {
                setTimeLeft(settings.timerDuration);
            }
        }
    };

    const handleSkip = () => {
        playPeep(440, 0.3);

        setIsEnforced(false);
        setShowManualReview(false);
        if (window.electron) window.electron.cancelEnforce();
        resetReviewForm();
        if (settings.sessionMode === 'latencyBlocks') {
            resetLatencyWorkflow();
        } else {
            setTimeLeft(settings.timerDuration);
        }
        setIsActive(false);
    };
    const isTimerRunning = isCurrentlyActive;

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col font-sans selection:bg-app-primary selection:text-white bg-app-bg relative text-app-text">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-app-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-app-success/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 z-0"></div>
            {/* Aggressive Protocols: Sonic Escalation, Desktop Eclipse */}
            {isEnforced && (
                <EnforcerOverlay
                    level={enforcementLevel}
                    config={settings.enforcement || {}}
                />
            )}
            <Header
                showArchives={showArchives}
                isReviewing={isReviewing}
                isTimerRunning={isTimerRunning}
                setShowArchives={setShowArchives}
                setShowSettingsModal={setShowSettingsModal}
                setShowQuickNotes={setShowQuickNotes}
                showQuickNotes={showQuickNotes}
                isMaximized={isMaximized}
                settings={settings}
                setSettings={setSettings}
                setArchiveData={setArchiveData}
            />
            {showQuickNotes && <QuickNotesPanel 
                onClose={() => setShowQuickNotes(false)} 
                onSaveToArchive={async (noteText) => {
                    if (window.electron) {
                        const logData = {
                            timestamp: new Date().toLocaleString(),
                            sessionMode: 'quickNote',
                            activity: 'Quick Note',
                            output: noteText,
                            method: 'manual',
                            utility: 5,
                            friction: '',
                            uncertainty: 'stable',
                            focusDepth: 5,
                            energyLevel: 5,
                            hypothesisValid: true,
                            hypothesisNote: '',
                            nextStep: '',
                            quickWin: '',
                            bet: 'Quick Idea capture',
                            reviewSource: 'manual',
                            sessionState: {}
                        };
                        await window.electron.saveLog(logData, settings.logFilePath);
                        // Refresh archive data if visible or for next open
                        const logs = await window.electron.getLogs(settings.logFilePath);
                        if (logs) setArchiveData(logs);
                    }
                }} 
            />}
            {showSettingsModal && (
                <SettingsModal
                    settings={settings}
                    setSettings={setSettings}
                    setShowSettingsModal={setShowSettingsModal}
                    setShowCustomModal={setShowCustomModal}
                    setShowToneModal={setShowToneModal}
                />
            )}
            {showCustomModal && (
                <CustomThemeModal
                    settings={settings}
                    setSettings={setSettings}
                    setShowCustomModal={setShowCustomModal}
                />
            )}
            {showToneModal && (
                <CustomToneModal
                    settings={settings}
                    setSettings={setSettings}
                    showToneModal={showToneModal}
                    setShowToneModal={setShowToneModal}
                    playReminder={playReminder}
                />
            )}

            {showArchives ? (
                <ArchiveView
                    archiveData={archiveData}
                    setArchiveData={setArchiveData}
                    setShowArchives={setShowArchives}
                    settings={settings}
                />
            ) : !isReviewing ? (
                <ActiveTimerView
                    settings={settings}
                    setSettings={setSettings}
                    pomodoroState={pomodoroState}
                    focusCount={focusCount}
                    timeLeft={timeLeft}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    isAlerting={isAlerting}
                    formData={formData}
                    setFormData={setFormData}
                    ledger={ledger}
                    latencySessionTotal={latencySessionTotal}
                    advanceLatencyBlock={advanceLatencyBlock}
                    resetLatencyWorkflow={resetLatencyWorkflow}
                    addStream={addStream}
                    switchStream={switchStream}
                    removeStream={removeStream}
                    toggleStream={toggleStream}
                    renameStream={renameStream}
                    endStream={endStream}
                    updateLinkNote={updateLinkNote}
                    openManualReview={openManualReview}
                    adjustTimer={adjustTimer}
                    forceFinish={forceFinish}
                    resetTimer={resetTimer}
                    playPeep={playPeep}
                />
            ) : (
                <SessionReviewView
                    formData={formData}
                    setFormData={setFormData}
                    settings={settings}
                    isEnforcedReview={isEnforced}
                    handleAuthorization={handleAuthorization}
                    handleSkip={handleSkip}
                    handleGoBack={handleGoBack}
                />
            )}
        </div>
    );
}

export default App;
