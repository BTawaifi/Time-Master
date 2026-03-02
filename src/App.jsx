import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './context/SettingsContext';
import { useAudio } from './hooks/useAudio';
import { useTimer } from './hooks/useTimer';
import { THEMES } from './constants';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { CustomThemeModal } from './components/CustomThemeModal';
import { CustomToneModal } from './components/CustomToneModal';
import { ActiveTimerView } from './components/ActiveTimerView';
import { SessionReviewView } from './components/SessionReviewView';
import { ArchiveView } from './components/ArchiveView';
import { EnforcerOverlay } from './components/EnforcerOverlay';

function App() {
    const { settings, setSettings } = useSettings();
    const [isEnforced, setIsEnforced] = useState(false);
    const [showArchives, setShowArchives] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [showToneModal, setShowToneModal] = useState(null);
    const [archiveData, setArchiveData] = useState({});
    const [isMaximized, setIsMaximized] = useState(false);
    const [formData, setFormData] = useState({ activity: '', output: '', method: '', utility: 5, friction: '', uncertainty: 'stable', focusDepth: 5, energyLevel: 5, hypothesisValid: true, hypothesisNote: '', nextStep: '', quickWin: '', bet: '' });

    // Aggressive Protocol state
    const [enforcementLevel, setEnforcementLevel] = useState(0);
    const enforcementStartRef = useRef(null);

    const { playReminder, playAlarm, playPeep, reminderRef } = useAudio(settings);

    const {
        timeLeft, setTimeLeft,
        isActive, setIsActive,
        pomodoroState, setPomodoroState,
        focusCount, setFocusCount,
        adjustTimer, resetTimer, forceFinish
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
        const activeTheme = settings.themeId === 'custom' ? settings.customTheme : (THEMES.find(t => t.id === settings.themeId) || THEMES[0]);
        const root = document.documentElement;
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
    }, [settings.themeId, settings.customTheme]);

    useEffect(() => {
        if (window.electron) {
            window.electron.onMaximized((state) => setIsMaximized(state));
            window.electron.onEnforce(() => { setIsEnforced(true); setIsActive(false); });
        }
    }, [setIsActive]);

    // Enforcement level escalation — increments every 30s while enforced
    useEffect(() => {
        if (isEnforced) {
            enforcementStartRef.current = Date.now();
            setEnforcementLevel(1);
            if (window.electron) window.electron.setEclipseLevel(1);
            const interval = setInterval(() => {
                setEnforcementLevel(prev => {
                    const next = prev + 1;
                    if (window.electron) window.electron.setEclipseLevel(next);
                    return next;
                });
            }, 30000);
            return () => clearInterval(interval);
        } else {
            setEnforcementLevel(0);
            if (window.electron) window.electron.setEclipseLevel(0);
            enforcementStartRef.current = null;
        }
    }, [isEnforced]);

    // Aggressive Protocol: Sonic Escalation — plays escalating tones during enforcement
    useEffect(() => {
        if (!isEnforced || !settings.enforcement?.soundCrescendo || enforcementLevel < 2) return;
        const volume = Math.min(0.7, 0.05 + enforcementLevel * 0.06);
        const freq = Math.min(1400, 300 + enforcementLevel * 80);
        const dur = Math.min(1.0, 0.15 + enforcementLevel * 0.05);
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = enforcementLevel > 5 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); audioCtx.close(); };
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + dur);
        } catch (e) { }
    }, [enforcementLevel, isEnforced, settings.enforcement?.soundCrescendo]);



    const handleSystemMinimize = () => {
        if (settings.autoMinimize && window.electron) {
            window.electron.minimizeApp();
        }
    };

    useEffect(() => {
        if (isActive && !isEnforced) {
            handleSystemMinimize();
        }
    }, [isActive, isEnforced, settings.autoMinimize]);

    const buildLogData = useCallback((base, isSkipped = false) => {
        return { ...base };
    }, []);

    const handleAuthorization = (shouldPivot) => {
        if (!formData.activity || !formData.output || !formData.nextStep) return;
        if (window.electron) {
            const logData = buildLogData({ ...formData, pivot: shouldPivot });



            if (window.electron) window.electron.saveLog(logData, settings.logFilePath);
            setIsEnforced(false);
            if (window.electron) window.electron.cancelEnforce();
            const reset = { activity: '', output: '', method: '', utility: 5, friction: '', uncertainty: 'stable', focusDepth: 5, energyLevel: 5, hypothesisValid: true, hypothesisNote: '', nextStep: '', quickWin: '', unlocked: false };
            if (!shouldPivot) {
                setFormData(prev => ({ ...prev, ...reset }));
                setTimeLeft(settings.timerDuration);
                setIsActive(true);
                playPeep(880, 0.2);
            } else {
                setFormData(prev => ({ ...reset, bet: prev.bet }));
                setTimeLeft(settings.timerDuration);
                setIsActive(false);
                playPeep(440, 0.2);
                handleSystemMinimize();
            }
        }
    };

    const handleSkip = () => {
        playPeep(440, 0.3);



        setIsEnforced(false);
        if (window.electron) window.electron.cancelEnforce();
        const reset = { activity: '', output: '', method: '', utility: 5, friction: '', uncertainty: 'stable', focusDepth: 5, energyLevel: 5, hypothesisValid: true, hypothesisNote: '', nextStep: '', quickWin: '', unlocked: false };
        setFormData(prev => ({ ...prev, ...reset }));
        setTimeLeft(settings.timerDuration);
        setIsActive(false);
    };

    return (
        <div className="min-h-screen p-8 overflow-y-auto relative pt-14 text-main">
            {/* Aggressive Protocols: Sonic Escalation, Desktop Eclipse */}
            {isEnforced && (
                <EnforcerOverlay
                    level={enforcementLevel}
                    config={settings.enforcement || {}}
                />
            )}
            <Header
                setShowArchives={setShowArchives}
                setShowSettingsModal={setShowSettingsModal}
                isMaximized={isMaximized}
                settings={settings}
                setArchiveData={setArchiveData}
            />
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
            ) : !isEnforced ? (
                <ActiveTimerView
                    settings={settings}
                    setSettings={setSettings}
                    pomodoroState={pomodoroState}
                    setPomodoroState={setPomodoroState}
                    focusCount={focusCount}
                    setFocusCount={setFocusCount}
                    timeLeft={timeLeft}
                    setTimeLeft={setTimeLeft}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    formData={formData}
                    setFormData={setFormData}
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
                    handleAuthorization={handleAuthorization}
                    handleSkip={handleSkip}
                />
            )}
        </div>
    );
}

export default App;
