import React, { useState } from 'react';
import { Star, Flame, ShieldAlert, Award, X, Check } from 'lucide-react';
import { Player } from '../types/game';

interface RateOpponentModalProps {
  opponent: Player;
  onClose: () => void;
  onSubmitRating: (data: { badgeTag: string; rating: number }) => void;
}

const BADGES = [
  { id: 'spicy', label: '🌶️ Super Spicy', desc: 'Fun, bold & wild participant' },
  { id: 'sport', label: '🔥 Great Sport', desc: 'Energetic & completes challenges' },
  { id: 'polite', label: '👏 Polite & Respectful', desc: 'Kind, courteous & respectful' },
  { id: 'reported', label: '🚩 Report Opponent', desc: 'Inappropriate or harmful behavior' }
];

export const RateOpponentModal: React.FC<RateOpponentModalProps> = ({
  opponent,
  onClose,
  onSubmitRating
}) => {
  const [selectedBadge, setSelectedBadge] = useState<string>('spicy');
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRating({ badgeTag: selectedBadge, rating });
    onClose();
  };

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
          maxWidth: '440px',
          padding: '2rem 1.5rem',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
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

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem' }}>{opponent.avatar}</div>
          <h3 className="font-heading" style={{ fontSize: '1.35rem', color: '#fff' }}>
            Rate & Mark {opponent.name}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Leave a badge tag or report your experience with this opponent.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: star <= rating ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Star size={28} fill={star <= rating ? '#f59e0b' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Badge Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {BADGES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBadge(b.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  background: selectedBadge === b.id ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.04)',
                  border: selectedBadge === b.id ? '1px solid #ec4899' : '1px solid var(--border-glass)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{b.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.desc}</div>
                </div>
                {selectedBadge === b.id && <Check size={18} color="#ec4899" />}
              </button>
            ))}
          </div>

          <button type="submit" className="glass-button btn-primary-gradient" style={{ width: '100%', padding: '0.85rem' }}>
            Submit Rating & Mark Opponent
          </button>
        </form>
      </div>
    </div>
  );
};
