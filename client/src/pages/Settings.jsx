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
        <div className="page-settings">
            <header className="settings-header">
                <button
                    onClick={() => navigate(-1)}
                    className="settings-back-btn"
                    title="뒤로가기"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2>설정</h2>
                    <p>읽기 환경과 데이터를 관리합니다.</p>
                </div>
            </header>

            {/* Logout Section - Only show when auth is enabled */}
            {authInfo.authRequired && (
                <section className="settings-section settings-session-section">
                    <div>
                        <h3 className="settings-section-title">
                            <LogOut size={18} /> 세션 관리
                        </h3>
                        <p className="settings-description">
                            로그아웃하여 현재 세션을 즉시 종료합니다.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="settings-action settings-action--danger"
                    >
                        <LogOut size={16} /> 로그아웃
                    </button>
                </section>
            )}

            {/* Highlight Labels Section (Moved to 3rd position) */}
            <section className="settings-section">
                <h3 className="settings-section-title">
                    <span className="settings-title-emoji">🎨</span> 형광펜 설정
                </h3>
                <p className="settings-description">
                    각 색상이 의미하는 속성 이름(예: 관찰, 적용, 질문 등)을 설정하세요. 최대 4글자까지 입력 가능합니다.
                </p>

                <div className="highlight-labels-grid">
                    {[
                        { key: 'yellow', color: 'var(--pk-highlight-yellow)', name: '노랑' },
                        { key: 'green', color: 'var(--pk-highlight-green)', name: '초록' },
                        { key: 'blue', color: 'var(--pk-highlight-blue)', name: '파랑' },
                        { key: 'red', color: 'var(--pk-highlight-red)', name: '빨강' }
                    ].map(item => (
                        <label key={item.key} className="highlight-label-card">
                            <span className="highlight-label-color" style={{ backgroundColor: item.color }} />
                            <input
                                type="text"
                                value={highlightLabels[item.key] || ''}
                                onChange={(e) => handleLabelChange(item.key, e.target.value.slice(0, 4))}
                                placeholder={item.name}
                                aria-label={`${item.name} 형광펜 이름`}
                                maxLength={4}
                            />
                        </label>
                    ))}
                </div>
            </section>

            {/* Display Settings removed as per request (Mobile calendar naturally hidden) */}

            <section className="settings-section">
                <h3 className="settings-section-title">
                    <Type size={20} /> 본문 글꼴 및 크기 설정
                </h3>

                {/* Font Family Selection */}
                <div className="font-family-control">
                    <p className="settings-description">
                        성경 본문을 읽기 편한 서체로 선택하세요. 버튼과 메뉴는 기존 고딕 UI를 유지합니다.
                    </p>
                    <div className="font-family-grid">
                        <button
                            onClick={() => handleFontChange('serif')}
                            className={`font-family-option${fontFamily === 'serif' ? ' active' : ''}`}
                            aria-pressed={fontFamily === 'serif'}
                        >
                            <strong className="font-sample font-sample--serif">명조</strong>
                            <span>기본, 차분한 본문용</span>
                        </button>
                        <button
                            onClick={() => handleFontChange('gowun')}
                            className={`font-family-option${fontFamily === 'gowun' ? ' active' : ''}`}
                            aria-pressed={fontFamily === 'gowun'}
                        >
                            <strong className="font-sample font-sample--gowun">고운바탕</strong>
                            <span>손글씨에 가까운 온기</span>
                        </button>
                        <button
                            onClick={() => handleFontChange('sans')}
                            className={`font-family-option${fontFamily === 'sans' ? ' active' : ''}`}
                            aria-pressed={fontFamily === 'sans'}
                        >
                            <strong className="font-sample font-sample--sans">고딕</strong>
                            <span>선명하고 익숙한 화면 글꼴</span>
                        </button>
                    </div>
                </div>

                <div className="font-size-control">
                    <div className="font-size-labels">
                        <span>작게</span>
                        <span>크게</span>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="24"
                        step="1"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="font-size-slider"
                        aria-label="본문 글자 크기"
                    />
                    <div className="font-size-current">
                        현재 크기: <strong>{fontSize}px</strong>
                    </div>

                    <div className="preview-box">
                        <p>성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니 (딤후 3:16)</p>
                        <p className="preview-box-secondary">All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness. (2 Tim 3:16)</p>
                    </div>
                </div>
            </section>

            {/* Data Backup/Restore Section */}
            <section className="settings-section">
                <h3 className="settings-section-title">
                    <Download size={20} /> 데이터 백업 및 복구
                </h3>
                <p className="settings-description">
                    노트, 하이라이트, 읽기 기록을 JSON 파일로 저장하거나 복구할 수 있습니다.
                </p>

                <div className="settings-data-actions">
                    <button
                        onClick={handleExport}
                        className="settings-action settings-action--primary"
                    >
                        <Download size={18} /> 데이터 내보내기
                    </button>

                    <label className="settings-action settings-action--secondary">
                        <Upload size={18} /> 데이터 가져오기
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="settings-file-input"
                        />
                    </label>
                </div>
            </section>

            <section className="settings-section settings-license-section">
                <h3 className="settings-section-title">
                    <span className="settings-title-icon">ℹ️</span> 정보 및 라이선스
                </h3>

                <div className="license-info">
                    <p className="license-version"><strong>BibleMate v3.0.0</strong></p>
                    <p>개인 묵상과 성경 읽기를 돕기 위해 만든 웹 애플리케이션입니다.</p>

                    <h4>성경 데이터 저작권</h4>
                    <ul>
                        <li>
                            <strong>한국어: 『성경전서 개역한글판』 (KRV)</strong><br />
                            본 성경전서 개역한글판의 저작권은 재단법인 대한성서공회에 있으며, 본 앱은 해당 저작권을 준수하여 사용합니다. (본문 동일성 유지)
                        </li>
                        <li>
                            <strong>English: World English Bible (WEB)</strong><br />
                            The World English Bible is in the Public Domain (No Copyright).
                            "World English Bible" is a Trademark of eBible.org.
                            You may copy and share it freely.
                        </li>
                        <li>
                            <strong>English: Bible in Basic English (BBE)</strong><br />
                            Public Domain. Translated by S. H. Hooke using a 1,000-word limited vocabulary.
                        </li>
                    </ul>

                    <p className="license-footnote">
                        본 앱은 비영리 개인 학습/묵상용으로 제작되었습니다.
                    </p>

                    <div className="settings-contact">
                        <h4>📬 문의</h4>
                        <p>
                            버그 제보, 기능 제안:{' '}
                            <a href="mailto:winterrain.lee@icloud.com">
                                winterrain.lee@icloud.com
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            <Modal
                isOpen={resultModal.isOpen}
                onClose={() => setResultModal(prev => ({ ...prev, isOpen: false }))}
                title={resultModal.title}
            >
                <div className="settings-result">
                    <div className={`settings-result-icon settings-result-icon--${resultModal.type}`}>
                        {resultModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                    </div>

                    <p className="settings-result-message">
                        {resultModal.message}
                    </p>

                    <button
                        onClick={() => {
                            setResultModal(prev => ({ ...prev, isOpen: false }));
                            if (resultModal.onConfirm) resultModal.onConfirm();
                        }}
                        className="settings-action settings-action--primary settings-result-confirm"
                    >
                        확인
                    </button>
                </div>
            </Modal>
        </div >
    );
};

export default Settings;
