import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, Sparkles, Users, RefreshCw, Zap, ArrowRight, ShieldCheck, Heart, Dice5, Sun, Moon } from 'lucide-react';
import { GenderType, TurnMode, GameCategory } from '../types/game';
import { rtcManager } from '../services/webrtc';
import { useTheme } from '../context/ThemeContext';

interface LobbyProps {
  onJoinRoom: (data: { name: string; avatar: string; gender: GenderType; code: string }) => void;
  onCreateRoom: (data: { name: string; avatar: string; gender: GenderType; turnMode: TurnMode; category: GameCategory }) => void;
  onJoinMatchmaking: (data: { name: string; avatar: string; gender: GenderType; preference: 'opposite' | 'any'; matchMode: 'erotic' | 'normal' }) => void;
  initialRoomCode?: string;
}

const AVATARS = ['🔥', '✨', '👑', '⚡', '😎', '🚀', '🦄', '🐺', '🌶️', '💎'];

export const Lobby: React.FC<LobbyProps> = ({
  onJoinRoom,
  onCreateRoom,
  onJoinMatchmaking,
  initialRoomCode = ''
}) => {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState<string>(() => localStorage.getItem('tod_player_name') || '');
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem('tod_player_avatar') || '🔥');
  const [gender, setGender] = useState<GenderType>(() => (localStorage.getItem('tod_player_gender') as GenderType) || 'male');
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);

  // Settings for room creation
  const [turnMode, setTurnMode] = useState<TurnMode>('staggered');
  const [category, setCategory] = useState<GameCategory>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Pre-flight video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('tod_player_name', name);
    localStorage.setItem('tod_player_avatar', avatar);
    localStorage.setItem('tod_player_gender', gender);
  }, [name, avatar, gender]);

  useEffect(() => {
    async function setupPreview() {
      try {
        const stream = await rtcManager.initLocalStream();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0) setSelectedCameraId(videoDevices[0].deviceId);
      } catch (err) {
        console.warn('Pre-flight camera preview error:', err);
      }
    }
    setupPreview();
  }, []);

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedCameraId(devId);
    const stream = await rtcManager.initLocalStream(devId);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter your display name!');
    if (!roomCode.trim()) return alert('Please enter a 6-character room code!');
    onJoinRoom({ name: name.trim(), avatar, gender, code: roomCode.trim().toUpperCase() });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter your display name!');
    onCreateRoom({ name: name.trim(), avatar, gender, turnMode, category });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Top Bar with Theme Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={toggleTheme}
          className="glass-button"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '2rem',
            background: theme === 'dark' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            color: '#ec4899',
            fontSize: '0.875rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}
        >
          <Sparkles size={16} /> Multiplayer WebRTC Video Call Party
        </div>
        <h1
          className="font-heading"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #ffffff 0%, #ec4899 50%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #ec4899 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.15
          }}
        >
          TRUTH OR DARE LIVE
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>
          Connect with friends or match with new people via real-time video call & staggered gender turns!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Player Profile & Camera Pre-flight */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 className="font-heading" style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video style={{ color: '#ec4899' }} size={22} /> Camera & Profile Setup
          </h2>

          {/* Video Preview Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.15)',
              marginBottom: '1.25rem'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.6rem',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                borderRadius: '0.5rem',
                fontSize: '0.8rem'
              }}
            >
              <span>{avatar}</span>
              <span style={{ fontWeight: 600 }}>{name || 'Your Name'}</span>
              <span style={{ opacity: 0.7 }}>({gender})</span>
            </div>
          </div>

          {availableCameras.length > 1 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Camera Source
              </label>
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff'
                }}
              >
                {availableCameras.map((cam, idx) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
            />
          </div>

          {/* Avatar Selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Choose Avatar Emoji
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`text-xl p-2 rounded-xl border transition-all ${
                    avatar === emoji
                      ? 'bg-pink-500/20 border-pink-500 scale-110 shadow-md shadow-pink-500/20'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Tag Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Gender / Profile Tag (Used for Staggered Turns)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 px-3 rounded-xl font-semibold text-sm transition-all border ${
                  gender === 'male'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                }`}
              >
                👨 Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 px-3 rounded-xl font-semibold text-sm transition-all border ${
                  gender === 'female'
                    ? 'bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-400 shadow-md shadow-pink-500/10'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                }`}
              >
                👩 Female
              </button>
              <button
                type="button"
                onClick={() => setGender('neutral')}
                className={`col-span-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all border ${
                  gender === 'neutral'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-400 shadow-md shadow-purple-500/10'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                }`}
              >
                🌈 Non-Binary / Neutral
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Room Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Matchmaking Card */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(244, 232, 255, 0.9) 0%, rgba(252, 231, 243, 0.9) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                <Zap size={22} />
              </div>
              <div>
                <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  1-on-1 Speed Matchmaking
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Auto-pair with an opposite gender / complementary player in a private call!
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  if (!name.trim()) return alert('Please enter your display name first!');
                  onJoinMatchmaking({ name: name.trim(), avatar, gender, preference: 'opposite', matchMode: 'erotic' });
                }}
                className="glass-button btn-primary-gradient"
                style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}
              >
                🌶️ Erotic 1-on-1
              </button>
              <button
                onClick={() => {
                  if (!name.trim()) return alert('Please enter your display name first!');
                  onJoinMatchmaking({ name: name.trim(), avatar, gender, preference: 'opposite', matchMode: 'normal' });
                }}
                className="glass-button btn-cyan-gradient"
                style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}
              >
                🧊 Normal 1-on-1
              </button>
            </div>
          </div>

          {/* Join Room Box */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users style={{ color: '#06b6d4' }} size={20} /> Join Existing Room
            </h3>
            <form onSubmit={handleJoin}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit Code (e.g. ABC123)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold uppercase tracking-wider text-base"
                />
                <button type="submit" className="glass-button btn-cyan-gradient" style={{ whiteSpace: 'nowrap' }}>
                  Join <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Create 1-on-1 Romantic Room Box */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(245, 158, 11, 0.2))', border: '1px solid rgba(236, 72, 153, 0.5)' }}>
            <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6' }}>
              🌶️ Host 1-on-1 Private Flirty Room
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#e4e4e7', marginBottom: '1.25rem' }}>
              Private 2-player video room with alternating turns & spicy romantic truth/dare cards!
            </p>
            <button
              onClick={() => {
                if (!name.trim()) return alert('Please enter your display name first!');
                onCreateRoom({ name: name.trim(), avatar, gender, turnMode: 'staggered', category: 'spicy' });
              }}
              className="glass-button btn-primary-gradient"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <Heart size={18} /> Create 1-on-1 Private Call Room
            </button>
          </div>

          {/* Create Party Room Box */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ color: '#f59e0b' }} size={20} /> Host Party Room (Group)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Configure staggered turns, game categories, and invite friends via link or room code.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="glass-button btn-gold-gradient"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Configure & Create Room
            </button>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold mb-5 flex items-center gap-2">
              ⚙️ Party Room Settings
            </h2>
            <form onSubmit={handleCreate}>
              {/* Turn Mode Selector */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Turn Selection Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTurnMode('staggered')}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      turnMode === 'staggered'
                        ? 'bg-pink-500/15 border-pink-500 ring-2 ring-pink-500/30'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="font-bold text-sm text-pink-600 dark:text-pink-400">🔄 Staggered Mode</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Alternates Boy ➔ Girl turns automatically
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurnMode('random')}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      turnMode === 'random'
                        ? 'bg-cyan-500/15 border-cyan-500 ring-2 ring-cyan-500/30'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="font-bold text-sm text-cyan-600 dark:text-cyan-400">🎲 Random Spin</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Picks any random player in room
                    </div>
                  </button>
                </div>
              </div>

              {/* Category Selector */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Question Category Deck
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GameCategory)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">🌟 All Categories Mix</option>
                  <option value="classic">🎉 Classic Party</option>
                  <option value="party">🔥 Crazy & Wild</option>
                  <option value="deep">🧠 Deep & Personal</option>
                  <option value="spicy">🌶️ Spicy & Flirty</option>
                  <option value="couples">❤️ Couples Special</option>
                  <option value="icebreaker">🧊 Fun Icebreakers</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="glass-button flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="glass-button btn-primary-gradient flex-1">
                  Create & Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
