import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, Sparkles, Users, RefreshCw, Zap, ArrowRight, ShieldCheck, Heart, Dice5 } from 'lucide-react';
import { GenderType, TurnMode, GameCategory } from '../types/game';
import { rtcManager } from '../services/webrtc';

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
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '2rem',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            color: '#f472b6',
            fontSize: '0.875rem',
            fontWeight: 600,
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
            background: 'linear-gradient(135deg, #ffffff 0%, #ec4899 50%, #8b5cf6 100%)',
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
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.4rem', fontWeight: 500 }}>
              Display Name
            </label>
            <input
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Avatar Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.4rem', fontWeight: 500 }}>
              Choose Avatar Emoji
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  style={{
                    fontSize: '1.4rem',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '0.5rem',
                    background: avatar === emoji ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.05)',
                    border: avatar === emoji ? '2px solid #ec4899' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Tag Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.4rem', fontWeight: 500 }}>
              Gender / Profile Tag (Used for Staggered Turns)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setGender('male')}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  background: gender === 'male' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255,255,255,0.05)',
                  border: gender === 'male' ? '2px solid #06b6d4' : '1px solid var(--border-glass)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                👨 Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  background: gender === 'female' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.05)',
                  border: gender === 'female' ? '2px solid #ec4899' : '1px solid var(--border-glass)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                👩 Female
              </button>
              <button
                type="button"
                onClick={() => setGender('neutral')}
                style={{
                  gridColumn: 'span 2',
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  background: gender === 'neutral' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                  border: gender === 'neutral' ? '2px solid #8b5cf6' : '1px solid var(--border-glass)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
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
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
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
                  color: '#fff'
                }}
              >
                <Zap size={22} />
              </div>
              <div>
                <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  1-on-1 Speed Matchmaking
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#e4e4e7' }}>
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
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '1rem',
                    letterSpacing: '1px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <h2 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: '#fff' }}>
              ⚙️ Party Room Settings
            </h2>
            <form onSubmit={handleCreate}>
              {/* Turn Mode Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#d1d5db', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Turn Selection Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setTurnMode('staggered')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '0.75rem',
                      background: turnMode === 'staggered' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: turnMode === 'staggered' ? '2px solid #ec4899' : '1px solid var(--border-glass)',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f472b6' }}>🔄 Staggered Mode</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      Alternates Boy ➔ Girl turns automatically
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurnMode('random')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '0.75rem',
                      background: turnMode === 'random' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: turnMode === 'random' ? '2px solid #06b6d4' : '1px solid var(--border-glass)',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8' }}>🎲 Random Spin</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      Picks any random player in room
                    </div>
                  </button>
                </div>
              </div>

              {/* Category Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#d1d5db', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Question Category Deck
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GameCategory)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
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

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="glass-button"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="glass-button btn-primary-gradient" style={{ flex: 1 }}>
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
