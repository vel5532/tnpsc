// src/pages/user/ResultScreen.js
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { explainAnswer, generateMnemonic } from '../../services/ai';

export default function ResultScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [explanations, setExplanations] = useState({});
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [mnemonic, setMnemonic] = useState('');
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);

  if (!state) { navigate('/test'); return null; }
  const { questions, answers, correct, percentage, passed, topic } = state;

  const getExplanation = async (idx) => {
    if (explanations[idx]) return;
    setLoadingIdx(idx);
    const q = questions[idx];
    try {
      const text = await explainAnswer(q.question, q.options || [], q.answer, answers[idx] || 'Not answered');
      setExplanations(p => ({ ...p, [idx]: text }));
    } catch (e) {
      setExplanations(p => ({ ...p, [idx]: 'AI explanation unavailable. Please check your OpenAI API key.' }));
    }
    setLoadingIdx(null);
  };

  const getMnemonic = async () => {
    setLoadingMnemonic(true);
    try {
      const text = await generateMnemonic(topic || 'General', `Score: ${correct}/${questions.length}, Percentage: ${percentage}%`);
      setMnemonic(text);
    } catch (e) {
      setMnemonic('Memory trick unavailable. Check OpenAI API key.');
    }
    setLoadingMnemonic(false);
  };

  const passColor = passed ? '#10b981' : '#ef4444';
  const passBg = passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit',sans-serif", color: 'white', padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Result Header */}
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: passBg, border: `1px solid ${passColor}30`,
          borderRadius: '24px', marginBottom: '28px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>{passed ? '🎉' : '😔'}</div>
          <div style={{ fontSize: '72px', fontWeight: 900, color: passColor, lineHeight: 1 }}>{percentage}%</div>
          <div style={{
            display: 'inline-block', marginTop: '12px', padding: '8px 24px', borderRadius: '20px',
            background: passColor, color: passed ? '#0f172a' : 'white', fontWeight: 800, fontSize: '18px'
          }}>{passed ? 'PASSED ✓' : 'FAILED ✗'}</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '12px', fontSize: '15px' }}>
            {correct} / {questions.length} correct answers
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Minimum to pass: 80%</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link to="/test" style={{
            flex: 1, padding: '14px', borderRadius: '12px', textDecoration: 'none',
            background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
            fontWeight: 700, fontSize: '15px', textAlign: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
          }}>🔄 Try Again</Link>
          <Link to="/" style={{
            flex: 1, padding: '14px', borderRadius: '12px', textDecoration: 'none',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
            fontWeight: 600, fontSize: '15px', textAlign: 'center'
          }}>🏠 Dashboard</Link>
          <button onClick={getMnemonic} disabled={loadingMnemonic} style={{
            flex: 1, padding: '14px', borderRadius: '12px',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0f172a',
            fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
          }}>{loadingMnemonic ? '🧠 Thinking...' : '🧠 Memory Trick'}</button>
        </div>

        {/* Mnemonic */}
        {mnemonic && (
          <div style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '16px', padding: '20px', marginBottom: '24px'
          }}>
            <h4 style={{ color: '#f59e0b', margin: '0 0 8px', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>🧠 Memory Trick</h4>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{mnemonic}</p>
          </div>
        )}

        {/* Questions Review */}
        <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>Question Analysis</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === q.answer;
            const color = isCorrect ? '#10b981' : userAns ? '#ef4444' : '#6b7280';

            return (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30`,
                borderRadius: '16px', padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Q{i + 1}</span>
                    <p style={{ margin: '4px 0 12px', fontSize: '15px', fontWeight: 500, lineHeight: 1.5 }}>{q.question}</p>
                    <div style={{ fontSize: '13px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>✅ Correct: <strong style={{ color: '#10b981' }}>{q.answer}</strong></span>
                      {!isCorrect && userAns && <span>❌ You chose: <strong style={{ color: '#ef4444' }}>{userAns}</strong></span>}
                      {!userAns && <span style={{ color: '#6b7280' }}>⏭ Skipped</span>}
                    </div>
                  </div>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: isCorrect ? 'rgba(16,185,129,0.2)' : userAns ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                  }}>{isCorrect ? '✓' : userAns ? '✗' : '–'}</div>
                </div>

                {/* AI Explanation */}
                {!isCorrect && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {explanations[i] ? (
                      <div style={{ background: 'rgba(37,99,235,0.08)', borderRadius: '10px', padding: '14px', fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>
                        {explanations[i]}
                      </div>
                    ) : (
                      <button onClick={() => getExplanation(i)} disabled={loadingIdx === i} style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        background: 'rgba(37,99,235,0.2)', color: '#60a5fa',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                      }}>
                        {loadingIdx === i ? '🤖 Explaining...' : '🤖 Explain with AI'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
