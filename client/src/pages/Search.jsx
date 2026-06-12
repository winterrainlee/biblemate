import React, { useState } from 'react';
import { api } from '../services/api';
import { Search as SearchIcon, BookOpen } from 'lucide-react';

const Search = () => {
    const [query, setQuery] = useState('');
    const [version, setVersion] = useState('krv');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (query.trim().length < 2) {
            alert('검색어는 2글자 이상 입력해주세요.');
            return;
        }

        setLoading(true);
        setHasSearched(true);
        try {
            const data = await api.searchVerses(query, version);
            setResults(data);
        } catch (error) {
            console.error('Search failed', error);
            alert('검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-search container">
            <div className="search-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2>성경 검색</h2>
                <p className="text-secondary">찾고 싶은 말씀의 키워드를 입력하세요.</p>
            </div>

            <form onSubmit={handleSearch} className="search-form" style={{
                display: 'flex',
                gap: '0.5rem',
                maxWidth: '600px',
                margin: '0 auto 2rem auto'
            }}>
                <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    style={{
                        padding: '0.8rem',
                        border: '1px solid var(--pk-color-border)',
                        borderRadius: 'var(--pk-radius-md)',
                        background: 'var(--pk-color-bg)'
                    }}
                >
                    <option value="krv">개역한글</option>
                    <option value="web">WEB</option>
                </select>
                <div style={{ position: 'relative', flex: 1 }}>
                    <SearchIcon size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-color-text-secondary)' }} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="예: 사랑, 믿음, 소망"
                        style={{
                            width: '100%',
                            padding: '0.8rem 0.8rem 0.8rem 2.5rem',
                            border: '1px solid var(--pk-color-border)',
                            borderRadius: 'var(--pk-radius-md)',
                            fontSize: '1rem',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    style={{
                        padding: '0 1.5rem',
                        backgroundColor: 'var(--pk-color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--pk-radius-md)',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    검색
                </button>
            </form>

            <div className="search-results">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>검색 중...</div>
                ) : hasSearched && results.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--pk-color-text-secondary)' }}>
                        검색 결과가 없습니다.
                    </div>
                ) : (
                    <div className="results-list" style={{ display: 'grid', gap: '1rem' }}>
                        {results.map((verse, idx) => (
                            <div key={idx} className="result-item" style={{
                                padding: '1.5rem',
                                backgroundColor: 'var(--pk-color-bg)',
                                border: '1px solid var(--pk-color-border)',
                                borderRadius: 'var(--pk-radius-lg)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onClick={() => {
                                    // Navigate to Bible Viewer for this chapter
                                    // Note: Bible page handles state internally, might need context or query params to deep link.
                                    // Currently Bible.jsx reads default state. 
                                    // Let's assume user just wants to see the verse here. 
                                    // Or we can navigate? For now, just display.
                                    // Integrating deep linking is better: /bible?book=Gen&chapter=1
                                    // But our Bible route is /bible.
                                    // Let's stick to display for now.
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <BookOpen size={16} color="var(--pk-color-primary)" />
                                    <span style={{ fontWeight: '600' }}>{verse.book} {verse.chapter}:{verse.verse}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--pk-color-text-secondary)', marginLeft: 'auto' }}>
                                        {version.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ lineHeight: '1.6' }}>{verse.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
