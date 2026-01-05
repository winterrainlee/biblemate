import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import { api } from '../services/api';
import { BookOpen, Activity } from 'lucide-react';
import { format } from 'date-fns';

const Home = () => {
  const [readingLogs, setReadingLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const logs = await api.getReadingLogs();
      setReadingLogs(logs);
    } catch (error) {
      console.error('Failed to fetch reading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // 최근 읽은 기록 (최대 3개)
  const recentLogs = [...readingLogs]
    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
    .slice(0, 3);

  // 오늘의 말씀 (임시: 매일 바뀌는 로직 대신 현재는 고정 혹은 랜덤. 여기선 정적 텍스트 사용)
  // 추후 API로 랜덤 말씀 가져오기 구현 가능

  return (
    <div className="page-home container">
      <section className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h2>안녕하세요! 👋</h2>
        <p className="text-secondary">오늘도 말씀과 함께 하루를 시작해보세요.</p>
      </section>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* Left Column: Calendar */}
        <div className="dashboard-left">
          <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} />
            <h3>읽기 현황</h3>
          </div>
          <Calendar readingLogs={readingLogs} />
        </div>

        {/* Right Column: Today's Verse & Recent */}
        <div className="dashboard-right">
          <div className="card today-verse-card" style={{
            background: 'linear-gradient(135deg, var(--pk-color-primary), #1e40af)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--pk-radius-lg)',
            marginBottom: '2rem'
          }}>
            <h4 style={{ marginBottom: '1rem', opacity: 0.9 }}>오늘의 말씀</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem', lineHeight: '1.6' }}>
              "주의 말씀은 내 발에 등이요 내 길에 빛이니이다"
            </p>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>시편 119:105</span>
          </div>

          <div className="recent-logs">
            <h4 style={{ marginBottom: '1rem' }}>최근 읽은 구절</h4>
            {loading ? (
              <p>로딩 중...</p>
            ) : recentLogs.length > 0 ? (
              <div className="log-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentLogs.map((log, idx) => (
                  <div key={idx} className="log-item" style={{
                    padding: '1rem',
                    background: 'var(--pk-color-bg)',
                    border: '1px solid var(--pk-color-border)',
                    borderRadius: 'var(--pk-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '600' }}>{log.book} {log.chapter}장</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--pk-color-text-secondary)' }}>
                      {format(new Date(log.date), 'M월 d일')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary">아직 읽은 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
