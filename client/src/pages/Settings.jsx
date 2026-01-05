import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor, Type } from 'lucide-react';

const Settings = () => {
    const { theme, setTheme, fontSize, setFontSize } = useTheme();

    return (
        <div className="page-settings container">
            <div className="settings-header" style={{ marginBottom: '2rem' }}>
                <h2>설정</h2>
                <p className="text-secondary">화면 스타일을 취향에 맞게 조정하세요.</p>
            </div>

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
                    <p style={{ marginBottom: '0.5rem' }}><strong>BibleMate v1.0</strong></p>
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
        </div>
    );
};

export default Settings;
