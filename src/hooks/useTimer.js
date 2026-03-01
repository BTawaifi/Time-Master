import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (settings, setSettings, playPeep, playAlarm, setIsEnforced) => {
    const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
    const [isActive, setIsActive] = useState(false);
    const [pomodoroState, setPomodoroState] = useState('focus');
    const [focusCount, setFocusCount] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            playAlarm();
            if (settings.pomodoroOnly) {
                if (pomodoroState === 'focus') {
                    setFocusCount(prev => prev + 1);
                    setPomodoroState('rest');
                    setTimeLeft(settings.restDuration);
                    playPeep(440, 0.5);
                    setTimeout(() => setIsActive(true), 100);
                } else {
                    setPomodoroState('focus');
                    setTimeLeft(settings.timerDuration);
                    playPeep(880, 0.5);
                    setTimeout(() => setIsActive(true), 100);
                }
            } else {
                setIsEnforced(true);
                if (window.electron) window.electron.triggerEnforce();
            }
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, settings.pomodoroOnly, pomodoroState, playAlarm, playPeep, settings.restDuration, settings.timerDuration, setIsEnforced]);

    const adjustTimer = useCallback((amt) => {
        const key = pomodoroState === 'focus' ? 'timerDuration' : 'restDuration';
        const nd = Math.max(60, settings[key] + amt);
        setSettings(prev => ({ ...prev, [key]: nd }));
        if (!isActive) setTimeLeft(nd);
    }, [pomodoroState, settings, setSettings, isActive]);

    const resetTimer = useCallback(() => {
        playPeep(440);
        setIsActive(false);
        setTimeLeft(pomodoroState === 'focus' ? settings.timerDuration : settings.restDuration);
    }, [pomodoroState, settings.timerDuration, settings.restDuration, playPeep]);

    const forceFinish = useCallback(() => {
        playPeep(880);
        setIsActive(false);
        if (settings.pomodoroOnly) {
            if (pomodoroState === 'focus') {
                setFocusCount(prev => prev + 1);
                setPomodoroState('rest');
                setTimeLeft(settings.restDuration);
            } else {
                setPomodoroState('focus');
                setTimeLeft(settings.timerDuration);
            }
            setTimeout(() => setIsActive(true), 100);
        } else {
            setIsEnforced(true);
            if (window.electron) window.electron.triggerEnforce();
        }
    }, [playPeep, settings.pomodoroOnly, pomodoroState, settings.restDuration, settings.timerDuration, setIsEnforced]);

    return {
        timeLeft, setTimeLeft,
        isActive, setIsActive,
        pomodoroState, setPomodoroState,
        focusCount, setFocusCount,
        adjustTimer, resetTimer, forceFinish
    };
};
