import React, { useState, useEffect } from 'react';
import { WheelSpinner } from './WheelSpinner';
import { CardViewer } from './CardViewer';
import { RoomState, Player } from '../types/game';
import { Play, ChevronDown, ChevronUp, Dice5 } from 'lucide-react';

interface GameStageProps {
  room: RoomState;
  localPlayer: Player;
  onSpin: () => void;
  onVerdict: (verdict: 'completed' | 'forfeited') => void;
  onVerifyDare?: (accepted: boolean) => void;
  onReroll: () => void;
}

export const GameStage: React.FC<GameStageProps> = ({
  room,
  localPlayer,
  onSpin,
  onVerdict,
  onVerifyDare,
  onReroll
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const turnPlayer = room.players.find((p) => p.id === room.currentTurnPlayerId);
  const isLocalTurn = room.currentTurnPlayerId === localPlayer.id;

  // Auto-expand game stage when answering begins
  useEffect(() => {
    if (room.gameState === 'answering' || room.gameState === 'spinning') {
      setIsMinimized(false);
    }
  }, [room.gameState, room.currentQuestion]);

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="flex items-center gap-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-pink-500/60 rounded-full px-4 py-2 text-slate-900 dark:text-slate-100 cursor-pointer shadow-xl shadow-pink-500/10 mx-auto z-40 transition-all hover:scale-105 animate-fadeIn"
        title="Tap to Maximize Game Card"
      >
        <Dice5 size={20} className="text-pink-500" />
        <span className="text-xs font-extrabold font-heading">
          {room.gameState === 'idle'
            ? '🎲 Open Game Stage'
            : room.gameState === 'spinning'
            ? '🌀 Wheel Spinning...'
            : `🔥 ${room.currentQuestion?.type.toUpperCase() || 'Card'} Active`}
        </span>
        <ChevronUp size={18} className="text-pink-400" />
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 flex flex-col items-center justify-center h-full overflow-y-auto relative bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-xl">
      {/* Top Right Minimize Button */}
      <button
        onClick={() => setIsMinimized(true)}
        className="absolute top-3 right-3 bg-slate-200/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition-colors hover:bg-slate-300 dark:hover:bg-slate-700 z-15"
        title="Minimize Game Card"
      >
        <ChevronDown size={14} />
        <span>Minimize</span>
      </button>

      {/* Mode Banner Indicator */}
      <div
        className={`absolute top-3 left-3 text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1 border ${
          room.turnMode === 'staggered'
            ? 'bg-pink-500/10 border-pink-500/40 text-pink-600 dark:text-pink-400'
            : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
        }`}
      >
        {room.turnMode === 'staggered' ? (
          <>🔄 Staggered Mode: Boy ➔ Girl</>
        ) : (
          <>🎲 Random Spin Mode</>
        )}
      </div>

      {/* State: IDLE */}
      {room.gameState === 'idle' && (
        <div className="text-center my-6 w-full max-w-md">
          {room.players.length < 2 ? (
            <div>
              <div className="text-4xl mb-2 animate-bounce">⏳</div>
              <h3 className="font-heading text-lg font-extrabold text-pink-600 dark:text-pink-400 mb-1">
                Waiting for Partner to Connect...
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                Share your private room code or link with your partner to start the video call!
              </p>

              <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-pink-500/40 flex items-center justify-between gap-2 mb-3">
                <div className="text-left">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">ROOM CODE</span>
                  <strong className="text-lg text-slate-900 dark:text-slate-100 tracking-wider font-mono">{room.code}</strong>
                </div>
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Room invite link copied to clipboard!');
                  }}
                  className="glass-button btn-primary-gradient !py-1.5 !px-3 text-xs"
                >
                  Copy Link
                </button>
              </div>

              <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                ✨ Game will unlock automatically as soon as partner enters video call.
              </div>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">🎡</div>
              <h3 className="font-heading text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                Partner Connected! ❤️
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                Spin the wheel to start your 1-on-1 Truth or Dare session!
              </p>
              <button
                onClick={onSpin}
                className="glass-button btn-primary-gradient text-sm !py-3 !px-8 font-bold"
              >
                <Play size={18} fill="currentColor" /> Spin The Wheel
              </button>
            </div>
          )}
        </div>
      )}

      {/* State: SPINNING */}
      {room.gameState === 'spinning' && (
        <div className="text-center w-full">
          <WheelSpinner
            players={room.players}
            targetPlayerId={room.currentTurnPlayerId}
            isSpinning={true}
            segmentTypes={room.wheelSegmentTypes}
          />
          <p className="font-heading mt-4 text-lg font-black text-pink-600 dark:text-pink-400 animate-pulse">
            🎡 Spinning... Who gets it?
          </p>
          <p className="text-slate-400 text-xs mt-1">
            The wheel decides the player AND Truth or Dare!
          </p>
        </div>
      )}



      {/* State: ANSWERING / VERDICT / VERIFYING */}
      {(room.gameState === 'answering' || room.gameState === 'verdict' || room.gameState === 'verifying') && room.currentQuestion && (
        <CardViewer
          question={room.currentQuestion}
          turnPlayer={turnPlayer}
          isLocalTurn={isLocalTurn}
          timerDuration={room.questionTimer}
          onVerdict={onVerdict}
          onVerifyDare={onVerifyDare}
          onReroll={onReroll}
        />
      )}
    </div>
  );
};
