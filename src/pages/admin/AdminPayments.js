// src/pages/admin/AdminPayments.js
import React, { useEffect, useState } from 'react';
import { getAllPayments, getAllUsers } from '../../services/db';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllPayments(), getAllUsers()]).then(([pmts, allUsers]) => {
      const uMap = {};
      allUsers.forEach(u => { uMap[u.id] = u; });
      setUsers(uMap);
      setPayments(pmts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    });
  }, []);

  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const subs = payments.filter(p => p.type === 'subscription').length;
  const exts = payments.filter(p => p.type === 'extension').length;

  return (
    <div>
      <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>💰 Payments</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px' }}>All transaction history</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Revenue', value: `₹${total}`, color: '#10b981' },
          { label: 'Subscriptions', value: subs, color: '#3b82f6' },
          { label: 'Extensions', value: exts, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💸</div>
          <p>No payments yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px 120px', gap: '12px', padding: '10px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            <span>User</span><span>Payment ID</span><span>Type</span><span>Amount</span><span>Date</span>
          </div>
          {payments.map(p => {
            const u = users[p.userId];
            const date = p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString('en-IN') : '—';
            return (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px 120px', gap: '12px',
                padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', fontSize: '13px', alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600 }}>{u?.name || p.userId?.slice(0, 8)}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '11px' }}>{p.razorpayPaymentId?.slice(0, 16) || '—'}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontWeight: 600, textAlign: 'center',
                  background: p.type === 'subscription' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)',
                  color: p.type === 'subscription' ? '#60a5fa' : '#f59e0b', fontSize: '11px'
                }}>{p.type === 'subscription' ? 'Sub' : 'Ext'}</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>₹{p.amount}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{date}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
