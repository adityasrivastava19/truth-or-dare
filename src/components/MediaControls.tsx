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
    <div className="media-controls-bar bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl dark:shadow-slate-950/50 backdrop-blur-xl">
      {/* Mic Control */}
      <button
        onClick={onToggleMic}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
          isMuted
            ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 ring-2 ring-rose-500/40'
            : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700'
        }`}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Camera Control */}
      <button
        onClick={onToggleVideo}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
          isVideoOff
            ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 ring-2 ring-rose-500/40'
            : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700'
        }`}
        title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
      >
        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
      </button>

      {/* Screen Share */}
      <button
        onClick={onToggleScreenShare}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-200/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
        title="Share Screen"
      >
        <Monitor size={20} />
      </button>

      {/* Live Reactions Picker */}
      <div className="relative">
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-pink-500/15 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 hover:bg-pink-500/25 transition-all ring-1 ring-pink-500/30"
          title="Send Reaction Emoji"
        >
          <Smile size={20} />
        </button>

        {showReactionPicker && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-2 flex gap-1.5 shadow-xl shadow-slate-900/20 animate-fadeIn z-50">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSendReaction(emoji);
                  setShowReactionPicker(false);
                }}
                className="text-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-transform hover:scale-125"
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
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
          soundEnabled
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
            : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
        }`}
        title={soundEnabled ? 'Mute Game Sound FX' : 'Enable Game Sound FX'}
      >
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* Host Settings */}
      {isHost && (
        <button
          onClick={onOpenSettings}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-all"
          title="Room Host Settings"
        >
          <Settings size={20} />
        </button>
      )}

      {/* Skip / Next Partner */}
      {onSkipPartner && (
        <button
          onClick={onSkipPartner}
          className="py-2 px-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center gap-1.5 text-xs font-extrabold hover:opacity-95 shadow-md shadow-pink-500/30 transition-all ml-1"
          title="Skip Partner & Find Next Match"
        >
          <SkipForward size={16} /> Next
        </button>
      )}

      {/* Leave Call */}
      <button
        onClick={onLeaveRoom}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/40 transition-all ml-2"
        title="Leave Room"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};
