import React from 'react';
import { Flame, ShieldCheck, Heart } from 'lucide-react';

interface ModeConsentModalProps {
  requesterName: string;
  proposedMode: 'erotic' | 'normal';
  onRespond: (accept: boolean) => void;
}

export const ModeConsentModal: React.FC<ModeConsentModalProps> = ({
  requesterName,
  proposedMode,
  onRespond
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
        padding: '1rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(18, 22, 38, 0.95), rgba(236, 72, 153, 0.3))',
          border: '2px solid #ec4899',
          boxShadow: '0 0 35px rgba(236, 72, 153, 0.6)'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌶️</div>
        <h3 className="font-heading" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.4rem' }}>
          Mode Request from {requesterName}
        </h3>
        <p style={{ color: '#e4e4e7', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
          Your partner requested <strong style={{ color: '#f472b6' }}>Erotic & Spicy 1-on-1 Mode</strong> for this video call! Do you consent and accept?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => onRespond(true)}
            className="glass-button btn-primary-gradient"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            <Flame size={20} /> 🔥 Accept Erotic Mode
          </button>
          <button
            onClick={() => onRespond(false)}
            className="glass-button"
            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.08)' }}
          >
            <ShieldCheck size={18} /> 🧊 Keep Normal / Classic Mode
          </button>
        </div>
      </div>
    </div>
  );
};
