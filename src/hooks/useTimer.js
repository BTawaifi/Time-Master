import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (settings, setSettings, playPeep, playAlarm, setIsEnforced) => {
    const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
    const [isActive, setIsActive] = useState(false);
    const [blockState, setBlockState] = useState('A');
    const [focusCount, setFocusCount] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!settings.latencyBlocks) {
            if (isActive && timeLeft > 0) {
                timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            } else if (timeLeft === 0 && isActive) {
                setIsActive(false);
                playAlarm();
                setIsEnforced(true);
                if (window.electron) window.electron.triggerEnforce();
            } else {
                clearInterval(timerRef.current);
            }
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, settings.latencyBlocks, playAlarm, setIsEnforced]);

    const advanceBlock = useCallback((success = true) => {
        playPeep(880);
        if (blockState === 'A') {
            setBlockState('B');
        } else if (blockState === 'B') {
            if (success) {
                setBlockState('C');
            } else {
                setBlockState('A');
            }
        } else if (blockState === 'C') {
            setFocusCount(prev => prev + 1);
            setBlockState('A');
        }
    }, [blockState, playPeep]);

    const adjustTimer = useCallback((amt) => {
        if (settings.latencyBlocks) return;
        const nd = Math.max(60, settings.timerDuration + amt);
        setSettings(prev => ({ ...prev, timerDuration: nd }));
        if (!isActive) setTimeLeft(nd);
    }, [settings, setSettings, isActive]);

    const resetTimer = useCallback(() => {
        playPeep(440);
        setIsActive(false);
        if (settings.latencyBlocks) {
            setBlockState('A');
        } else {
            setTimeLeft(settings.timerDuration);
        }
    }, [settings.latencyBlocks, settings.timerDuration, playPeep]);

    const forceFinish = useCallback(() => {
        playPeep(880);
        setIsActive(false);
        setIsEnforced(true);
        if (window.electron) window.electron.triggerEnforce();
    }, [playPeep, setIsEnforced]);

    return {
        timeLeft, setTimeLeft,
        isActive, setIsActive,
        blockState, setBlockState,
        focusCount, setFocusCount,
        adjustTimer, resetTimer, forceFinish, advanceBlock
    };
};
