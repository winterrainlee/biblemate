/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Theme: 'light', 'dark', 'system'
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    // Font Size: base pixel size (default 16)
    const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 16);

    // Bible body font family: 'serif', 'gowun', 'sans'
    const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('bibleFontFamily') || localStorage.getItem('fontFamily') || 'serif');

    useEffect(() => {
        const root = window.document.documentElement;

        // Apply Theme
        const applyTheme = () => {
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme();

        // Listener for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') applyTheme();
        };
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => {
        // Apply Font Size & Bible body font family
        const root = window.document.documentElement;
        const bibleFontMap = {
            serif: 'var(--pk-font-serif)',
            gowun: 'var(--pk-font-gowun)',
            sans: 'var(--pk-font-sans)'
        };
        root.style.setProperty('--pk-font-size-base', `${fontSize}px`);
        root.style.setProperty('--pk-font-family', 'var(--pk-font-sans)');
        root.style.setProperty('--pk-font-body', bibleFontMap[fontFamily] || 'var(--pk-font-serif)');

        // Persist settings
        localStorage.setItem('theme', theme);
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('bibleFontFamily', fontFamily);
        localStorage.setItem('fontFamily', fontFamily);
    }, [theme, fontSize, fontFamily]);

    return (
        <ThemeContext.Provider value={{
            theme, setTheme,
            fontSize, setFontSize,
            fontFamily, setFontFamily
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
