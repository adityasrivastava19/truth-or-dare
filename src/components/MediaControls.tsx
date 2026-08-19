import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, Smile, Volume2, VolumeX, LogOut, Settings, SkipForward } from 'lucide-react';
import { sounds } from '../utils/sound';

interface MediaControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onSendReaction: (emoji: string) => void;
  onOpenSettings: () => void;
  onSkipPartner?: () => void;
  onLeaveRoom: () => void;
}

const EMOJI_REACTIONS = ['🔥', '😂', '😱', '👏', '🎯', '❤️', '🌶️', '🎉'];

export const MediaControls: React.FC<MediaControlsProps> = ({
  isMuted,
  isVideoOff,
  isHost,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onSendReaction,
  onOpenSettings,
  onSkipPartner,
  onLeaveRoom
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '0.5rem 1.25rem',
        background: 'rgba(18, 22, 38, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '2rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        width: 'fit-content',
        margin: '0 auto',
        zIndex: 50
      }}
    >
      {/* Mic Control */}
      <button
        onClick={onToggleMic}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: 'none',
          background: isMuted ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.1)',
          color: isMuted ? '#f43f5e' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Camera Control */}
      <button
        onClick={onToggleVideo}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: 'none',
          background: isVideoOff ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.1)',
          color: isVideoOff ? '#f43f5e' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
      >
        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
      </button>

      {/* Screen Share */}
      <button
        onClick={onToggleScreenShare}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        title="Share Screen"
      >
        <Monitor size={20} />
      </button>

      {/* Live Reactions Picker */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(236, 72, 153, 0.2)',
            color: '#ec4899',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Send Reaction Emoji"
        >
          <Smile size={20} />
        </button>

        {showReactionPicker && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(18, 22, 38, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '1rem',
              padding: '0.5rem',
              display: 'flex',
              gap: '0.4rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
            }}
          >
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSendReaction(emoji);
                  setShowReactionPicker(false);
                }}
                style={{
                  fontSize: '1.4rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.3rem',
                  borderRadius: '0.4rem',
                  transition: 'transform 0.15s'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sound FX Toggle */}
      <button
        onClick={handleToggleSound}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.1)',
          color: soundEnabled ? '#10b981' : '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        title={soundEnabled ? 'Mute Game Sound FX' : 'Enable Game Sound FX'}
      >
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* Host Settings */}
      {isHost && (
        <button
          onClick={onOpenSettings}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Room Host Settings"
        >
          <Settings size={20} />
        </button>
      )}

      {/* Skip / Next Partner */}
      {onSkipPartner && (
        <button
          onClick={onSkipPartner}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: '1.5rem',
            border: 'none',
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
            transition: 'all 0.2s',
            marginLeft: '0.2rem'
          }}
          title="Skip Partner & Find Next Match"
        >
          <SkipForward size={17} /> Next
        </button>
      )}

      {/* Leave Call */}
      <button
        onClick={onLeaveRoom}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(244, 63, 94, 0.9)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginLeft: '0.5rem'
        }}
        title="Leave Room"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};
