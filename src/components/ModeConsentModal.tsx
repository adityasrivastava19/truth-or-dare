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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[2500] p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 text-center bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border-2 border-pink-500 shadow-2xl shadow-pink-500/20">
        <div className="text-4xl mb-3">🌶️</div>
        <h3 className="font-heading text-xl font-extrabold mb-2">
          Mode Request from {requesterName}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
          Your partner requested <strong className="text-pink-600 dark:text-pink-400">Erotic & Spicy 1-on-1 Mode</strong> for this video call! Do you consent and accept?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onRespond(true)}
            className="glass-button btn-primary-gradient w-full !py-3 text-sm font-bold"
          >
            <Flame size={20} /> 🔥 Accept Erotic Mode
          </button>
          <button
            onClick={() => onRespond(false)}
            className="glass-button w-full !py-2.5 text-xs font-semibold"
          >
            <ShieldCheck size={18} /> 🧊 Keep Normal / Classic Mode
          </button>
        </div>
      </div>
    </div>
  );
};
