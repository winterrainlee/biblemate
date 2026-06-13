
import { useNavigate } from 'react-router-dom';
import { BarChart2, Moon, Sun, Minus, Plus, Settings, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTab } from '../contexts/TabContext';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { theme, setTheme, fontSize, setFontSize } = useTheme();
    const { activeTab, setActiveTab } = useTab();
    const isDarkMode = theme === 'dark';
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // 10, 12, 14, 16, 18, 20
    const FONT_SIZES = [10, 12, 14, 16, 18, 20];

    const decreaseFont = () => {
        const currentIndex = FONT_SIZES.indexOf(fontSize);
        if (currentIndex > 0) {
            setFontSize(FONT_SIZES[currentIndex - 1]);
        }
    };

    const increaseFont = () => {
        const currentIndex = FONT_SIZES.indexOf(fontSize);
        if (currentIndex < FONT_SIZES.length - 1) {
            setFontSize(FONT_SIZES[currentIndex + 1]);
        }
    };

    return (
        <header className="main-header">
            <div className="header-container">
                <div className="header-left">
                    <div
                        className="header-logo"
                        onClick={() => {
                            window.location.href = '/';
                        }}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="메인으로 이동"
                    >
                        <BookOpen className="logo-icon" size={24} color="var(--pk-color-primary)" />
                        <h1 className="header-title">BibleMate</h1>
                    </div>

                    {/* V2.0: Tab Navigation in Header */}
                    <nav className="header-tabs">
                        <button
                            className={`header-tab ${activeTab === 'bible' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bible')}
                        >
                            <span className="full-label">📖 성경 읽기</span>
                            <span className="short-label">성경</span>
                        </button>
                        <button
                            className={`header-tab ${activeTab === 'journal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('journal')}
                        >
                            <span className="full-label">📝 묵상일지</span>
                            <span className="short-label">묵상</span>
                        </button>
                    </nav>
                </div>

                <div className="header-actions">
                    <button
                        className="header-action-btn mobile-only-chart-btn"
                        onClick={() => navigate('/chart')}
                        title="읽기표"
                        aria-label="읽기표"
                    >
                        <BarChart2 size={20} />
                        <span className="action-label">읽기표</span>
                    </button>

                    {/* Font Control Group - Hidden on mobile */}
                    <div className="font-controls desktop-only" style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--pk-color-border)',
                        borderRadius: 'var(--pk-radius-md)',
                        padding: '2px',
                        marginLeft: '0.5rem'
                    }}>
                        <button
                            className="header-action-btn"
                            onClick={decreaseFont}
                            disabled={fontSize <= FONT_SIZES[0]}
                            title="글자 작게"
                            aria-label="글자 작게"
                            style={{ border: 'none', padding: '4px' }}
                        >
                            <span className="font-icon-wrapper"><Minus size={16} /></span>
                        </button>

                        <span style={{
                            fontSize: '0.85rem',
                            minWidth: '24px',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: 'var(--pk-color-text)'
                        }}>
                            {fontSize}
                        </span>

                        <button
                            className="header-action-btn"
                            onClick={increaseFont}
                            disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
                            title="글자 크게"
                            aria-label="글자 크게"
                            style={{ border: 'none', padding: '4px' }}
                        >
                            <span className="font-icon-wrapper"><Plus size={16} /></span>
                        </button>
                    </div>

                    <button
                        className="header-action-btn"
                        onClick={toggleTheme}
                        title={isDarkMode ? "라이트 모드" : "다크 모드"}
                        aria-label={isDarkMode ? "라이트 모드" : "다크 모드"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button
                        className="header-action-btn"
                        onClick={() => navigate('/settings')}
                        title="설정"
                        aria-label="설정"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
