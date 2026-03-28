// src/pages/user/RoomPlay.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, listenRoom, updateRoomScore } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

const TIME_PER_Q = 60;

export default function RoomPlay() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(TIME_PER_Q);
  const [phase, setPhase] = useState('waiting');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const unsub = listenRoom(roomId, (data) => {
      setRoom(data);
      if (data.status === 'playing' && phase === 'waiting') setPhase('playing');
    });
    return unsub;
  }, [roomId, phase]);

  const questions = room?.questions || [];

  const submitAnswer = useCallback((ans) => {
    const q = questions[current];
    const correct = ans === q?.answer;
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    setAnswers(prev => ({ ...prev, [current]: ans }));
    updateRoomScore(roomId, user.uid, newScore);

    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setTimer(TIME_PER_Q);
    } else {
      setPhase('done');
    }
  }, [current, questions, score, roomId, user?.uid]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timer === 0) { submitAnswer(null); return; }
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer, phase, submitAnswer]);

  const q = questions[current];
  const liveScores = room?.liveScores || {};
  const timerColor = timer > 30 ? '#10b981' : timer > 10 ? '#f59e0b' : '#ef4444';

  if (!room) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Outfit',sans-serif" }}>
      Loading room...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Outfit',sans-serif", color: 'white', padding: '20px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Room: {room.code}</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{room.users?.length || 0} players</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>Score: {score}</div>
          </div>
        </div>

        {/* Live Scores */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '16px', marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>🔴 Live Scores</h4>
          {Object.entries(liveScores).sort(([,a],[,b]) => b-a).map(([uid, s], i) => (
            <div key={uid} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
              <span>#{i+1} {uid === user?.uid ? 'You' : `Player ${i+1}`}</span>
              <span style={{ fontWeight: 700, color: uid === user?.uid ? '#60a5fa' : 'white' }}>{s}</span>
            </div>
          ))}
        </div>

        {phase === 'waiting' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ fontWeight: 800 }}>Waiting for host to start...</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Code: <strong style={{ color: 'white', letterSpacing: '4px' }}>{room.code}</strong></p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Share this code with friends</p>
            {room.hostId === user?.uid && (
              <button onClick={() => {
                import('../../services/db').then(({ updateRoomScore, getRoomById }) => {
                  import('firebase/firestore').then(({ doc, updateDoc }) => {
                    import('../../services/firebase').then(({ db }) => {
                      updateDoc(doc(db, 'rooms', roomId), { status: 'playing' });
                    });
                  });
                });
              }} style={{
                marginTop: '20px', padding: '14px 36px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
                fontWeight: 700, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit'
              }}>▶ Start Game</button>
            )}
          </div>
        )}

        {phase === 'playing' && q && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Q {current+1}/{questions.length}</span>
              <span style={{ fontWeight: 800, fontSize: '20px', color: timerColor }}>{timer}s</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '17px', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>{q.question}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(q.options || []).map((opt, i) => (
                <button key={i} onClick={() => submitAnswer(opt)} style={{
                  padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', color: 'white', textAlign: 'left',
                  fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
                }}>{String.fromCharCode(65+i)}. {opt}</button>
              ))}
            </div>
          </>
        )}

        {phase === 'done' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🏁</div>
            <h3 style={{ fontWeight: 800, fontSize: '24px', color: '#10b981' }}>Room Finished!</h3>
            <div style={{ fontSize: '40px', fontWeight: 900, color: 'white', margin: '12px 0' }}>
              {score} / {questions.length}
            </div>
            <button onClick={() => navigate('/')} style={{
              padding: '14px 32px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px'
            }}>Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}
