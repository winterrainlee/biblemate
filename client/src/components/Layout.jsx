import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Modal from './Modal';
import TrackerModal from './TrackerModal';
import './Layout.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isTrackerOpen, setIsTrackerOpen] = useState(false);

    return (
        <div className="layout-container">
            <div className="main-content-wrapper">
                <Header
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onTrackerClick={() => setIsTrackerOpen(true)}
                />
                <main className="app-main">
                    {children}
                </main>
            </div>

            <Modal
                isOpen={isTrackerOpen}
                onClose={() => setIsTrackerOpen(false)}
                title="성경 읽기표"
            >
                <TrackerModal />
            </Modal>
        </div>
    );
};

export default Layout;

