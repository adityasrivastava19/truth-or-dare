import React, { useState } from 'react';
import { Trophy, MessageSquare, PlusCircle, Send, Award, Flame, Check } from 'lucide-react';
import { Player, ChatMessage, CustomPrompt } from '../types/game';

interface SidebarProps {
  players: Player[];
  messages: ChatMessage[];
  customPrompts: CustomPrompt[];
  onSendMessage: (text: string) => void;
  onAddCustomPrompt: (type: 'truth' | 'dare', text: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  players,
  messages,
  customPrompts,
  onSendMessage,
  onAddCustomPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'chat' | 'custom'>('leaderboard');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');
  const [promptType, setPromptType] = useState<'truth' | 'dare'>('truth');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onAddCustomPrompt(promptType, promptText.trim());
    setPromptText('');
    alert(`Custom ${promptType.toUpperCase()} added to the room deck!`);
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass-panel flex flex-col h-full min-h-[450px] bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'leaderboard'
              ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Trophy size={16} /> Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'chat'
              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare size={16} /> Chat
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'custom'
              ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PlusCircle size={16} /> Add Cards
        </button>
      </div>

      {/* Tab 1: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="p-4 flex-1 overflow-y-auto">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            🏆 Live Room Rankings
          </h4>
          <div className="flex flex-col gap-2">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  idx === 0
                    ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-black text-xs w-5 ${idx === 0 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    #{idx + 1}
                  </span>
                  <span className="text-base">{player.avatar}</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{player.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {player.streak > 1 && (
                    <span className="text-[11px] text-pink-600 dark:text-pink-400 font-bold">
                      🔥 {player.streak}
                    </span>
                  )}
                  <span className="font-black text-amber-500 text-xs">
                    {player.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Chat */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-full flex-1">
          <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl text-xs transition-all ${
                  msg.isSystem
                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50'
                }`}
              >
                {!msg.isSystem && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {msg.avatar} {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.timestamp}</span>
                  </div>
                )}
                <div className="break-words font-medium">{msg.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a chat message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button type="submit" className="glass-button btn-cyan-gradient !p-2">
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Custom Cards Deck */}
      {activeTab === 'custom' && (
        <div className="p-4 flex-1 overflow-y-auto">
          <h4 className="font-heading text-xs font-bold text-amber-500 mb-1 flex items-center gap-1">
            ➕ ADD CUSTOM CARDS
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            Submit custom truths or dares to be shuffled into this room's active deck!
          </p>

          <form onSubmit={handleAddPrompt}>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPromptType('truth')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  promptType === 'truth'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                TRUTH
              </button>
              <button
                type="button"
                onClick={() => setPromptType('dare')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  promptType === 'dare'
                    ? 'bg-pink-500/20 border-pink-500 text-pink-600 dark:text-pink-400'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                DARE
              </button>
            </div>

            <textarea
              rows={3}
              placeholder={`Enter your custom ${promptType} question or task...`}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3 resize-none"
            />

            <button type="submit" className="glass-button btn-gold-gradient w-full !py-2 text-xs">
              Add To Room Deck
            </button>
          </form>

          {customPrompts.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Current Custom Prompts ({customPrompts.length}):
              </div>
              {customPrompts.map((cp) => (
                <div
                  key={cp.id}
                  className="text-[11px] p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 mb-1.5 border border-slate-200 dark:border-slate-700/40 text-slate-800 dark:text-slate-200"
                >
                  <strong className={cp.type === 'truth' ? 'text-cyan-600 dark:text-cyan-400' : 'text-pink-600 dark:text-pink-400'}>
                    [{cp.type.toUpperCase()}]
                  </strong>{' '}
                  {cp.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
