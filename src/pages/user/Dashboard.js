// src/pages/user/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserResults, getLeaderboard } from '../../services/db';
import { logoutUser } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

const navStyle = { textDecoration: 'none', color: 'inherit' };

export default function Dashboard() {
  const { userData, user } = useAuth();
  const [results, setResults] = useState([]);
  const [rank, setRank] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getUserResults(user.uid).then(setResults);
    getLeaderboard(100).then(lb => {
      const me = lb.find(r => r.userId === user.uid);
      setRank(me?.rank);
    });
  }, [user]);

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length)
    : 0;

  const passed = results.filter(r => r.passed).length;

  const topicPerf = {};
  results.forEach(r => {
    if (r.topic) {
      if (!topicPerf[r.topic]) topicPerf[r.topic] = { total: 0, count: 0 };
      topicPerf[r.topic].total += r.percentage || 0;
      topicPerf[r.topic].count++;
    }
  });
  const weakTopics = Object.entries(topicPerf)
    .map(([topic, { total, count }]) => ({ topic, avg: Math.round(total / count) }))
    .filter(t => t.avg < 70).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit', sans-serif", color: 'white' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 900
            }}>11</div>
            <span style={{ fontWeight: 800, fontSize: '18px' }}>TEST <span style={{ color: '#f59e0b' }}>11</span></span>
          </div>
          <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[
              { to: '/test', label: '📝 Test' },
              { to: '/leaderboard', label: '🏆 Ranks' },
              userData?.isPremium && { to: '/rooms', label: '👥 Rooms' },
              userData?.isPremium && { to: '/upload', label: '📄 Upload' },
            ].filter(Boolean).map(({ to, label }) => (
              <Link key={to} to={to} style={{
                ...navStyle, padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 500, background: 'rgba(255,255,255,0.05)',
                transition: 'background 0.2s'
              }}>{label}</Link>
            ))}
            {!userData?.isPremium && (
              <Link to="/premium" style={{
                ...navStyle, padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                color: '#0f172a'
              }}>⭐ Premium ₹11</Link>
            )}
            <button onClick={() => { logoutUser(); navigate('/auth'); }} style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
              background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontFamily: 'inherit'
            }}>Logout</button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>
            Welcome back, {userData?.name?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '14px' }}>
            Ready for today's TNPSC practice?
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Global Rank', value: rank ? `#${rank}` : 'N/A', icon: '🏆', color: '#f59e0b' },
            { label: 'Tests Taken', value: results.length, icon: '📝', color: '#3b82f6' },
            { label: 'Avg Score', value: `${avgScore}%`, icon: '📊', color: '#10b981' },
            { label: 'Passed', value: passed, icon: '✅', color: '#8b5cf6' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                borderRadius: '0 16px 0 80px'
              }} />
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Quick Actions */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/test" style={{
                ...navStyle, padding: '14px 18px', borderRadius: '12px', fontWeight: 600,
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}>📝 Start New Test</Link>
              <Link to="/leaderboard" style={{
                ...navStyle, padding: '14px 18px', borderRadius: '12px', fontWeight: 600,
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#f59e0b'
              }}>🏆 View Leaderboard</Link>
              {!userData?.isPremium && (
                <Link to="/premium" style={{
                  ...navStyle, padding: '14px 18px', borderRadius: '12px', fontWeight: 600,
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#0f172a'
                }}>⭐ Upgrade to Premium</Link>
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '16px' }}>Recent Tests</h3>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '20px 0', fontSize: '14px' }}>
                No tests taken yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.slice(0, 4).map(r => (
                  <div key={r.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px'
                  }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                      {r.topic || 'General Test'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>{r.percentage || 0}%</span>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                        background: r.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: r.passed ? '#10b981' : '#ef4444'
                      }}>{r.passed ? 'PASS' : 'FAIL'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        {weakTopics.length > 0 && (
          <div style={{
            marginTop: '20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '20px', padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '16px', color: '#fca5a5' }}>
              ⚠️ Weak Topics — Focus Here
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {weakTopics.map(({ topic, avg }) => (
                <div key={topic} style={{
                  padding: '8px 16px', borderRadius: '20px',
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)',
                  fontSize: '13px', fontWeight: 600
                }}>
                  {topic} <span style={{ color: '#ef4444' }}>{avg}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
