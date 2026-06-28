import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Type, Download, Upload, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../services/api';
import Modal from '../components/Modal';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const { fontSize, setFontSize, fontFamily, setFontFamily } = useTheme();
    // Highlight Labels State
    const [highlightLabels, setHighlightLabels] = useState(() => {
        try {
            const saved = localStorage.getItem('highlightLabels_v2'); // New key for v2
            return saved ? JSON.parse(saved) : {
                'yellow': '1',
                'green': '2',
                'blue': '3',
                'red': '4'
            };
        } catch {
            return {
                'yellow': '1',
                'green': '2',
                'blue': '3',
                'red': '4'
            };
        }
    });

    const handleLabelChange = async (key, value) => {
        const newLabels = { ...highlightLabels, [key]: value };
        setHighlightLabels(newLabels);
        localStorage.setItem('highlightLabels_v2', JSON.stringify(newLabels));
        // Dispatch custom event for immediate sync
        window.dispatchEvent(new Event('highlightLabelsUpdated'));

        // Save to server
        try {
            await api.saveSetting('highlightLabels_v2', newLabels);
        } catch (err) {
            console.error('Failed to save label to server', err);
        }
    };
    const handleFontChange = async (value) => {
        setFontFamily(value);
        localStorage.setItem('bibleFontFamily', value);
        localStorage.setItem('fontFamily', value);
        try {
            await api.saveSetting('fontFamily', value);
        } catch (err) {
            console.error('Failed to save font preference to server', err);
        }
    };

    const [resultModal, setResultModal] = useState({
        isOpen: false,
        type: 'success', // 'success' | 'error'
        title: '',
        message: '',
        onConfirm: null // Optional callback for confirm button
    });
    const [authInfo, setAuthInfo] = useState({ authRequired: false });

    // Check auth status and load settings on mount
    useEffect(() => {
        // 1. Check auth
        fetch('/api/auth/status', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setAuthInfo({ authRequired: data.authRequired }))
            .catch(() => { });

        // 2. Load settings from server
        api.getSettings()
            .then(settings => {
                if (settings) {
                    if (settings.highlightLabels_v2) {
                        const serverLabels = settings.highlightLabels_v2;
                        setHighlightLabels(serverLabels);
                        localStorage.setItem('highlightLabels_v2', JSON.stringify(serverLabels));
                        window.dispatchEvent(new Event('highlightLabelsUpdated'));
                    }
                    if (settings.fontFamily) {
                        setFontFamily(settings.fontFamily);
                        localStorage.setItem('bibleFontFamily', settings.fontFamily);
                        localStorage.setItem('fontFamily', settings.fontFamily);
                    }
                }
            })
            .catch(err => console.error('Failed to load settings from server', err));
    }, [setFontFamily]);

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
            const response = await fetch('/api/backup/export', {
                credentials: 'include'
            });
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

            setResultModal({
                isOpen: true,
                type: 'success',
                title: '백업 완료',
                message: '파일이 저장되었습니다.\n분실 방지를 위해 이메일이나 클라우드에 보관하는 것을 권장합니다.'
            });
        } catch (error) {
            console.error('Export error:', error);
            setResultModal({
                isOpen: true,
                type: 'error',
                title: '백업 실패',
                message: '백업 중 오류가 발생했습니다. 로그인이 필요할 수 있습니다.'
            });
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
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                setResultModal({
                    isOpen: true,
                    type: 'error',
                    title: '파일 읽기 오류',
                    message: 'JSON 형식이 올바르지 않습니다.\n올바른 백업 파일인지 확인해주세요.'
                });
                event.target.value = '';
                return;
            }

            const response = await fetch('/api/backup/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                // Handle specific error codes
                const errorMessages = {
                    'INVALID_FORMAT': '백업 파일 형식이 올바르지 않습니다.',
                    'UNSUPPORTED_SCHEMA': '이 백업 파일은 최신 버전의 앱에서 생성되었습니다. 앱을 업데이트해주세요.',
                    'INVALID_SCHEMA': `백업 데이터에 문제가 있습니다:\n${result.message || ''}`,
                    'IMPORT_FAILED': '데이터베이스 오류가 발생했습니다. 다시 시도해주세요.'
                };
                const msg = errorMessages[result.error_code] || `복구 실패: ${result.message || '알 수 없는 오류'}`;

                setResultModal({
                    isOpen: true,
                    type: 'error',
                    title: '복구 실패',
                    message: msg
                });
                event.target.value = '';
                return;
            }

            setResultModal({
                isOpen: true,
                type: 'success',
                title: '복구 완료',
                message: '데이터가 성공적으로 복구되었습니다.\n확인을 누르면 페이지가 새로고침됩니다.',
                onConfirm: () => window.location.reload()
            });
        } catch (error) {
            console.error('Import error:', error);
            setResultModal({
                isOpen: true,
                type: 'error',
                title: '오류 발생',
                message: '복구 중 오류가 발생했습니다. 로그인이 필요할 수 있습니다.'
            });
        }
        event.target.value = ''; // Reset file input
    };

    return (
        <div className="page-settings container">
            {/* v1.4.1: BibleChartPage 스타일 헤더 */}
            <div className="settings-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--pk-color-border)'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--pk-color-text)'
                    }}
                    title="뒤로가기"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0 }}>설정</h2>
            </div>

            {/* Logout Section - Only show when auth is enabled */}
            {authInfo.authRequired && (
                <div className="settings-section" style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--pk-color-bg)',
                    border: '1px solid var(--pk-color-border)',
                    borderRadius: 'var(--pk-radius-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                            <LogOut size={18} /> 세션 관리
                        </h3>
                        <p style={{ color: 'var(--pk-color-text-secondary)', fontSize: '0.85rem' }}>
                            로그아웃하여 현재 세션을 즉시 종료합니다.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.6rem 1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--pk-color-danger)',
                            color: 'var(--pk-color-primary-contrast)',
                            border: 'none',
                            borderRadius: 'var(--pk-radius-md)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={16} /> 로그아웃
                    </button>
                </div>
            )}

            {/* Highlight Labels Section (Moved to 3rd position) */}
            <div className="settings-section" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--pk-color-bg)',
                border: '1px solid var(--pk-color-border)',
                borderRadius: 'var(--pk-radius-lg)'
            }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', display: 'flex' }}>🎨</span> 형광펜 설정
                </h3>
                <p style={{ color: 'var(--pk-color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    각 색상이 의미하는 속성 이름(예: 관찰, 적용, 질문 등)을 설정하세요. 최대 4글자까지 입력 가능합니다.
                </p>

                <div className="highlight-labels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    {[
                        { key: 'yellow', color: 'var(--pk-highlight-yellow)', name: '노랑' },
                        { key: 'green', color: 'var(--pk-highlight-green)', name: '초록' },
                        { key: 'blue', color: 'var(--pk-highlight-blue)', name: '파랑' },
                        { key: 'red', color: 'var(--pk-highlight-red)', name: '빨강' }
                    ].map(item => (
                        <div key={item.key} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: 'var(--pk-color-bg-secondary)',
                            borderRadius: 'var(--pk-radius-md)',
                            border: '1px solid var(--pk-color-border)',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: item.color,
                                border: '1px solid rgba(0,0,0,0.1)'
                            }} />
                            <input
                                type="text"
                                value={highlightLabels[item.key] || ''}
                                onChange={(e) => handleLabelChange(item.key, e.target.value.slice(0, 4))}
                                placeholder={item.name}
                                style={{
                                    width: '100%',
                                    padding: '0.4rem',
                                    textAlign: 'center',
                                    border: '1px solid var(--pk-color-border)',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    backgroundColor: 'var(--pk-color-bg)',
                                    color: 'var(--pk-color-text)'
                                }}
                                maxLength={4}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Display Settings removed as per request (Mobile calendar naturally hidden) */}

            <div className="settings-section" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--pk-color-bg)',
                border: '1px solid var(--pk-color-border)',
                borderRadius: 'var(--pk-radius-lg)'
            }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Type size={20} /> 본문 글꼴 및 크기 설정
                </h3>

                {/* Font Family Selection */}
                <div className="font-family-control" style={{ marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--pk-color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        성경 본문을 읽기 편한 서체로 선택하세요. 버튼과 메뉴는 기존 고딕 UI를 유지합니다.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                        <button
                            onClick={() => handleFontChange('serif')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: 'var(--pk-radius-md)',
                                border: fontFamily === 'serif' ? '2px solid var(--pk-color-primary)' : '1px solid var(--pk-color-border)',
                                backgroundColor: fontFamily === 'serif' ? 'var(--pk-color-bg-elevated)' : 'var(--pk-color-bg)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', fontFamily: 'var(--pk-font-serif)' }}>명조</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--pk-color-text-secondary)' }}>기본, 차분한 본문용</div>
                        </button>
                        <button
                            onClick={() => handleFontChange('gowun')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: 'var(--pk-radius-md)',
                                border: fontFamily === 'gowun' ? '2px solid var(--pk-color-primary)' : '1px solid var(--pk-color-border)',
                                backgroundColor: fontFamily === 'gowun' ? 'var(--pk-color-bg-elevated)' : 'var(--pk-color-bg)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', fontFamily: 'var(--pk-font-gowun)' }}>고운바탕</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--pk-color-text-secondary)' }}>손글씨에 가까운 온기</div>
                        </button>
                        <button
                            onClick={() => handleFontChange('sans')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: 'var(--pk-radius-md)',
                                border: fontFamily === 'sans' ? '2px solid var(--pk-color-primary)' : '1px solid var(--pk-color-border)',
                                backgroundColor: fontFamily === 'sans' ? 'var(--pk-color-bg-elevated)' : 'var(--pk-color-bg)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', fontFamily: 'var(--pk-font-sans)' }}>고딕</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--pk-color-text-secondary)' }}>선명하고 익숙한 화면 글꼴</div>
                        </button>
                    </div>
                </div>

                <div className="font-size-control">
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
                        padding: '1.5rem',
                        border: '1px dashed var(--pk-color-border)',
                        borderRadius: 'var(--pk-radius-md)',
                        backgroundColor: 'var(--pk-color-bg-elevated)',
                        fontFamily: 'var(--pk-font-body)',
                        lineHeight: 1.9
                    }}>
                        <p style={{ marginBottom: '0.5rem' }}>성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니 (딤후 3:16)</p>
                        <p style={{ fontSize: '0.85em', opacity: 0.8 }}>All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness. (2 Tim 3:16)</p>
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
                            color: 'var(--pk-color-primary-contrast)',
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
                    <p style={{ marginBottom: '0.5rem' }}><strong>BibleMate v2.3.2</strong></p>
                    <p style={{ marginBottom: '1rem' }}>개인 묵상과 성경 읽기를 돕기 위해 만든 웹 애플리케이션입니다.</p>

                    <h4 style={{ fontSize: '0.95rem', color: 'var(--pk-color-text)', marginBottom: '0.5rem' }}>성경 데이터 저작권</h4>
                    <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                        <li>
                            <strong>한국어: 『성경전서 개역한글판』 (KRV)</strong><br />
                            본 성경전서 개역한글판의 저작권은 재단법인 대한성서공회에 있으며, 본 앱은 해당 저작권을 준수하여 사용합니다. (본문 동일성 유지)
                        </li>
                        <li style={{ marginTop: '0.5rem' }}>
                            <strong>English: World English Bible (WEB)</strong><br />
                            The World English Bible is in the Public Domain (No Copyright).
                            "World English Bible" is a Trademark of eBible.org.
                            You may copy and share it freely.
                        </li>
                        <li style={{ marginTop: '0.5rem' }}>
                            <strong>English: Bible in Basic English (BBE)</strong><br />
                            Public Domain. Translated by S. H. Hooke using a 1,000-word limited vocabulary.
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

            <Modal
                isOpen={resultModal.isOpen}
                onClose={() => setResultModal(prev => ({ ...prev, isOpen: false }))}
                title={resultModal.title}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: resultModal.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: resultModal.type === 'success' ? 'var(--pk-color-success)' : 'var(--pk-color-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {resultModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                    </div>

                    <p style={{
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        color: 'var(--pk-color-text)',
                        whiteSpace: 'pre-line',
                        lineHeight: '1.6'
                    }}>
                        {resultModal.message}
                    </p>

                    <button
                        onClick={() => {
                            setResultModal(prev => ({ ...prev, isOpen: false }));
                            if (resultModal.onConfirm) resultModal.onConfirm();
                        }}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: 'var(--pk-color-primary)',
                            color: 'var(--pk-color-primary-contrast)',
                            border: 'none',
                            borderRadius: 'var(--pk-radius-md)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            minWidth: '120px'
                        }}
                    >
                        확인
                    </button>
                </div>
            </Modal>
        </div >
    );
};

export default Settings;
