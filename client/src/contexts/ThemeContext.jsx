import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Theme: 'light', 'dark', 'system'
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    // Font Size: base pixel size (default 16)
    const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 16);

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
        // Apply Font Size
        const root = window.document.documentElement;
        root.style.setProperty('--pk-font-size-base', `${fontSize}px`);

        // Persist settings
        localStorage.setItem('theme', theme);
        localStorage.setItem('fontSize', fontSize);
    }, [theme, fontSize]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
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
