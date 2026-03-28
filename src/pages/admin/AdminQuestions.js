// src/pages/admin/AdminQuestions.js
import React, { useEffect, useState } from 'react';
import { getAllQuestions, addQuestion, deleteQuestion } from '../../services/db';
import { processPDFToQuestions } from '../../services/pdfExtractor';

const TOPICS = ['History', 'Geography', 'Polity', 'Economics', 'Science', 'Tamil Language', 'General Knowledge', 'Current Affairs', 'Mathematics'];

const emptyQ = { question: '', options: ['', '', '', ''], answer: '', topic: 'General Knowledge', language: 'English' };

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyQ);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterTopic, setFilterTopic] = useState('All');
  const [pdfProgress, setPdfProgress] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getAllQuestions();
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.question || !form.answer || form.options.filter(Boolean).length < 2) {
      alert('Please fill in question, at least 2 options, and correct answer');
      return;
    }
    setSaving(true);
    await addQuestion({ ...form, options: form.options.filter(Boolean) });
    setForm(emptyQ);
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await deleteQuestion(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfProgress('Processing PDF...');
    try {
      const extracted = await processPDFToQuestions(file, setPdfProgress);
      for (const q of extracted) {
        if (q.question && q.answer) await addQuestion(q);
      }
      setPdfProgress(`✅ Added ${extracted.length} questions from PDF`);
      await load();
    } catch (err) {
      setPdfProgress('❌ Failed: ' + err.message);
    }
  };

  const filtered = questions.filter(q => {
    const matchTopic = filterTopic === 'All' || q.topic === filterTopic;
    const matchSearch = !search || q.question?.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800 }}>📝 Questions</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{questions.length} total questions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{
            padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
            background: 'rgba(16,185,129,0.15)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600, fontSize: '13px'
          }}>
            📄 Upload PDF
            <input type="file" accept=".pdf" onChange={handlePDFUpload} style={{ display: 'none' }} />
          </label>
          <button onClick={() => setShowForm(v => !v)} style={{
            padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
            fontWeight: 600, fontSize: '13px', fontFamily: 'inherit'
          }}>+ Add Question</button>
        </div>
      </div>

      {pdfProgress && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px',
          background: pdfProgress.startsWith('✅') ? 'rgba(16,185,129,0.1)' : pdfProgress.startsWith('❌') ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)',
          border: `1px solid ${pdfProgress.startsWith('✅') ? 'rgba(16,185,129,0.2)' : pdfProgress.startsWith('❌') ? 'rgba(239,68,68,0.2)' : 'rgba(37,99,235,0.2)'}`,
          color: pdfProgress.startsWith('✅') ? '#10b981' : pdfProgress.startsWith('❌') ? '#fca5a5' : '#60a5fa'
        }}>{pdfProgress}</div>
      )}

      {/* Add Question Form */}
      {showForm && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700 }}>Add New Question</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
              placeholder="Question text..."
              style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {form.options.map((opt, i) => (
                <input key={i} value={opt}
                  onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm(p => ({ ...p, options: o })); }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontFamily: 'inherit' }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <input value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                placeholder="Correct answer (exact text)"
                style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', color: '#10b981', fontSize: '14px', fontFamily: 'inherit' }} />
              <select value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                style={{ padding: '10px 12px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', color: '#60a5fa', fontSize: '14px', fontFamily: 'inherit' }}>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontFamily: 'inherit' }}>
                <option>English</option>
                <option>Tamil</option>
                <option>Bilingual</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px'
              }}>{saving ? 'Saving...' : '💾 Save Question'}</button>
              <button onClick={() => setShowForm(false)} style={{
                padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit'
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter + Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search questions..."
          style={{
            flex: 1, minWidth: '200px', padding: '10px 14px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: 'white', fontSize: '13px', fontFamily: 'inherit', outline: 'none'
          }} />
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          style={{
            padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: 'white', fontSize: '13px', fontFamily: 'inherit'
          }}>
          <option>All</option>
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
          <p>No questions found. Upload a PDF or add manually.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((q, i) => (
            <div key={q.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '16px 18px',
              display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', background: 'rgba(37,99,235,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{q.topic || 'General'}</span>
                  {q.language && q.language !== 'English' && <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{q.language}</span>}
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>{q.question}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(q.options || []).map((opt, oi) => (
                    <span key={oi} style={{
                      fontSize: '12px', padding: '3px 10px', borderRadius: '6px',
                      background: opt === q.answer ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                      color: opt === q.answer ? '#10b981' : 'rgba(255,255,255,0.6)',
                      border: opt === q.answer ? '1px solid rgba(16,185,129,0.3)' : 'none',
                      fontWeight: opt === q.answer ? 700 : 400
                    }}>{opt === q.answer ? '✓ ' : ''}{opt}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleDelete(q.id)} style={{
                padding: '7px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '13px',
                fontFamily: 'inherit', flexShrink: 0
              }}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
