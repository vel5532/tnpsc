// src/pages/user/Leaderboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard, getAllUsers } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeaderboard(50), getAllUsers()]).then(([lb, allUsers]) => {
      const userMap = {};
      allUsers.forEach(u => { userMap[u.id] = u; });
      setUsers(userMap);
      setEntries(lb);
      setLoading(false);
    });
  }, []);

  const myRank = entries.findIndex(e => e.userId === user?.uid) + 1;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit',sans-serif", color: 'white', padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px' }}>←</Link>
          <div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>🏆 Leaderboard</h2>
            <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Global Rankings</p>
          </div>
          {myRank > 0 && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>#{myRank}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Your Rank</div>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: '28px', padding: '20px' }}>
            {[entries[1], entries[0], entries[2]].map((e, podiumIdx) => {
              const realIdx = [1, 0, 2][podiumIdx];
              const heights = ['100px', '130px', '80px'];
              const colors = ['rgba(156,163,175,0.3)', 'rgba(245,158,11,0.3)', 'rgba(180,120,60,0.3)'];
              return (
                <div key={e.userId} style={{
                  flex: 1, background: colors[podiumIdx], borderRadius: '16px 16px 0 0',
                  height: heights[podiumIdx], display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}>
                  <div style={{ fontSize: '24px' }}>{medals[realIdx]}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>
                    {users[e.userId]?.name?.split(' ')[0] || 'User'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>{e.totalScore}</div>
                </div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
            <p>No rankings yet. Take a test to appear here!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map((entry, i) => {
              const isMe = entry.userId === user?.uid;
              const u = users[entry.userId];
              return (
                <div key={entry.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                  borderRadius: '14px', background: isMe ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.04)',
                  border: isMe ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ width: '32px', textAlign: 'center', fontWeight: 800, fontSize: '15px', color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </div>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: `hsl(${(entry.userId?.charCodeAt(0) || 0) * 5},60%,50%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '14px', flexShrink: 0
                  }}>{u?.name?.[0] || '?'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>
                      {u?.name || 'Unknown'} {isMe && <span style={{ fontSize: '11px', color: '#60a5fa' }}>(You)</span>}
                    </div>
                    {u?.isPremium && <span style={{ fontSize: '11px', color: '#f59e0b' }}>⭐ Premium</span>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '18px', color: i === 0 ? '#f59e0b' : 'white' }}>
                    {entry.totalScore || 0}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
