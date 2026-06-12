import React from 'react';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <div className="main-content-wrapper">
                <Header />
                <main className="app-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
