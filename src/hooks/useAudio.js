import { useRef, useCallback } from 'react';

export const useAudio = (settings) => {
    const audioCtxRef = useRef(null);
    const reminderRef = useRef(null);

    const getAudioCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    const playReminder = useCallback((scopeOrTone = 'idle') => {
        try {
            const audioCtx = getAudioCtx();
            let tone;
            let mode = 'presets';

            if (typeof scopeOrTone === 'string') {
                const config = settings.reminders[scopeOrTone];
                tone = config.tone;
                mode = config.mode;
            } else {
                tone = scopeOrTone;
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            if (mode === 'stochastic') {
                oscillator.type = ['sine', 'triangle', 'square'][Math.floor(Math.random() * 3)];
                oscillator.frequency.setValueAtTime(Math.floor(Math.random() * 500) + 300, audioCtx.currentTime);
            } else {
                oscillator.type = tone.type;
                oscillator.frequency.setValueAtTime(tone.freq, audioCtx.currentTime);
            }

            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(tone.volume, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + tone.duration);
            oscillator.onended = () => { oscillator.disconnect(); gainNode.disconnect(); };
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + tone.duration);
        } catch (e) {
            console.error("Audio failed:", e);
        }
    }, [settings.reminders, getAudioCtx]);

    const playAlarm = useCallback(() => {
        try {
            const audioCtx = getAudioCtx();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            oscillator.onended = () => { oscillator.disconnect(); gainNode.disconnect(); };
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 1);
        } catch (e) {
            console.error("Audio failed:", e);
        }
    }, [getAudioCtx]);

    const playPeep = useCallback((freq = 660, dur = 0.1) => {
        try {
            const audioCtx = getAudioCtx();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
            oscillator.onended = () => { oscillator.disconnect(); gainNode.disconnect(); };
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + dur);
        } catch (e) {
            console.error("Audio failed:", e);
        }
    }, [getAudioCtx]);

    return {
        playReminder,
        playAlarm,
        playPeep,
        reminderRef
    };
};
