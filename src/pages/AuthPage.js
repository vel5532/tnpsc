// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) {
        await loginUser(form.email, form.password);
      } else {
        await registerUser(form.email, form.password, form.name);
      }
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim());
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: "'Outfit', sans-serif", padding: '20px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      {/* Decorative background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: `${[300,200,400,150,250,180][i]}px`, height: `${[300,200,400,150,250,180][i]}px`,
            background: `radial-gradient(circle, ${['rgba(37,99,235,0.15)','rgba(245,158,11,0.1)','rgba(37,99,235,0.08)','rgba(245,158,11,0.12)','rgba(59,130,246,0.1)','rgba(251,191,36,0.08)'][i]} 0%, transparent 70%)`,
            top: `${[10,60,30,80,20,50][i]}%`, left: `${[10,70,40,20,80,55][i]}%`,
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
      </div>

      <div style={{
        width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 0 40px rgba(37,99,235,0.5)',
            marginBottom: '16px', fontSize: '28px', fontWeight: 900, color: 'white'
          }}>11</div>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            TEST <span style={{ color: '#f59e0b' }}>11</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', fontSize: '14px' }}>
            TNPSC Exam Preparation Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '36px'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
            padding: '4px', marginBottom: '28px'
          }}>
            {['Login', 'Register'].map((tab, i) => (
              <button key={tab} onClick={() => setIsLogin(i === 0)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '9px',
                background: (isLogin ? i === 0 : i === 1) ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'inherit',
                boxShadow: (isLogin ? i === 0 : i === 1) ? '0 4px 12px rgba(37,99,235,0.4)' : 'none'
              }}>{tab}</button>
            ))}
          </div>

          <form onSubmit={submit}>
            {!isLogin && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>Full Name</label>
                <input name="name" value={form.name} onChange={handle} required={!isLogin}
                  placeholder="Enter your name"
                  style={{
                    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
                    color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }} />
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handle} required
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
                  color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
                  color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }} />
            </div>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '12px', marginBottom: '16px',
                color: '#fca5a5', fontSize: '14px'
              }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
              background: loading ? 'rgba(37,99,235,0.4)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(37,99,235,0.4)', transition: 'all 0.2s',
              fontFamily: 'inherit', letterSpacing: '0.3px'
            }}>
              {loading ? '...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '24px' }}>
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
