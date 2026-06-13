import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.ok) {
                onLogin();
            } else {
                setError(data.error || '로그인에 실패했습니다.');
            }
        } catch {
            setError('서버 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-mark" aria-hidden="true">BM</div>
                    <h1>BibleMate</h1>
                    <p className="login-verse">주의 말씀은 내 발에 등이요 내 길에 빛이니이다</p>
                    <p>나만의 서재로 들어가기</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        placeholder="암호를 입력하세요"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading || !password}>
                        {loading ? '확인 중...' : '들어가기'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
