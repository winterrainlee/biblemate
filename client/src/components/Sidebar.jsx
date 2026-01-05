
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, PenTool, Home, Search, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: '홈' },
        { path: '/bible', icon: BookOpen, label: '성경' },
        { path: '/search', icon: Search, label: '검색' },
        { path: '/notes', icon: PenTool, label: '노트' },
        { path: '/settings', icon: SettingsIcon, label: '설정' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo" onClick={onClose}>
                        <BookOpen className="logo-icon" size={28} />
                        <span className="logo-text">BibleMate</span>
                    </Link>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <item.icon size={22} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <p>© 2026 BibleMate</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
