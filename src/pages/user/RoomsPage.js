// src/pages/user/RoomsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createRoom, joinRoom, getAllQuestions } from '../../services/db';
import { payForExtraRooms } from '../../services/payment';

export default function RoomsPage() {
  const { user, userData, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  if (!userData?.isPremium) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", color: 'white', padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h2>Premium Only Feature</h2>
        <Link to="/premium" style={{ padding: '14px 32px', borderRadius: '12px', textDecoration: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0f172a', fontWeight: 700 }}>Upgrade ₹11/month</Link>
      </div>
    </div>
  );

  const canCreate = userData.roomCreatedCount < userData.roomCreateLimit;
  const canJoin = userData.roomJoinedCount < userData.roomJoinLimit;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      const qs = await getAllQuestions();
      const selectedQs = qs.sort(() => Math.random() - 0.5).slice(0, 10);
      const result = await createRoom(user.uid, 'custom', selectedQs);
      setCreated(result);
      await refreshUserData();
    } catch (e) { alert('Error: ' + e.message); }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!canJoin || !joinCode.trim()) return;
    setLoading(true);
    try {
      const room = await joinRoom(joinCode.trim().toUpperCase(), user.uid);
      await refreshUserData();
      navigate(`/room/${room.id}`);
    } catch (e) { alert('Room not found. Check the code.'); }
    setLoading(false);
  };

  const handlePayMore = async () => {
    setPayLoading(true);
    try {
      await payForExtraRooms(user.uid, userData.name, user.email);
      await refreshUserData();
    } catch (e) { if (e.message !== 'Payment cancelled') alert('Payment failed'); }
    setPayLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit',sans-serif", color: 'white', padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)' }}>←</Link>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>👥 Rooms</h2>
        </div>

        {/* Limits */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Room Creates', used: userData.roomCreatedCount, limit: userData.roomCreateLimit },
            { label: 'Room Joins', used: userData.roomJoinedCount, limit: userData.roomJoinLimit }
          ].map(({ label, used, limit }) => {
            const pct = limit > 0 ? (used / limit) * 100 : 0;
            return (
              <div key={label} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{used} / {limit}</div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#ef4444' : '#2563eb', borderRadius: '99px' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pay for more */}
        {(!canCreate || !canJoin) && (
          <div style={{
            padding: '16px 20px', borderRadius: '16px', marginBottom: '20px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px' }}>Room limit reached</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Pay ₹11 to unlock 11 more</div>
            </div>
            <button onClick={handlePayMore} disabled={payLoading} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0f172a',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px'
            }}>{payLoading ? 'Processing...' : 'Pay ₹11'}</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          {['create', 'join'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '9px', fontFamily: 'inherit',
              background: tab === t ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'transparent',
              color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              textTransform: 'capitalize', boxShadow: tab === t ? '0 4px 12px rgba(37,99,235,0.4)' : 'none'
            }}>{t === 'create' ? '+ Create Room' : '→ Join Room'}</button>
          ))}
        </div>

        {tab === 'create' ? (
          <div>
            {created ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>Room Created!</h3>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Share this code:</div>
                <div style={{
                  fontSize: '48px', fontWeight: 900, letterSpacing: '8px', color: 'white',
                  background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px', marginBottom: '20px'
                }}>{created.code}</div>
                <button onClick={() => navigator.clipboard.writeText(created.code)} style={{
                  padding: '12px 28px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent', color: 'white', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px'
                }}>📋 Copy Code</button>
                <br />
                <button onClick={() => navigate(`/room/${created.id}`)} style={{
                  padding: '12px 28px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                }}>Enter Room →</button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px' }}>
                  Create a study room and invite friends. All members get the same questions for fair competition.
                </p>
                <button onClick={handleCreate} disabled={loading || !canCreate} style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: canCreate ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'rgba(255,255,255,0.1)',
                  color: 'white', fontWeight: 700, fontSize: '16px', cursor: canCreate ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', boxShadow: canCreate ? '0 4px 20px rgba(37,99,235,0.4)' : 'none'
                }}>{loading ? 'Creating...' : canCreate ? '+ Create Room' : 'Limit Reached'}</button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px' }}>
              Enter a 6-character room code to join a study session.
            </p>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6} placeholder="ENTER CODE"
              style={{
                width: '100%', padding: '18px', textAlign: 'center', fontSize: '28px',
                fontWeight: 800, letterSpacing: '8px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px',
                color: 'white', fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box'
              }} />
            <button onClick={handleJoin} disabled={loading || !canJoin || joinCode.length < 6} style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: (canJoin && joinCode.length >= 6) ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'rgba(255,255,255,0.1)',
              color: 'white', fontWeight: 700, fontSize: '16px',
              cursor: (canJoin && joinCode.length >= 6) ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit'
            }}>{loading ? 'Joining...' : 'Join Room'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
