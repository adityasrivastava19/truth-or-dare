import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Crown, Award, Flame, Maximize2, Minimize2 } from 'lucide-react';
import { Player, FloatingReaction } from '../types/game';

interface VideoGridProps {
  localPlayer: Player;
  localStream: MediaStream | null;
  remotePlayers: Player[];
  remoteStreams: Map<string, MediaStream>;
  currentTurnPlayerId: string | null;
  floatingReactions: FloatingReaction[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localPlayer,
  localStream,
  remotePlayers,
  remoteStreams,
  currentTurnPlayerId,
  floatingReactions
}) => {
  const allPlayers = [localPlayer, ...remotePlayers];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          allPlayers.length === 1
            ? '1fr'
            : allPlayers.length === 2
            ? '1fr 1fr'
            : 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.75rem',
        width: '100%',
        height: '100%',
        alignContent: 'center'
      }}
    >
      {allPlayers.map((player) => {
        const isLocal = player.id === localPlayer.id;
        const stream = isLocal ? localStream : remoteStreams.get(player.id);
        const isCurrentTurn = player.id === currentTurnPlayerId;
        const playerReactions = floatingReactions.filter((r) => r.targetPlayerId === player.id);

        return (
          <VideoCard
            key={player.id}
            player={player}
            stream={stream}
            isLocal={isLocal}
            isCurrentTurn={isCurrentTurn}
            reactions={playerReactions}
          />
        );
      })}
    </div>
  );
};

interface VideoCardProps {
  player: Player;
  stream: MediaStream | undefined | null;
  isLocal: boolean;
  isCurrentTurn: boolean;
  reactions: FloatingReaction[];
}

const VideoCard: React.FC<VideoCardProps> = ({ player, stream, isLocal, isCurrentTurn, reactions }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');

  useEffect(() => {
    const v = videoRef.current;
    if (v && stream) {
      v.srcObject = stream;
      v.play().catch((err) => console.warn('[VideoCard] Autoplay playback warning:', err));
    }
  }, [stream]);

  const genderBadge =
    player.gender === 'male' ? '👨' : player.gender === 'female' ? '👩' : '🌈';

  return (
    <div
      className={`glass-panel ${isCurrentTurn ? 'turn-active-halo' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        aspectRatio: '16/9',
        borderRadius: '1rem',
        overflow: 'hidden',
        background: '#090b14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Video element */}
      {stream && !player.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fitMode,
            transform: isLocal ? 'scaleX(-1)' : 'none'
          }}
        />
      ) : (
        /* Video Off Avatar Placeholder */
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 0.5rem auto'
            }}
          >
            {player.avatar}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Camera Off</p>
        </div>
      )}

      {/* Floating Emojis */}
      {reactions.map((r) => (
        <div key={r.id} className="floating-emoji" style={{ left: `${30 + Math.random() * 40}%`, bottom: '20%' }}>
          {r.emoji}
        </div>
      ))}

      {/* Top Left Status Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          zIndex: 10
        }}
      >
        {player.isHost && (
          <span
            style={{
              background: 'rgba(245, 158, 11, 0.85)',
              color: '#fff',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <Crown size={12} /> HOST
          </span>
        )}

        {isCurrentTurn && (
          <span
            style={{
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#fff',
              padding: '0.2rem 0.6rem',
              borderRadius: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Flame size={12} /> ON TURN
          </span>
        )}
      </div>

      {/* Top Right Fit Mode Overlay Button */}
      <button
        onClick={() => setFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
        style={{
          position: 'absolute',
          top: '0.65rem',
          right: '0.65rem',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          borderRadius: '0.4rem',
          padding: '0.2rem 0.5rem',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          transition: 'all 0.2s'
        }}
        title="Toggle Full Face View"
      >
        {fitMode === 'contain' ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
        {fitMode === 'contain' ? 'Full Face' : 'Fill'}
      </button>

      {/* Bottom Bar Player Info */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(10px)',
          padding: '0.4rem 0.75rem',
          borderRadius: '0.6rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{player.avatar}</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
            {player.name} {isLocal && '(You)'}
          </span>
          <span style={{ fontSize: '0.85rem' }}>{genderBadge}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.15)',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.3rem'
            }}
          >
            <Award size={13} /> {player.score} pts
          </span>

          <div style={{ color: player.isMuted ? '#f43f5e' : '#10b981' }}>
            {player.isMuted ? <MicOff size={15} /> : <Mic size={15} />}
          </div>
        </div>
      </div>
    </div>
  );
};
