import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Timer, CheckCircle, XCircle, RefreshCw, Flame, HelpCircle } from 'lucide-react';
import { CurrentQuestion, Player } from '../types/game';
import { sounds } from '../utils/sound';

interface CardViewerProps {
  question: CurrentQuestion;
  turnPlayer: Player | undefined;
  isLocalTurn: boolean;
  timerDuration: number;
  onVerdict: (verdict: 'completed' | 'forfeited') => void;
  onVerifyDare?: (accepted: boolean) => void;
  onReroll?: () => void;
}

export const CardViewer: React.FC<CardViewerProps> = ({
  question,
  turnPlayer,
  isLocalTurn,
  timerDuration = 60,
  onVerdict,
  onVerifyDare,
  onReroll
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false);

  useEffect(() => {
    sounds.playCardFlip();
    const timer = setTimeout(() => setIsFlipped(true), 150);
    return () => clearTimeout(timer);
  }, [question]);

  useEffect(() => {
    setTimeLeft(timerDuration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          sounds.playTimerBeep(true);
          return 0;
        }
        if (prev <= 5) {
          sounds.playTimerBeep(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [question, timerDuration]);

  const handleComplete = () => {
    setIsPendingApproval(true);
  };

  const handleForfeit = () => {
    onVerdict('forfeited');
  };

  const handleOpponentAccept = () => {
    sounds.playVictory();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    if (onVerifyDare) onVerifyDare(true);
    else onVerdict('completed');
  };

  const handleOpponentReject = () => {
    if (onVerifyDare) onVerifyDare(false);
    else onVerdict('forfeited');
  };

  const timerPercent = (timeLeft / timerDuration) * 100;
  const timerColor = timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#f43f5e';

  const isTruth = question.type === 'truth';

  return (
    <div style={{ perspective: '1000px', width: '100%', maxWidth: '540px', margin: '0 auto' }}>
      <div
        className={`flip-card-inner ${isFlipped ? 'flip-card-flipped' : ''}`}
        style={{ position: 'relative', width: '100%', minHeight: '320px' }}
      >
        {/* Card Front (Hidden side) */}
        <div
          className="flip-card-front glass-panel"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))'
          }}
        >
          <div style={{ fontSize: '3rem' }}>🔥 Revealing Card...</div>
        </div>

        {/* Card Back (Revealed Content) */}
        <div
          className="flip-card-back glass-panel"
          style={{
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: isTruth
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 182, 212, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(236, 72, 153, 0.3) 100%)',
            border: isTruth ? '2px solid #06b6d4' : '2px solid #ec4899',
            boxShadow: isTruth ? '0 0 30px rgba(6, 182, 212, 0.4)' : '0 0 30px rgba(236, 72, 153, 0.4)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.9rem',
                borderRadius: '2rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                background: isTruth ? '#06b6d4' : '#ec4899',
                color: '#fff',
                boxShadow: isTruth ? '0 0 12px rgba(6, 182, 212, 0.6)' : '0 0 12px rgba(236, 72, 153, 0.6)'
              }}
            >
              {isTruth ? <HelpCircle size={16} /> : <Flame size={16} />}
              {question.type} • {question.category}
            </span>

            {/* Timer Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: timerColor,
                background: 'rgba(0,0,0,0.5)',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Timer size={18} /> {timeLeft}s
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
            <div
              style={{
                width: `${timerPercent}%`,
                height: '100%',
                background: timerColor,
                borderRadius: '4px',
                transition: 'width 1s linear',
                boxShadow: `0 0 10px ${timerColor}`
              }}
            />
          </div>

          {/* High-Contrast Prompt Text Container */}
          <div
            style={{
              textAlign: 'center',
              margin: '0.5rem 0',
              padding: '1.25rem 1rem',
              background: 'rgba(0, 0, 0, 0.75)',
              borderRadius: '0.85rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <p
              className="font-heading"
              style={{
                fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)',
                fontWeight: 800,
                lineHeight: 1.4,
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.9)'
              }}
            >
              "{question.text}"
            </p>
            {turnPlayer && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#f472b6', fontWeight: 600 }}>
                Assigned to: <strong style={{ color: '#fff', textDecoration: 'underline' }}>{turnPlayer.name}</strong> {turnPlayer.avatar}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isLocalTurn ? (
            isPendingApproval ? (
              <div style={{ textAlign: 'center', marginTop: '1.25rem', padding: '1rem', background: 'rgba(236,72,153,0.15)', borderRadius: '0.75rem', border: '1px solid #ec4899' }}>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                  ⏳ Submitted! Waiting for your Opponent to Accept & Verify your Dare live...
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  onClick={handleForfeit}
                  className="glass-button"
                  style={{ flex: 1, background: 'rgba(244, 63, 94, 0.25)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                >
                  <XCircle size={18} /> Forfeit (-5 pts)
                </button>
                <button
                  onClick={handleComplete}
                  className="glass-button btn-primary-gradient"
                  style={{ flex: 1.5 }}
                >
                  <CheckCircle size={18} /> Submit to Opponent for Approval
                </button>
                {onReroll && (
                  <button
                    onClick={onReroll}
                    className="glass-button"
                    title="Reroll Question"
                    style={{ padding: '0.75rem' }}
                  >
                    <RefreshCw size={18} />
                  </button>
                )}
              </div>
            )
          ) : (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(18, 22, 38, 0.95), rgba(139, 92, 246, 0.3))',
                borderRadius: '0.85rem',
                border: '2px solid #8b5cf6',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
                textAlign: 'center'
              }}
            >
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                Did <strong style={{ color: '#f472b6' }}>{turnPlayer?.name || 'Opponent'}</strong> perform this Dare live on video?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleOpponentReject}
                  className="glass-button"
                  style={{ flex: 1, background: 'rgba(244, 63, 94, 0.3)', borderColor: '#f43f5e', padding: '0.65rem' }}
                >
                  <XCircle size={18} /> ❌ Reject (-5 pts)
                </button>
                <button
                  onClick={handleOpponentAccept}
                  className="glass-button btn-primary-gradient"
                  style={{ flex: 1.5, padding: '0.65rem' }}
                >
                  <CheckCircle size={18} /> ✅ Accept (+10 pts)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
