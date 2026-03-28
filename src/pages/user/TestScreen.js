// src/pages/user/TestScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuestions, getQuestionsByTopic } from '../../services/db';
import { saveResult } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

const TOPICS = ['All Topics', 'History', 'Geography', 'Polity', 'Economics', 'Science', 'Tamil Language', 'General Knowledge', 'Current Affairs', 'Mathematics'];
const TIME_PER_Q = 60;

export default function TestScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('select'); // select | test | done
  const [topic, setTopic] = useState('All Topics');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(TIME_PER_Q);
  const [loading, setLoading] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);

  const startTest = async () => {
    setLoading(true);
    const qs = topic === 'All Topics' ? await getAllQuestions() : await getQuestionsByTopic(topic);
    if (qs.length === 0) {
      alert('No questions found for this topic. Ask admin to upload PDFs first.');
      setLoading(false);
      return;
    }
    // Shuffle & limit to 20
    const shuffled = qs.sort(() => Math.random() - 0.5).slice(0, 20);
    setQuestions(shuffled);
    setCurrent(0);
    setAnswers({});
    setTimer(TIME_PER_Q);
    setPhase('test');
    setLoading(false);
  };

  const submitAnswer = useCallback((ans) => {
    setAnswers(prev => ({ ...prev, [current]: ans }));
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setTimer(TIME_PER_Q);
    } else {
      finishTest({ ...answers, [current]: ans });
    }
  }, [current, questions.length, answers]);

  const finishTest = async (finalAnswers) => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (finalAnswers[i] === q.answer) correct++;
    });
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= 80;
    const resultId = await saveResult(user.uid, {
      score: correct,
      total: questions.length,
      percentage,
      passed,
      topic: topic === 'All Topics' ? null : topic,
      answers: finalAnswers,
      questions: questions.map(q => ({ id: q.id, question: q.question, answer: q.answer }))
    });
    navigate('/result', { state: { questions, answers: finalAnswers, correct, percentage, passed, topic, resultId } });
  };

  useEffect(() => {
    if (phase !== 'test') return;
    if (timer === 0) { submitAnswer(null); return; }
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer, phase, submitAnswer]);

  const q = questions[current];
  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0;

  if (phase === 'select') return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Select Topic</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px', fontSize: '14px' }}>Choose a topic to start your timed test</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {TOPICS.map(t => (
            <button key={t} onClick={() => setTopic(t)} style={{
              padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: topic === t ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'rgba(255,255,255,0.06)',
              color: 'white', fontWeight: topic === t ? 700 : 400, fontSize: '13px',
              boxShadow: topic === t ? '0 4px 12px rgba(37,99,235,0.4)' : 'none',
              transition: 'all 0.15s'
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <input type="checkbox" id="translate" checked={translateEnabled} onChange={e => setTranslateEnabled(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          <label htmlFor="translate" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', cursor: 'pointer' }}>🌐 Enable Translation (Tamil ↔ English)</label>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/')} style={{
            flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
          }}>← Back</button>
          <button onClick={startTest} disabled={loading} style={{
            flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
            fontWeight: 700, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(37,99,235,0.4)'
          }}>{loading ? 'Loading...' : '▶ Start Test'}</button>
        </div>
      </div>
    </div>
  );

  if (!q) return null;

  const timerColor = timer > 30 ? '#10b981' : timer > 10 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit',sans-serif", padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Question <strong style={{ color: 'white' }}>{current + 1}</strong> / {questions.length}
          </div>
          {/* Timer Circle */}
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: `conic-gradient(${timerColor} ${(timer/TIME_PER_Q)*360}deg, rgba(255,255,255,0.1) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#0f172a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 800, color: timerColor
            }}>{timer}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', marginBottom: '28px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#2563eb,#3b82f6)', borderRadius: '99px', transition: 'width 0.3s' }} />
        </div>

        {/* Question Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '28px', marginBottom: '20px'
        }}>
          <p style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.6, color: 'white', margin: 0 }}>
            {q.question}
          </p>
          {q.language && q.language !== 'English' && (
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>({q.language})</p>
          )}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(q.options || []).map((opt, i) => (
            <button key={i} onClick={() => submitAnswer(opt)} style={{
              padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: 'white', textAlign: 'left',
              fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s',
              lineHeight: 1.4
            }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: '#60a5fa'
              }}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>

        {/* Skip */}
        <button onClick={() => submitAnswer(null)} style={{
          marginTop: '16px', width: '100%', padding: '12px',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: '14px', transition: 'all 0.15s'
        }}>Skip →</button>
      </div>
    </div>
  );
}
