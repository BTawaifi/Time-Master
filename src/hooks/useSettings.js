import { useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../constants';

export const useSettings = () => {
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem('time_master_settings');
            if (!stored) return DEFAULT_SETTINGS;
            const parsed = JSON.parse(stored);

            // Deep merge reminders to handle transitions from old settings
            const reminders = { ...DEFAULT_SETTINGS.reminders };
            if (parsed.reminders) {
                Object.keys(reminders).forEach(key => {
                    if (parsed.reminders[key]) reminders[key] = { ...reminders[key], ...parsed.reminders[key] };
                });
            } else if (parsed.reminderInterval) {
                reminders.idle.interval = parsed.reminderInterval;
                reminders.idle.mode = parsed.reminderMode || 'stochastic';
                reminders.idle.enabled = parsed.reminderScopes?.includes('idle');
                reminders.review.enabled = parsed.reminderScopes?.includes('review');
            }

            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                customTheme: { ...DEFAULT_SETTINGS.customTheme, ...(parsed.customTheme || {}) },
                reminders
            };
        } catch (e) {
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        localStorage.setItem('time_master_settings', JSON.stringify(settings));
    }, [settings]);

    return [settings, setSettings];
};
