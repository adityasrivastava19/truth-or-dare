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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[2000] p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-8 text-center relative bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X size={20} />
        </button>

        {/* Pulse Radar Animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/50">
            <Heart size={36} />
          </div>
        </div>

        <h3 className="font-heading text-xl font-black mb-2">
          Finding Match...
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          Searching for a <strong className="text-pink-600 dark:text-pink-400">{targetText}</strong> player for a private 1-on-1 Truth or Dare video call...
        </p>

        <div className="flex items-center justify-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold text-xs">
          <Loader2 className="animate-spin" size={18} /> Connecting WebRTC match engine...
        </div>

        <button
          onClick={onCancel}
          className="glass-button w-full mt-8 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
        >
          Cancel Queue
        </button>
      </div>
    </div>
  );
};
