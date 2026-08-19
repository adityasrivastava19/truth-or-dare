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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[2500] p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 relative bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5">
          <div className="text-4xl mb-2">{opponent.avatar}</div>
          <h3 className="font-heading text-xl font-extrabold">
            Rate & Mark {opponent.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Leave a badge tag or report your experience with this opponent.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="text-center mb-5">
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-transform hover:scale-125 ${star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                >
                  <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Badge Selection */}
          <div className="flex flex-col gap-2 mb-6">
            {BADGES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBadge(b.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedBadge === b.id
                    ? 'bg-pink-500/15 border-pink-500 ring-2 ring-pink-500/30'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{b.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.desc}</div>
                </div>
                {selectedBadge === b.id && <Check size={18} className="text-pink-500" />}
              </button>
            ))}
          </div>

          <button type="submit" className="glass-button btn-primary-gradient w-full !py-3 text-sm font-bold">
            Submit Rating & Mark Opponent
          </button>
        </form>
      </div>
    </div>
  );
};
