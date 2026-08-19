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
    <div style={{ perspective: '1000px' }} className="w-full max-w-lg mx-auto">
      <div
        className={`flip-card-inner ${isFlipped ? 'flip-card-flipped' : ''}`}
        style={{ position: 'relative', width: '100%', minHeight: '320px' }}
      >
        {/* Card Front (Hidden side) */}
        <div
          className="flip-card-front glass-panel absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/30 to-purple-600/30 border border-slate-200 dark:border-slate-800"
        >
          <div className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
            🔥 Revealing Card...
          </div>
        </div>

        {/* Card Back (Revealed Content) */}
        <div
          className={`flip-card-back glass-panel p-6 flex flex-col justify-between shadow-2xl transition-all border-2 ${
            isTruth
              ? 'bg-white/95 dark:bg-slate-900/95 border-cyan-500 shadow-cyan-500/20'
              : 'bg-white/95 dark:bg-slate-900/95 border-pink-500 shadow-pink-500/20'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-md ${
                isTruth ? 'bg-cyan-500 shadow-cyan-500/40' : 'bg-pink-500 shadow-pink-500/40'
              }`}
            >
              {isTruth ? <HelpCircle size={15} /> : <Flame size={15} />}
              {question.type} • {question.category}
            </span>

            {/* Timer Badge */}
            <div
              className="flex items-center gap-1 text-sm font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
              style={{ color: timerColor }}
            >
              <Timer size={16} /> {timeLeft}s
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${timerPercent}%`,
                backgroundColor: timerColor,
                boxShadow: `0 0 10px ${timerColor}`
              }}
            />
          </div>

          {/* Prompt Text Container */}
          <div className="text-center my-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md">
            <p className="font-heading text-lg sm:text-xl font-extrabold leading-relaxed text-slate-900 dark:text-slate-100">
              "{question.text}"
            </p>
            {turnPlayer && (
              <p className="mt-3 text-xs font-semibold text-pink-600 dark:text-pink-400">
                Assigned to: <strong className="text-slate-900 dark:text-slate-100 underline font-extrabold">{turnPlayer.name}</strong> {turnPlayer.avatar}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isLocalTurn ? (
            isPendingApproval ? (
              <div className="text-center mt-4 p-3.5 rounded-xl bg-pink-500/10 border border-pink-500 text-pink-700 dark:text-pink-300 font-bold text-xs">
                ⏳ Submitted! Waiting for your Opponent to Accept & Verify your Dare live...
              </div>
            ) : (
              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={handleForfeit}
                  className="glass-button flex-1 bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold"
                >
                  <XCircle size={16} /> Forfeit (-5 pts)
                </button>
                <button
                  onClick={handleComplete}
                  className="glass-button btn-primary-gradient flex-[1.5] text-xs font-bold"
                >
                  <CheckCircle size={16} /> Submit to Opponent
                </button>
                {onReroll && (
                  <button
                    onClick={onReroll}
                    className="glass-button !p-2.5 text-slate-600 dark:text-slate-300"
                    title="Reroll Question"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/40 text-center">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-3">
                Did <strong className="text-pink-600 dark:text-pink-400">{turnPlayer?.name || 'Opponent'}</strong> perform this Dare live on video?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleOpponentReject}
                  className="glass-button flex-1 bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-bold"
                >
                  <XCircle size={16} /> Reject (-5 pts)
                </button>
                <button
                  onClick={handleOpponentAccept}
                  className="glass-button btn-primary-gradient flex-[1.5] text-xs font-bold"
                >
                  <CheckCircle size={16} /> Accept (+10 pts)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
