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
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(0,0,0,0.2)'
        }}
      >
        <button
          onClick={() => setActiveTab('leaderboard')}
          style={{
            flex: 1,
            padding: '0.75rem 0.5rem',
            background: activeTab === 'leaderboard' ? 'rgba(236, 72, 153, 0.2)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'leaderboard' ? '2px solid #ec4899' : '2px solid transparent',
            color: activeTab === 'leaderboard' ? '#ec4899' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <Trophy size={16} /> Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            padding: '0.75rem 0.5rem',
            background: activeTab === 'chat' ? 'rgba(6, 182, 212, 0.2)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'chat' ? '#06b6d4' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <MessageSquare size={16} /> Chat
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          style={{
            flex: 1,
            padding: '0.75rem 0.5rem',
            background: activeTab === 'custom' ? 'rgba(245, 158, 11, 0.2)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'custom' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'custom' ? '#f59e0b' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <PlusCircle size={16} /> Add Cards
        </button>
      </div>

      {/* Tab 1: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <h4 className="font-heading" style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            🏆 LIVE ROOM RANKINGS
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.6rem',
                  background: idx === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: idx === 0 ? '#f59e0b' : 'var(--text-muted)', width: '18px' }}>
                    #{idx + 1}
                  </span>
                  <span>{player.avatar}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{player.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {player.streak > 1 && (
                    <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 700 }}>
                      🔥 {player.streak}
                    </span>
                  )}
                  <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.95rem' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
          <div style={{ padding: '0.75rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: msg.isSystem ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: msg.isSystem ? '1px solid rgba(139, 92, 246, 0.3)' : 'none',
                  fontSize: '0.85rem'
                }}
              >
                {!msg.isSystem && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#06b6d4' }}>
                      {msg.avatar} {msg.sender}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                  </div>
                )}
                <div style={{ color: msg.isSystem ? '#c084fc' : '#e4e4e7', wordBreak: 'break-word' }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Type a chat message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.8rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="glass-button btn-cyan-gradient" style={{ padding: '0.6rem 0.8rem' }}>
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Custom Cards Deck */}
      {activeTab === 'custom' && (
        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <h4 className="font-heading" style={{ fontSize: '1rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
            ➕ ADD CUSTOM CARDS
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Submit custom truths or dares to be shuffled into this room's active deck!
          </p>

          <form onSubmit={handleAddPrompt}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setPromptType('truth')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  background: promptType === 'truth' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255,255,255,0.05)',
                  border: promptType === 'truth' ? '1px solid #06b6d4' : '1px solid transparent',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                TRUTH
              </button>
              <button
                type="button"
                onClick={() => setPromptType('dare')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  background: promptType === 'dare' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.05)',
                  border: promptType === 'dare' ? '1px solid #ec4899' : '1px solid transparent',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                DARE
              </button>
            </div>

            <textarea
              rows={3}
              placeholder={`Enter your custom ${promptType} question or task...`}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'none',
                marginBottom: '0.75rem'
              }}
            />

            <button type="submit" className="glass-button btn-gold-gradient" style={{ width: '100%', padding: '0.6rem' }}>
              Add To Room Deck
            </button>
          </form>

          {customPrompts.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Current Custom Prompts ({customPrompts.length}):
              </div>
              {customPrompts.map((cp) => (
                <div
                  key={cp.id}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '0.4rem',
                    background: 'rgba(255,255,255,0.03)',
                    marginBottom: '0.3rem',
                    color: '#d1d5db'
                  }}
                >
                  <strong style={{ color: cp.type === 'truth' ? '#06b6d4' : '#ec4899' }}>
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
