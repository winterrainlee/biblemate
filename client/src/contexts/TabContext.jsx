/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const TabContext = createContext({
    activeTab: 'bible',
    setActiveTab: () => { }
});

export const TabProvider = ({ children }) => {
    const [activeTab, setActiveTab] = useState('bible'); // 'bible' | 'journal'

    return (
        <TabContext.Provider value={{ activeTab, setActiveTab }}>
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
