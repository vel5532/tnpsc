// src/pages/user/UploadPDF.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { processPDFToQuestions } from '../../services/pdfExtractor';
import { addQuestion } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

export default function UploadPDF() {
  const { userData } = useAuth();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState('');
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!userData?.isPremium) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", color: 'white' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Premium Feature</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Upgrade to premium to upload PDFs</p>
        <Link to="/premium" style={{
          padding: '14px 32px', borderRadius: '12px', textDecoration: 'none',
          background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0f172a',
          fontWeight: 700, fontSize: '15px'
        }}>Upgrade for ₹11/month</Link>
      </div>
    </div>
  );

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') setFile(f);
    else alert('Please select a PDF file');
  };

  const process = async () => {
    if (!file) return;
    setError(''); setQuestions([]);
    try {
      const qs = await processPDFToQuestions(file, setProgress);
      setQuestions(qs);
    } catch (e) {
      setError('Failed to process PDF. Check your OpenAI API key or try a clearer PDF.');
    }
  };

  const saveAll = async () => {
    setSaving(true);
    let saved = 0;
    for (const q of questions) {
      if (q.question && q.options?.length >= 2 && q.answer) {
        await addQuestion(q);
        saved++;
      }
    }
    setSaving(false);
    setDone(true);
    setProgress(`✅ Saved ${saved} questions to the question bank!`);
  };

  const updateQ = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit',sans-serif", color: 'white', padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)' }}>←</Link>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>📄 Upload PDF</h2>
        </div>

        {/* Upload Zone */}
        <div style={{
          border: '2px dashed rgba(37,99,235,0.4)', borderRadius: '20px', padding: '40px',
          textAlign: 'center', marginBottom: '20px', cursor: 'pointer',
          background: 'rgba(37,99,235,0.05)', transition: 'all 0.2s'
        }} onClick={() => document.getElementById('pdf-input').click()}>
          <input id="pdf-input" type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
            {file ? file.name : 'Click to upload PDF'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supports question papers, notes, study materials'}
          </div>
        </div>

        {file && !questions.length && (
          <button onClick={process} style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
            fontWeight: 700, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit',
            marginBottom: '16px', boxShadow: '0 4px 20px rgba(37,99,235,0.4)'
          }}>🤖 Extract Questions with AI</button>
        )}

        {progress && (
          <div style={{
            padding: '14px', borderRadius: '12px', marginBottom: '16px',
            background: done ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.1)',
            border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(37,99,235,0.2)'}`,
            color: done ? '#10b981' : '#60a5fa', fontSize: '14px', fontWeight: 500
          }}>{progress}</div>
        )}

        {error && (
          <div style={{ padding: '14px', borderRadius: '12px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '14px' }}>{error}</div>
        )}

        {questions.length > 0 && !done && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Extracted {questions.length} Questions</h3>
              <button onClick={saveAll} disabled={saving} style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px'
              }}>{saving ? 'Saving...' : '💾 Save All'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '16px'
                }}>
                  <input value={q.question} onChange={e => updateQ(i, 'question', e.target.value)} style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '10px', color: 'white', fontSize: '14px',
                    marginBottom: '10px', fontFamily: 'inherit', boxSizing: 'border-box'
                  }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    {(q.options || []).map((opt, oi) => (
                      <input key={oi} value={opt} onChange={e => {
                        const opts = [...q.options]; opts[oi] = e.target.value;
                        updateQ(i, 'options', opts);
                      }} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px', padding: '8px', color: 'white', fontSize: '13px',
                        fontFamily: 'inherit'
                      }} placeholder={`Option ${String.fromCharCode(65+oi)}`} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                    <input value={q.answer} onChange={e => updateQ(i, 'answer', e.target.value)} style={{
                      flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: '8px', padding: '8px', color: '#10b981', fontFamily: 'inherit', fontSize: '13px'
                    }} placeholder="Correct answer" />
                    <input value={q.topic} onChange={e => updateQ(i, 'topic', e.target.value)} style={{
                      flex: 1, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                      borderRadius: '8px', padding: '8px', color: '#60a5fa', fontFamily: 'inherit', fontSize: '13px'
                    }} placeholder="Topic" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
