/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { runNavigationGuard as executeNavigationGuard } from './navigationGuard';

const TabContext = createContext({
    activeTab: 'bible',
    setActiveTab: () => { },
    registerNavigationGuard: () => () => { },
    runWithNavigationGuard: (action) => {
        action();
        return true;
    }
});

export const TabProvider = ({ children }) => {
    const [activeTab, setActiveTabState] = useState('bible'); // 'bible' | 'journal'
    const navigationGuardRef = useRef(null);

    const registerNavigationGuard = useCallback((guard) => {
        navigationGuardRef.current = guard;
        return () => {
            if (navigationGuardRef.current === guard) navigationGuardRef.current = null;
        };
    }, []);

    const runWithNavigationGuard = useCallback((action) => (
        executeNavigationGuard(navigationGuardRef.current, action)
    ), []);

    const setActiveTab = useCallback((nextTab) => (
        runWithNavigationGuard(() => setActiveTabState(nextTab))
    ), [runWithNavigationGuard]);

    const value = useMemo(() => ({
        activeTab,
        setActiveTab,
        registerNavigationGuard,
        runWithNavigationGuard
    }), [activeTab, registerNavigationGuard, runWithNavigationGuard, setActiveTab]);

    return (
        <TabContext.Provider value={value}>
            {children}
        </TabContext.Provider>
    );
};

export const useTab = () => {
    const context = useContext(TabContext);
    if (!context) {
        throw new Error('useTab must be used within a TabProvider');
    }
    return context;
};

export default TabContext;
