// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/user/Dashboard';
import TestScreen from './pages/user/TestScreen';
import ResultScreen from './pages/user/ResultScreen';
import Leaderboard from './pages/user/Leaderboard';
import PremiumPage from './pages/user/PremiumPage';
import UploadPDF from './pages/user/UploadPDF';
import RoomsPage from './pages/user/RoomsPage';
import RoomPlay from './pages/user/RoomPlay';
import AdminPanel from './pages/admin/AdminPanel';

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userData, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
      fontFamily: "'Outfit', sans-serif", color: 'white'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: 900, animation: 'pulse 1.5s infinite'
      }}>11</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading...</span>
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;
  if (userData?.status === 'blocked') return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", color: 'white'
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
        <h2>Account Blocked</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Your account has been blocked. Contact support.</p>
      </div>
    </div>
  );
  if (adminOnly && userData?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

// ─── Role Router ──────────────────────────────────────────────────────────────
function RoleRouter() {
  const { userData, loading } = useAuth();

  if (loading) return null;

  if (userData?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Role-based home */}
          <Route path="/" element={
            <ProtectedRoute><RoleRouter /></ProtectedRoute>
          } />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/test" element={<ProtectedRoute><TestScreen /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><ResultScreen /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/premium" element={<ProtectedRoute><PremiumPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPDF /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
          <Route path="/room/:roomId" element={<ProtectedRoute><RoomPlay /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
