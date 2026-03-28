// src/pages/admin/AdminPanel.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import AdminUsers from './AdminUsers';
import AdminQuestions from './AdminQuestions';
import AdminPayments from './AdminPayments';
import AdminLeaderboard from './AdminLeaderboard';

const tabs = [
  { id: 'users', label: '👥 Users', icon: '👥' },
  { id: 'questions', label: '📝 Questions', icon: '📝' },
  { id: 'payments', label: '💰 Payments', icon: '💰' },
  { id: 'leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/auth');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'users': return <AdminUsers />;
      case 'questions': return <AdminQuestions />;
      case 'payments': return <AdminPayments />;
      case 'leaderboard': return <AdminLeaderboard />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Outfit', sans-serif", color: 'white' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: '240px', background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', padding: '24px 16px',
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 900
            }}>11</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>TEST <span style={{ color: '#ef4444' }}>11</span></div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Admin Panel</div>
            </div>
          </div>

          {/* Admin badge */}
          <div style={{
            padding: '10px 14px', borderRadius: '12px', marginBottom: '24px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>🔐 Admin Access</div>
            <div style={{ fontSize: '13px', color: 'white', marginTop: '2px', fontWeight: 600 }}>{userData?.name || 'Admin'}</div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 14px', borderRadius: '12px', border: 'none',
                background: activeTab === tab.id ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#fca5a5' : 'rgba(255,255,255,0.6)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', transition: 'all 0.15s',
                borderLeft: activeTab === tab.id ? '3px solid #ef4444' : '3px solid transparent'
              }}>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.08)', color: '#fca5a5',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s'
          }}>🚪 Logout</button>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: '240px', flex: 1, padding: '32px', minHeight: '100vh' }}>
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
