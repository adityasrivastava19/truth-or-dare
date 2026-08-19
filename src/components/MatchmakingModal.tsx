import React from 'react';
import { Heart, Loader2, X } from 'lucide-react';
import { GenderType } from '../types/game';

interface MatchmakingModalProps {
  gender: GenderType;
  preference: 'opposite' | 'any';
  onCancel: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  gender,
  preference,
  onCancel
}) => {
  const targetText = preference === 'opposite' ? (gender === 'male' ? 'Female 👩' : gender === 'female' ? 'Male 👨' : 'Complementary 🌈') : 'Any ⚡';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(18, 22, 38, 0.95), rgba(236, 72, 153, 0.2))'
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Pulse Radar Animation */}
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem auto' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(236, 72, 153, 0.2)',
              animation: 'pulseRadar 2s infinite ease-out'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '15px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 25px rgba(236, 72, 153, 0.6)'
            }}
          >
            <Heart size={36} />
          </div>
        </div>

        <h3 className="font-heading" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
          Finding Match...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Searching for a <strong style={{ color: '#ec4899' }}>{targetText}</strong> player for a private 1-on-1 Truth or Dare video call...
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#06b6d4' }}>
          <Loader2 className="animate-spin" size={18} /> Connecting WebRTC match engine...
        </div>

        <button
          onClick={onCancel}
          className="glass-button"
          style={{ marginTop: '2rem', width: '100%', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#f43f5e' }}
        >
          Cancel Queue
        </button>
      </div>

      <style>{`
        @keyframes pulseRadar {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
