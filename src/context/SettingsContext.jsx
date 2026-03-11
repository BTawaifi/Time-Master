import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../constants';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem('time_master_settings');
            if (!stored) return DEFAULT_SETTINGS;
            const parsed = JSON.parse(stored);

            const reminders = { ...DEFAULT_SETTINGS.reminders };
            if (parsed.reminders) {
                Object.keys(reminders).forEach(key => {
                    if (parsed.reminders[key]) reminders[key] = { ...reminders[key], ...parsed.reminders[key] };
                });
            }

            const enforcement = { ...DEFAULT_SETTINGS.enforcement, ...(parsed.enforcement || {}) };

            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                customTheme: { ...DEFAULT_SETTINGS.customTheme, ...(parsed.customTheme || {}) },
                reminders,
                enforcement
            };
        } catch (e) {
            console.error("Failed to parse settings from localStorage:", e);
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        localStorage.setItem('time_master_settings', JSON.stringify(settings));
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
