// src/pages/user/PremiumPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { initiateSubscription } from '../../services/payment';

export default function PremiumPage() {
  const { user, userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePay = async () => {
    setLoading(true);
    try {
      await initiateSubscription(user.uid, userData?.name, user.email);
      await refreshUserData();
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (e) {
      if (e.message !== 'Payment cancelled') alert('Payment failed: ' + e.message);
    }
    setLoading(false);
  };

  const features = [
    { icon: '📄', title: 'Upload PDFs', desc: 'Upload your own study materials' },
    { icon: '👥', title: 'Create Rooms', desc: '11 room creations per month' },
    { icon: '🔗', title: 'Join Rooms', desc: '11 room joins per month' },
    { icon: '📊', title: 'Advanced Analytics', desc: 'Deep performance insights' },
    { icon: '🏆', title: 'Live Leaderboard', desc: 'Compete in real-time rooms' },
    { icon: '🤖', title: 'AI Explanations', desc: 'Unlimited AI-powered analysis' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit',sans-serif", color: 'white', padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>← Back to Dashboard</Link>

        {success ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>Welcome to Premium!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div style={{
              textAlign: 'center', padding: '40px 20px', marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.05))',
              border: '1px solid rgba(245,158,11,0.2)', borderRadius: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 8px' }}>
                Go <span style={{ color: '#f59e0b' }}>Premium</span>
              </h2>
              <div style={{ fontSize: '52px', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>₹11</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '20px' }}>per month</div>
              <button onClick={handlePay} disabled={loading || userData?.isPremium} style={{
                padding: '16px 48px', borderRadius: '14px', border: 'none',
                background: userData?.isPremium ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                color: userData?.isPremium ? '#10b981' : '#0f172a',
                fontSize: '18px', fontWeight: 800, cursor: userData?.isPremium ? 'default' : 'pointer',
                fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(245,158,11,0.3)'
              }}>
                {userData?.isPremium ? '✓ Already Premium' : loading ? 'Processing...' : 'Pay with UPI ₹11'}
              </button>
            </div>

            {/* Features */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {features.map(({ icon, title, desc }) => (
                <div key={title} style={{
                  padding: '18px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Room System */}
            <div style={{
              marginTop: '16px', padding: '20px', borderRadius: '16px',
              background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)'
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#60a5fa', fontWeight: 700 }}>💡 Room Limit System</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                Each month you get 11 room creations + 11 room joins. Need more? Pay another ₹11 to unlock 11 more.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
