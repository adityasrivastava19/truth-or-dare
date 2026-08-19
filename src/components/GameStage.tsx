import React, { useState, useEffect } from 'react';
import { WheelSpinner } from './WheelSpinner';
import { CardViewer } from './CardViewer';
import { RoomState, Player } from '../types/game';
import { Play, Sparkles, HelpCircle, Flame, RefreshCw, Dice5, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

interface GameStageProps {
  room: RoomState;
  localPlayer: Player;
  onSpin: () => void;
  onSelectChoice: (choice: 'truth' | 'dare') => void;
  onVerdict: (verdict: 'completed' | 'forfeited') => void;
  onVerifyDare?: (accepted: boolean) => void;
  onReroll: () => void;
}

export const GameStage: React.FC<GameStageProps> = ({
  room,
  localPlayer,
  onSpin,
  onSelectChoice,
  onVerdict,
  onVerifyDare,
  onReroll
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const turnPlayer = room.players.find((p) => p.id === room.currentTurnPlayerId);
  const isLocalTurn = room.currentTurnPlayerId === localPlayer.id;

  // Auto-expand game stage when a new question or selection begins
  useEffect(() => {
    if (room.gameState === 'answering' || room.gameState === 'choosing' || room.gameState === 'spinning') {
      setIsMinimized(false);
    }
  }, [room.gameState, room.currentQuestion]);

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'rgba(18, 22, 38, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(236, 72, 153, 0.6)',
          borderRadius: '2rem',
          padding: '0.5rem 1.1rem',
          color: '#ffffff',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
          margin: '0 auto',
          zIndex: 40,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'smoothAppear 0.3s ease-out'
        }}
        title="Tap to Maximize Game Card"
      >
        <Dice5 size={20} color="#ec4899" />
        <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
          {room.gameState === 'idle'
            ? '🎲 Open Game Stage'
            : room.gameState === 'spinning'
            ? '🌀 Wheel Spinning...'
            : room.gameState === 'choosing'
            ? '🎯 Choose Truth / Dare'
            : `🔥 ${room.currentQuestion?.type.toUpperCase() || 'Card'} Active`}
        </span>
        <ChevronUp size={18} color="#f472b6" />
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Top Right Minimize Button */}
      <button
        onClick={() => setIsMinimized(true)}
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          borderRadius: '0.5rem',
          padding: '0.25rem 0.6rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          zIndex: 15,
          transition: 'all 0.2s'
        }}
        title="Minimize Game Card"
      >
        <ChevronDown size={14} />
        <span>Minimize</span>
      </button>

      {/* Mode Banner Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          fontSize: '0.8rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '1rem',
          background: room.turnMode === 'staggered' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(6, 182, 212, 0.2)',
          border: room.turnMode === 'staggered' ? '1px solid #ec4899' : '1px solid #06b6d4',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontWeight: 600
        }}
      >
        {room.turnMode === 'staggered' ? (
          <>🔄 Staggered Mode: Boy ➔ Girl</>
        ) : (
          <>🎲 Random Spin Mode</>
        )}
      </div>

      {/* State: IDLE */}
      {room.gameState === 'idle' && (
        <div style={{ textAlign: 'center', margin: '2rem 0', width: '100%', maxWidth: '440px' }}>
          {room.players.length < 2 ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
              <h3 className="font-heading" style={{ fontSize: '1.4rem', color: '#f472b6', marginBottom: '0.4rem' }}>
                Waiting for Partner to Connect...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Share your private room code or link with your partner to start the video call!
              </p>

              <div
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ROOM CODE</span>
                  <strong style={{ fontSize: '1.2rem', color: '#fff', letterSpacing: '1px' }}>{room.code}</strong>
                </div>
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Room invite link copied to clipboard!');
                  }}
                  className="glass-button btn-primary-gradient"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Copy Link
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#06b6d4' }}>
                ✨ Game will unlock automatically as soon as partner enters video call.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎡</div>
              <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>
                Partner Connected! ❤️
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Spin the wheel to start your 1-on-1 Truth or Dare session!
              </p>
              <button
                onClick={onSpin}
                className="glass-button btn-primary-gradient"
                style={{ fontSize: '1.1rem', padding: '0.85rem 2rem' }}
              >
                <Play size={20} fill="#fff" /> Spin The Wheel
              </button>
            </div>
          )}
        </div>
      )}

      {/* State: SPINNING */}
      {room.gameState === 'spinning' && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <WheelSpinner
            players={room.players}
            targetPlayerId={room.currentTurnPlayerId}
            isSpinning={true}
          />
          <p className="font-heading" style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#ec4899' }}>
            Spinning Wheel... Who is next?
          </p>
        </div>
      )}

      {/* State: CHOOSING */}
      {room.gameState === 'choosing' && (
        <div style={{ textAlign: 'center', margin: '1.5rem 0', width: '100%', maxWidth: '480px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
          <h3 className="font-heading" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.25rem' }}>
            {turnPlayer?.avatar} {turnPlayer?.name} Landed on the Wheel!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {isLocalTurn ? 'It is your turn! Make your choice:' : `Waiting for ${turnPlayer?.name} to choose...`}
          </p>

          {isLocalTurn ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => onSelectChoice('truth')}
                className="glass-button btn-cyan-gradient"
                style={{ padding: '1.25rem', fontSize: '1.2rem' }}
              >
                <HelpCircle size={24} /> TRUTH
              </button>
              <button
                onClick={() => onSelectChoice('dare')}
                className="glass-button btn-primary-gradient"
                style={{ padding: '1.25rem', fontSize: '1.2rem' }}
              >
                <Flame size={24} /> DARE
              </button>
              <button
                onClick={() => onSelectChoice(Math.random() > 0.5 ? 'truth' : 'dare')}
                className="glass-button btn-gold-gradient"
                style={{ gridColumn: 'span 2', padding: '0.75rem' }}
              >
                <Dice5 size={20} /> Surprise Me (Random)
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px border-glass'
              }}
            >
              <div className="font-heading" style={{ fontSize: '1.1rem', color: '#f472b6' }}>
                ⏳ Player is picking Truth or Dare...
              </div>
            </div>
          )}
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
