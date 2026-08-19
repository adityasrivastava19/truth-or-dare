import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Crown, Award, Flame, Maximize2, Minimize2, Repeat } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [swappedPiP, setSwappedPiP] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const primaryRemotePlayer = remotePlayers[0];
  const primaryRemoteStream = primaryRemotePlayer ? remoteStreams.get(primaryRemotePlayer.id) : null;

  // On Mobile: Full-Screen Immersive Video Call UI with Floating PiP
  if (isMobile) {
    const mainPlayer = swappedPiP ? localPlayer : (primaryRemotePlayer || localPlayer);
    const mainStream = swappedPiP ? localStream : (primaryRemoteStream || localStream);
    const mainIsLocal = mainPlayer.id === localPlayer.id;

    const pipPlayer = swappedPiP ? (primaryRemotePlayer || localPlayer) : localPlayer;
    const pipStream = swappedPiP ? (primaryRemoteStream || localStream) : localStream;
    const pipIsLocal = pipPlayer.id === localPlayer.id;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100dvh', background: '#000', overflow: 'hidden' }}>
        {/* Full Screen Main Video Feed */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <VideoCard
            player={mainPlayer}
            stream={mainStream}
            isLocal={mainIsLocal}
            isCurrentTurn={mainPlayer.id === currentTurnPlayerId}
            reactions={floatingReactions.filter((r) => r.targetPlayerId === mainPlayer.id)}
            isFullScreen
            defaultFit="cover"
          />
        </div>

        {/* Floating Picture-in-Picture Badge */}
        {remotePlayers.length > 0 && (
          <div
            onClick={() => setSwappedPiP((prev) => !prev)}
            className="mobile-pip-video"
            title="Tap to swap main and mini video"
          >
            <VideoCard
              player={pipPlayer}
              stream={pipStream}
              isLocal={pipIsLocal}
              isCurrentTurn={pipPlayer.id === currentTurnPlayerId}
              reactions={[]}
              isCompact
              defaultFit="cover"
            />
            <div
              style={{
                position: 'absolute',
                bottom: '0.2rem',
                right: '0.2rem',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
                padding: '0.2rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 35
              }}
            >
              <Repeat size={10} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop View: Grid Layout
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
  isFullScreen?: boolean;
  isCompact?: boolean;
  defaultFit?: 'contain' | 'cover';
}

const VideoCard: React.FC<VideoCardProps> = ({
  player,
  stream,
  isLocal,
  isCurrentTurn,
  reactions,
  isFullScreen = false,
  isCompact = false,
  defaultFit = 'contain'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>(defaultFit);

  useEffect(() => {
    const v = videoRef.current;
    if (v && stream) {
      v.srcObject = stream;
      v.play().catch((err) => console.warn('[VideoCard] Autoplay playback warning:', err));
    }
  }, [stream]);

  const genderBadge = player.gender === 'male' ? '👨' : player.gender === 'female' ? '👩' : '🌈';

  return (
    <div
      className={isFullScreen ? '' : isCompact ? '' : `glass-panel ${isCurrentTurn ? 'turn-active-halo' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        aspectRatio: isFullScreen || isCompact ? 'auto' : '16/9',
        borderRadius: isFullScreen ? '0' : isCompact ? '0.75rem' : '1rem',
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
        <div style={{ textAlign: 'center', padding: isCompact ? '0.2rem' : '1rem' }}>
          <div
            style={{
              width: isCompact ? '40px' : '70px',
              height: isCompact ? '40px' : '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isCompact ? '1.4rem' : '2.5rem',
              margin: '0 auto 0.5rem auto'
            }}
          >
            {player.avatar}
          </div>
          {!isCompact && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Camera Off</p>}
        </div>
      )}

      {/* Floating Emojis */}
      {!isCompact &&
        reactions.map((r) => (
          <div key={r.id} className="floating-emoji" style={{ left: `${30 + Math.random() * 40}%`, bottom: '20%' }}>
            {r.emoji}
          </div>
        ))}

      {/* Top Left Status Overlay */}
      {!isCompact && (
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
      )}

      {/* Top Right Fit Mode Overlay Button */}
      {!isCompact && (
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
      )}

      {/* Bottom Bar Player Info */}
      <div
        style={{
          position: 'absolute',
          bottom: isCompact ? '0.2rem' : '0.75rem',
          left: isCompact ? '0.2rem' : '0.75rem',
          right: isCompact ? '0.2rem' : '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isCompact ? 'rgba(0,0,0,0.7)' : 'rgba(18, 22, 38, 0.75)',
          backdropFilter: 'blur(12px)',
          padding: isCompact ? '0.15rem 0.4rem' : '0.4rem 0.75rem',
          borderRadius: isCompact ? '0.4rem' : '0.6rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
          <span style={{ fontSize: isCompact ? '0.8rem' : '1.1rem' }}>{player.avatar}</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: isCompact ? '0.7rem' : '0.85rem',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isCompact ? '60px' : '140px'
            }}
          >
            {player.name} {isLocal ? '(You)' : ''}
          </span>
          {!isCompact && <span style={{ fontSize: '0.8rem' }}>{genderBadge}</span>}
        </div>

        {!isCompact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {player.isMuted ? (
              <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center' }}>
                <MicOff size={14} />
              </span>
            ) : (
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
                <Mic size={14} />
              </span>
            )}
            {player.isVideoOff ? (
              <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center' }}>
                <VideoOff size={14} />
              </span>
            ) : (
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
                <Video size={14} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
