// src/pages/admin/AdminLeaderboard.js
import React, { useEffect, useState } from 'react';
import { getLeaderboard, getAllUsers, resetLeaderboard } from '../../services/db';

export default function AdminLeaderboard() {
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [lb, allUsers] = await Promise.all([getLeaderboard(100), getAllUsers()]);
    const uMap = {};
    allUsers.forEach(u => { uMap[u.id] = u; });
    setUsers(uMap);
    setEntries(lb);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReset = async () => {
    if (!window.confirm('⚠️ This will delete ALL leaderboard scores. Continue?')) return;
    setResetting(true);
    await resetLeaderboard();
    await load();
    setResetting(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800 }}>🏆 Leaderboard Control</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{entries.length} ranked users</p>
        </div>
        <button onClick={handleReset} disabled={resetting} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontWeight: 600,
          fontSize: '13px', fontFamily: 'inherit'
        }}>{resetting ? 'Resetting...' : '🔄 Reset All Scores'}</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
          <p>No rankings yet</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 100px', gap: '12px', padding: '10px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            <span>Rank</span><span>Name</span><span>Email</span><span>Score</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entries.map((entry, i) => {
              const u = users[entry.userId];
              const medals = ['🥇','🥈','🥉'];
              return (
                <div key={entry.userId} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr 1fr 100px', gap: '12px',
                  padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', alignItems: 'center', fontSize: '14px'
                }}>
                  <span style={{ fontWeight: 800, color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.5)', fontSize: i < 3 ? '16px' : '14px' }}>
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </span>
                  <span style={{ fontWeight: 600 }}>{u?.name || 'Unknown'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{u?.email || '—'}</span>
                  <span style={{ fontWeight: 800, color: i === 0 ? '#f59e0b' : 'white', fontSize: '16px' }}>
                    {entry.totalScore || 0}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
