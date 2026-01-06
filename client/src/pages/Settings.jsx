import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor, Type, Download, Upload, Eye, EyeOff, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../services/api';

const Settings = () => {
    const { theme, setTheme, fontSize, setFontSize } = useTheme();
    const [dashboardConfig, setDashboardConfig] = useState({ showReading: true, showNotes: true });
    const [statusMessage, setStatusMessage] = useState('');
    const [authInfo, setAuthInfo] = useState({ authRequired: false });

    // Load dashboard config from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('dashboardConfig');
        if (saved) {
            try {
                setDashboardConfig(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse dashboard config:', e);
            }
        }

        // Check auth status
        fetch('/api/auth/status', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setAuthInfo({ authRequired: data.authRequired }))
            .catch(() => { });
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Handle backup export
    const handleExport = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/backup/export');
            if (!response.ok) throw new Error('Export failed');

            const data = await response.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `biblemate_backup_${format(new Date(), 'yyyyMMdd')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatusMessage('✅ 파일이 저장되었습니다. 분실 방지를 위해 이메일이나 클라우드에 보관하는 것을 권장합니다.');
            setTimeout(() => setStatusMessage(''), 5000);
        } catch (error) {
            console.error('Export error:', error);
            setStatusMessage('❌ 백업 중 오류가 발생했습니다.');
            setTimeout(() => setStatusMessage(''), 5000);
        }
    };

    // Handle backup import
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const confirmed = window.confirm(
            '기존 데이터가 모두 삭제되고 새 데이터로 교체됩니다. 복구 전 현재 데이터를 백업하는 것을 권장합니다. 계속하시겠습니까?'
        );
        if (!confirmed) {
            event.target.value = ''; // Reset file input
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            const response = await fetch('http://localhost:3001/api/backup/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Import failed');

            setStatusMessage('✅ 데이터가 복구되었습니다. 페이지를 새로고침합니다...');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Import error:', error);
            setStatusMessage('❌ 복구 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
            setTimeout(() => setStatusMessage(''), 5000);
        }
        event.target.value = ''; // Reset file input
    };

    // Handle dashboard visibility toggle
    const handleDashboardToggle = (key) => {
        const newConfig = { ...dashboardConfig, [key]: !dashboardConfig[key] };

        // Prevent both from being disabled
        if (!newConfig.showReading && !newConfig.showNotes) {
            alert('최소 하나의 영역은 켜져 있어야 합니다.');
            return;
        }

        setDashboardConfig(newConfig);
        localStorage.setItem('dashboardConfig', JSON.stringify(newConfig));
    };

    return (
        <div className="page-settings container">
            <div className="settings-header" style={{ marginBottom: '2rem' }}>
                <h2>설정</h2>
                <p className="text-secondary">화면 스타일을 취향에 맞게 조정하세요.</p>
            </div>

            {/* Status Message */}
            {statusMessage && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: statusMessage.startsWith('✅') ? '#d4edda' : '#f8d7da',
                    color: statusMessage.startsWith('✅') ? '#155724' : '#721c24',
                    border: `1px solid ${statusMessage.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: 'var(--pk-radius-md)'
                }}>
                    {statusMessage}
                </div>
            )}

            <div className="settings-section" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--pk-color-bg)',
                border: '1px solid var(--pk-color-border)',
                borderRadius: 'var(--pk-radius-lg)'
            }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sun size={20} /> 테마 설정
                </h3>

                <div className="theme-options" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {[
                        { value: 'light', label: '라이트', icon: <Sun size={18} /> },
                        { value: 'dark', label: '다크', icon: <Moon size={18} /> },
                        { value: 'system', label: '시스템 설정', icon: <Monitor size={18} /> }
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`theme-btn ${theme === option.value ? 'active' : ''}`}
                            style={{
                                flex: 1,
                                minWidth: '100px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: `2px solid ${theme === option.value ? 'var(--pk-color-primary)' : 'var(--pk-color-border)'}`,
                                borderRadius: 'var(--pk-radius-md)',
                                backgroundColor: theme === option.value ? 'var(--pk-color-bg-secondary)' : 'transparent',
                                color: theme === option.value ? 'var(--pk-color-primary)' : 'var(--pk-color-text)',
                                cursor: 'pointer',
                                fontWeight: theme === option.value ? '600' : '400'
                            }}
                        >
                            {option.icon}
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="settings-section" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--pk-color-bg)',
                border: '1px solid var(--pk-color-border)',
                borderRadius: 'var(--pk-radius-lg)'
            }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Type size={20} /> 글자 크기
                </h3>

                <div className="font-control">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--pk-color-text-secondary)' }}>
                        <span style={{ fontSize: '0.8rem' }}>작게</span>
                        <span style={{ fontSize: '0.8rem' }}>크게</span>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="24"
                        step="1"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--pk-color-primary)' }}
                    />
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        현재 크기: <strong>{fontSize}px</strong>
                    </div>

                    <div className="preview-box" style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        border: '1px dashed var(--pk-color-border)',
                        borderRadius: 'var(--pk-radius-md)',
                        backgroundColor: 'var(--pk-color-bg-secondary)'
                    }}>
                        <p>미리보기 텍스트입니다. 글자 크기가 이렇게 보입니다.</p>
                        <p>The quick brown fox jumps over the lazy dog.</p>
                    </div>
                </div>
            </div>

            {/* Data Backup/Restore Section */}
            <div className="settings-section" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--pk-color-bg)',
                border: '1px solid var(--pk-color-border)',
                borderRadius: 'var(--pk-radius-lg)'
            }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={20} /> 데이터 백업 및 복구
                </h3>
                <p style={{ color: 'var(--pk-color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    노트, 하이라이트, 읽기 기록을 JSON 파일로 저장하거나 복구할 수 있습니다.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleExport}
                        style={{
                            flex: '1 1 200px',
                            padding: '0.75rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--pk-color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--pk-radius-md)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        <Download size={18} /> 데이터 내보내기
                    </button>

                    <label
                        style={{
                            flex: '1 1 200px',
                            padding: '0.75rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--pk-color-bg-secondary)',
                            color: 'var(--pk-color-text)',
                            border: '2px solid var(--pk-color-border)',
                            borderRadius: 'var(--pk-radius-md)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        <Upload size={18} /> 데이터 가져오기
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>

            {/* Dashboard Display Settings */}
            <div className="settings-section" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--pk-color-bg)',
                border: '1px solid var(--pk-color-border)',
                borderRadius: 'var(--pk-radius-lg)'
            }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Eye size={20} /> 화면 표시 설정
                </h3>
                <p style={{ color: 'var(--pk-color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    홈 화면에서 표시할 영역을 선택하세요. 읽기 또는 묵상 중 하나에만 집중할 수 있습니다.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: 'var(--pk-color-bg-secondary)',
                        borderRadius: 'var(--pk-radius-md)',
                        border: '1px solid var(--pk-color-border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {dashboardConfig.showReading ? <Eye size={18} /> : <EyeOff size={18} />}
                            <span style={{ fontWeight: '500' }}>말씀 영역</span>
                        </div>
                        <button
                            onClick={() => handleDashboardToggle('showReading')}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: dashboardConfig.showReading ? 'var(--pk-color-primary)' : 'var(--pk-color-bg)',
                                color: dashboardConfig.showReading ? 'white' : 'var(--pk-color-text)',
                                border: `2px solid ${dashboardConfig.showReading ? 'var(--pk-color-primary)' : 'var(--pk-color-border)'}`,
                                borderRadius: 'var(--pk-radius-sm)',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {dashboardConfig.showReading ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: 'var(--pk-color-bg-secondary)',
                        borderRadius: 'var(--pk-radius-md)',
                        border: '1px solid var(--pk-color-border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {dashboardConfig.showNotes ? <Eye size={18} /> : <EyeOff size={18} />}
                            <span style={{ fontWeight: '500' }}>묵상 영역</span>
                        </div>
                        <button
                            onClick={() => handleDashboardToggle('showNotes')}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: dashboardConfig.showNotes ? 'var(--pk-color-primary)' : 'var(--pk-color-bg)',
                                color: dashboardConfig.showNotes ? 'white' : 'var(--pk-color-text)',
                                border: `2px solid ${dashboardConfig.showNotes ? 'var(--pk-color-primary)' : 'var(--pk-color-border)'}`,
                                borderRadius: 'var(--pk-radius-sm)',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {dashboardConfig.showNotes ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-section" style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--pk-color-bg)',
                border: '1px solid var(--pk-color-border)',
                borderRadius: 'var(--pk-radius-lg)'
            }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>ℹ️</span> 정보 및 라이선스
                </h3>

                <div className="license-info" style={{ fontSize: '0.9rem', color: 'var(--pk-color-text-secondary)', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '0.5rem' }}><strong>BibleMate v1.1</strong></p>
                    <p style={{ marginBottom: '1rem' }}>개인 묵상과 성경 읽기를 돕기 위해 만든 웹 애플리케이션입니다.</p>

                    <h4 style={{ fontSize: '0.95rem', color: 'var(--pk-color-text)', marginBottom: '0.5rem' }}>성경 데이터 저작권</h4>
                    <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                        <li>
                            <strong>한국어: 『성경전서 개역한글판』</strong><br />
                            본 성경전서 개역한글판의 저작권은 재단법인 대한성서공회에 있으며, 본 앱은 해당 저작권을 준수하여 사용합니다. (본문 동일성 유지)
                        </li>
                        <li style={{ marginTop: '0.5rem' }}>
                            <strong>English: Open English Bible (OEB)</strong><br />
                            Public Domain (CC0), No copyright reserved.
                        </li>
                    </ul>

                    <p style={{ fontSize: '0.8rem', color: 'var(--pk-color-text-tertiary)' }}>
                        본 앱은 비영리 개인 학습/묵상용으로 제작되었습니다.
                    </p>

                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--pk-color-border)' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--pk-color-text)', marginBottom: '0.5rem' }}>📬 문의</h4>
                        <p style={{ fontSize: '0.85rem' }}>
                            버그 제보, 기능 제안:{' '}
                            <a href="mailto:winterrain.lee@icloud.com" style={{ color: 'var(--pk-color-primary)' }}>
                                winterrain.lee@icloud.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Logout Section - Only show when auth is enabled */}
            {authInfo.authRequired && (
                <div className="settings-section" style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--pk-color-bg)',
                    border: '1px solid var(--pk-color-border)',
                    borderRadius: 'var(--pk-radius-lg)'
                }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={20} /> 로그아웃
                    </h3>
                    <p style={{ color: 'var(--pk-color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        다른 사람이 이 기기를 사용할 수 있다면 로그아웃하는 것이 안전합니다.
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.75rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--pk-radius-md)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        <LogOut size={18} /> 로그아웃
                    </button>
                </div>
            )}
        </div>
    );
};

export default Settings;
