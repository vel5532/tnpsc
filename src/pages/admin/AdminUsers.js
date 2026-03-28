// src/pages/admin/AdminUsers.js
import React, { useEffect, useState } from 'react';
import { getAllUsers, makePremium, updateUser } from '../../services/db';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMakePremium = async (uid) => {
    setActionLoading(uid + '_premium');
    await makePremium(uid);
    await load();
    setActionLoading('');
  };

  const handleToggleBlock = async (uid, status) => {
    setActionLoading(uid + '_block');
    await updateUser(uid, { status: status === 'active' ? 'blocked' : 'active' });
    await load();
    setActionLoading('');
  };

  const handleUpdateLimits = async (uid, field, value) => {
    await updateUser(uid, { [field]: parseInt(value) || 0 });
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, [field]: parseInt(value) || 0 } : u));
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    premium: users.filter(u => u.isPremium).length,
    blocked: users.filter(u => u.status === 'blocked').length,
    active: users.filter(u => u.status === 'active').length,
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>👥 User Management</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px' }}>Manage all registered users</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Users', value: stats.total, color: '#3b82f6' },
          { label: 'Premium', value: stats.premium, color: '#f59e0b' },
          { label: 'Active', value: stats.active, color: '#10b981' },
          { label: 'Blocked', value: stats.blocked, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '18px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Search by name or email..."
        style={{
          width: '100%', padding: '12px 16px', marginBottom: '20px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', color: 'white', fontSize: '14px', fontFamily: 'inherit',
          boxSizing: 'border-box', outline: 'none'
        }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading users...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(u => (
            <div key={u.id} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '18px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                {/* User Info */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: `hsl(${(u.id?.charCodeAt(0) || 0) * 5},60%,45%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '16px'
                  }}>{u.name?.[0] || '?'}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {u.name || 'Unknown'}
                      {u.isPremium && <span style={{ fontSize: '11px', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>⭐ Premium</span>}
                      {u.role === 'admin' && <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>🔐 Admin</span>}
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                        background: u.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: u.status === 'active' ? '#10b981' : '#ef4444'
                      }}>{u.status || 'active'}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{u.email}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                      Rooms: {u.roomCreatedCount || 0}/{u.roomCreateLimit || 0} created · {u.roomJoinedCount || 0}/{u.roomJoinLimit || 0} joined
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!u.isPremium && u.role !== 'admin' && (
                    <button onClick={() => handleMakePremium(u.id)}
                      disabled={actionLoading === u.id + '_premium'}
                      style={{
                        padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                        background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontWeight: 600,
                        fontSize: '12px', fontFamily: 'inherit'
                      }}>
                      {actionLoading === u.id + '_premium' ? '...' : '⭐ Make Premium'}
                    </button>
                  )}
                  {u.role !== 'admin' && (
                    <button onClick={() => handleToggleBlock(u.id, u.status)}
                      disabled={actionLoading === u.id + '_block'}
                      style={{
                        padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                        background: u.status === 'active' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: u.status === 'active' ? '#fca5a5' : '#10b981',
                        fontWeight: 600, fontSize: '12px', fontFamily: 'inherit'
                      }}>
                      {actionLoading === u.id + '_block' ? '...' : u.status === 'active' ? '🚫 Block' : '✓ Unblock'}
                    </button>
                  )}
                </div>
              </div>

              {/* Room limit editing */}
              {u.isPremium && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
                  {[
                    { field: 'roomCreateLimit', label: 'Create Limit' },
                    { field: 'roomJoinLimit', label: 'Join Limit' }
                  ].map(({ field, label }) => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{label}:</span>
                      <input
                        type="number" defaultValue={u[field] || 0}
                        onBlur={e => handleUpdateLimits(u.id, field, e.target.value)}
                        style={{
                          width: '60px', padding: '4px 8px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white', fontSize: '13px', fontFamily: 'inherit', textAlign: 'center'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
