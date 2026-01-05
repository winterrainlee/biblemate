
import { useNavigate } from 'react-router-dom';
import { BarChart2, Moon, Sun, Minus, Plus, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

const Header = ({ onTrackerClick }) => {
    const navigate = useNavigate();
    const { theme, setTheme, fontSize, setFontSize } = useTheme();
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
                    <h1
                        className="header-title"
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                        title="메인으로 이동"
                    >
                        BibleMate
                    </h1>
                </div>

                <div className="header-actions">
                    <button
                        className="header-action-btn"
                        onClick={onTrackerClick}
                        title="읽기표"
                    >
                        <BarChart2 size={20} />
                        <span className="action-label">읽기표</span>
                    </button>

                    <button
                        className="header-action-btn"
                        onClick={toggleTheme}
                        title={isDarkMode ? "라이트 모드" : "다크 모드"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button
                        className="header-action-btn"
                        onClick={() => navigate('/settings')}
                        title="설정"
                    >
                        <Settings size={20} />
                    </button>

                    {/* Font Control Group */}
                    <div className="font-controls" style={{
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
                            style={{ border: 'none', padding: '4px' }}
                        >
                            <Minus size={16} />
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
                            style={{ border: 'none', padding: '4px' }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
