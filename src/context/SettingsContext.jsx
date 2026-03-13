import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../constants';
import { THEMES } from '../constants';
import { normalizeSettings } from '../settingsValidation.mjs';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem('time_master_settings');
            if (!stored) return DEFAULT_SETTINGS;
            const parsed = JSON.parse(stored);
            return normalizeSettings(
                parsed,
                DEFAULT_SETTINGS,
                THEMES.map(theme => theme.id),
            );
        } catch (e) {
            console.error("Failed to parse settings from localStorage:", e);
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('time_master_settings', JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to persist settings to localStorage:', e);
        }
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
