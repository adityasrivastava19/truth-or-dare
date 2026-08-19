import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { VideoGrid } from './components/VideoGrid';
import { GameStage } from './components/GameStage';
import { Sidebar } from './components/Sidebar';
import { MediaControls } from './components/MediaControls';
import { MatchmakingModal } from './components/MatchmakingModal';
import { ModeConsentModal } from './components/ModeConsentModal';
import { RateOpponentModal } from './components/RateOpponentModal';
import { socket, connectSocket } from './services/socket';
import { rtcManager } from './services/webrtc';
import { Player, RoomState, ChatMessage, FloatingReaction, GenderType, TurnMode, GameCategory } from './types/game';
import { Copy, Check, Sparkles, Share2, Shield, Settings, Volume2, MessageSquare, X } from 'lucide-react';
import { sounds } from './utils/sound';

export const App: React.FC = () => {
  // Navigation / View State
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);

  // WebRTC Media streams state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  // Chat & Reactions
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Matchmaking
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchmakingData, setMatchmakingData] = useState<{ gender: GenderType; preference: 'opposite' | 'any'; matchMode: 'erotic' | 'normal' } | null>(null);

  // Mode Consent & Rating Modals
  const [consentModalData, setConsentModalData] = useState<{ requesterName: string; proposedMode: 'erotic' } | null>(null);
  const [showRateModal, setShowRateModal] = useState<boolean>(false);

  // Mobile Drawer State
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Initial room code from URL ?room=XYZ123
  const [urlRoomCode, setUrlRoomCode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) setUrlRoomCode(roomParam);

    const s = connectSocket();

    // Socket Listeners
    s.on('room-updated', (updatedRoom: RoomState) => {
      setRoom(updatedRoom);
      if (s.id) {
        const lp = updatedRoom.players.find((p) => p.id === s.id);
        if (lp) setLocalPlayer(lp);
      }
    });

    s.on('peer-joined', async ({ peerId }: { peerId: string; player: Player }) => {
      console.log('[App] New peer joined:', peerId);
      sounds.playVictory();
      rtcManager.registerRemoteStreamHandler(
        peerId,
        (stream) => {
          setRemoteStreams((prev) => new Map(prev).set(peerId, stream));
        },
        () => {
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        }
      );
      // Initiate WebRTC offer as caller
      await rtcManager.connectToPeer(peerId, true);
    });

    s.on('peer-left', ({ peerId }: { peerId: string }) => {
      rtcManager.closePeerConnection(peerId);
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    });

    // Signaling
    s.on('signal-offer', async ({ senderId, offer }) => {
      rtcManager.registerRemoteStreamHandler(
        senderId,
        (stream) => {
          setRemoteStreams((prev) => new Map(prev).set(senderId, stream));
        },
        () => {
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(senderId);
            return next;
          });
        }
      );
      await rtcManager.handleOffer(senderId, offer);
    });

    s.on('signal-answer', async ({ senderId, answer }) => {
      await rtcManager.handleAnswer(senderId, answer);
    });

    s.on('signal-ice-candidate', async ({ senderId, candidate }) => {
      await rtcManager.handleIceCandidate(senderId, candidate);
    });

    s.on('chat-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on('reaction-received', ({ emoji, targetPlayerId }: { emoji: string; targetPlayerId: string }) => {
      sounds.playPop();
      const reactionObj: FloatingReaction = {
        id: Date.now() + '-' + Math.random(),
        emoji,
        targetPlayerId
      };
      setReactions((prev) => [...prev, reactionObj]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reactionObj.id));
      }, 2500);
    });

    s.on('match-found', ({ roomCode, player, room }: { roomCode: string; peerName: string; player?: Player; room?: RoomState }) => {
      setIsMatchmaking(false);
      if (player && room) {
        setRoom(room);
        setLocalPlayer(player);
        setInRoom(true);
        window.history.pushState({}, '', `?room=${roomCode}`);
      } else if (localPlayer) {
        handleJoinRoom({
          name: localPlayer.name,
          avatar: localPlayer.avatar,
          gender: localPlayer.gender,
          code: roomCode
        });
      }
    });

    s.on('consent-request-mode', ({ requesterName, proposedMode }: { requesterName: string; proposedMode: 'erotic' }) => {
      setConsentModalData({ requesterName, proposedMode });
    });

    s.on('opponent-marked', ({ senderName, badgeTag, rating }: { senderName: string; badgeTag: string; rating: number }) => {
      const badgeEmoji = badgeTag === 'spicy' ? '🌶️' : badgeTag === 'sport' ? '🔥' : badgeTag === 'polite' ? '👏' : '🚩';
      sounds.playVictory();
      alert(`✨ ${senderName} rated your call ${rating}/5 Stars and marked you as ${badgeEmoji} ${badgeTag.toUpperCase()}!`);
    });

    return () => {
      s.off('room-updated');
      s.off('peer-joined');
      s.off('peer-left');
      s.off('signal-offer');
      s.off('signal-answer');
      s.off('signal-ice-candidate');
      s.off('chat-message');
      s.off('reaction-received');
      s.off('match-found');
    };
  }, [localPlayer]);

  // Handler: Join Room
  const handleJoinRoom = async ({ name, avatar, gender, code }: { name: string; avatar: string; gender: GenderType; code: string }) => {
    const stream = rtcManager.getLocalStream() || (await rtcManager.initLocalStream());
    setLocalStream(stream);

    socket.emit('join-room', { code, name, avatar, gender }, (res: { success: boolean; room?: RoomState; player?: Player; error?: string }) => {
      if (res.success && res.room && res.player) {
        setRoom(res.room);
        setLocalPlayer(res.player);
        setInRoom(true);
        window.history.pushState({}, '', `?room=${res.room.code}`);
      } else {
        alert(res.error || 'Failed to join room!');
      }
    });
  };

  // Handler: Create Room
  const handleCreateRoom = async ({ name, avatar, gender, turnMode, category }: { name: string; avatar: string; gender: GenderType; turnMode: TurnMode; category: GameCategory }) => {
    const stream = rtcManager.getLocalStream() || (await rtcManager.initLocalStream());
    setLocalStream(stream);

    socket.emit('create-room', { name, avatar, gender, turnMode, category }, (res: { success: boolean; room?: RoomState; player?: Player }) => {
      if (res.success && res.room && res.player) {
        setRoom(res.room);
        setLocalPlayer(res.player);
        setInRoom(true);
        window.history.pushState({}, '', `?room=${res.room.code}`);
      }
    });
  };

  // Handler: Join Matchmaking Queue
  const handleJoinMatchmaking = async ({ name, avatar, gender, preference, matchMode }: { name: string; avatar: string; gender: GenderType; preference: 'opposite' | 'any'; matchMode: 'erotic' | 'normal' }) => {
    const tempPlayer: Player = {
      id: socket.id || 'temp',
      name,
      avatar,
      gender,
      score: 0,
      streak: 0,
      truthsDone: 0,
      daresDone: 0,
      isMuted: false,
      isVideoOff: false,
      isHost: false
    };
    setLocalPlayer(tempPlayer);
    setMatchmakingData({ gender, preference, matchMode });
    setIsMatchmaking(true);

    const stream = rtcManager.getLocalStream() || (await rtcManager.initLocalStream());
    setLocalStream(stream);

    socket.emit('join-matchmaking', { name, avatar, gender, preference, matchMode });
  };

  const handleRespondConsent = (accept: boolean) => {
    if (room) {
      socket.emit('respond-mode-consent', { code: room.code, accept });
    }
    setConsentModalData(null);
  };

  const handleSubmitOpponentRating = ({ badgeTag, rating }: { badgeTag: string; rating: number }) => {
    if (room && localPlayer) {
      const opponent = room.players.find((p) => p.id !== localPlayer.id);
      if (opponent) {
        socket.emit('mark-opponent', { code: room.code, targetPlayerId: opponent.id, badgeTag, rating });
      }
    }
  };

  const handleCancelMatchmaking = () => {
    socket.emit('leave-matchmaking');
    setIsMatchmaking(false);
  };

  // Game Control Handlers
  const handleSpinWheel = () => {
    if (room) socket.emit('spin-wheel', { code: room.code });
  };

  const handleSelectChoice = (choice: 'truth' | 'dare') => {
    if (room) socket.emit('select-choice', { code: room.code, choice });
  };

  const handleVerdict = (verdict: 'completed' | 'forfeited') => {
    if (room) socket.emit('submit-verdict', { code: room.code, verdict });
  };

  const handleVerifyDare = (accepted: boolean) => {
    if (room) socket.emit('submit-opponent-verdict', { code: room.code, accepted });
  };

  const handleReroll = () => {
    if (room) socket.emit('reroll-question', { code: room.code });
  };

  // Media Controls
  const handleToggleMic = () => {
    if (!room || !localPlayer) return;
    const nextMuted = !localPlayer.isMuted;
    rtcManager.toggleAudio(!nextMuted);
    socket.emit('toggle-media', { code: room.code, isMuted: nextMuted });
  };

  const handleToggleVideo = () => {
    if (!room || !localPlayer) return;
    const nextVideoOff = !localPlayer.isVideoOff;
    rtcManager.toggleVideo(!nextVideoOff);
    socket.emit('toggle-media', { code: room.code, isVideoOff: nextVideoOff });
  };

  const handleToggleScreenShare = async () => {
    await rtcManager.toggleScreenShare();
  };

  const handleSendReaction = (emoji: string) => {
    if (room && localPlayer) {
      socket.emit('send-reaction', { code: room.code, emoji, targetPlayerId: room.currentTurnPlayerId || localPlayer.id });
    }
  };

  const handleSendMessage = (text: string) => {
    if (room) socket.emit('send-chat', { code: room.code, message: text });
  };

  const handleAddCustomPrompt = (type: 'truth' | 'dare', text: string) => {
    if (room) socket.emit('add-custom-prompt', { code: room.code, type, text });
  };

  const handleSkipPartner = () => {
    if (room) {
      rtcManager.closeAll();
      socket.emit('skip-partner', { code: room.code });
      setInRoom(false);
      setRoom(null);
      setIsMatchmaking(true);
      if (localPlayer) {
        setMatchmakingData({ gender: localPlayer.gender, preference: 'opposite', matchMode: 'erotic' });
      }
    }
  };

  const handleLeaveRoom = () => {
    rtcManager.closeAll();
    setInRoom(false);
    setRoom(null);
    setLocalPlayer(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleCopyLink = () => {
    if (!room) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!inRoom ? (
        <>
          <Lobby
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
            onJoinMatchmaking={handleJoinMatchmaking}
            initialRoomCode={urlRoomCode}
          />
          {isMatchmaking && matchmakingData && (
            <MatchmakingModal
              gender={matchmakingData.gender}
              preference={matchmakingData.preference}
              onCancel={handleCancelMatchmaking}
            />
          )}
        </>
      ) : room && localPlayer ? (
        /* Video Call & Truth or Dare Room Interface */
        <div className="room-container mobile-full-screen-ui">
          {/* Top Header Navigation Bar */}
          <div className="glass-panel room-header mobile-header-float">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div
                className="room-header-title"
                style={{
                  fontSize: '1.1rem',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                🔥 TRUTH OR DARE LIVE
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '1px',
                  border: '1px solid var(--border-glass)'
                }}
              >
                ROOM: {room.code}
              </div>
            </div>

            <div className="room-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {/* Mobile Chat Drawer Toggle */}
              <button
                onClick={() => setShowMobileDrawer((prev) => !prev)}
                className="glass-button"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', background: 'rgba(6, 182, 212, 0.25)', borderColor: '#06b6d4' }}
              >
                <MessageSquare size={14} color="#06b6d4" />
                <span>Chat</span>
              </button>

              {room.players.length > 1 && (
                <button
                  onClick={() => setShowRateModal(true)}
                  className="glass-button btn-gold-gradient"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                >
                  ⭐ Rate
                </button>
              )}
              <button onClick={handleCopyLink} className="glass-button" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                {copiedLink ? 'Copied' : 'Invite'}
              </button>
            </div>
          </div>

          {/* Main Split Grid */}
          <div className="room-main-grid mobile-full-grid">
            {/* Left Area: Video Grid & Center Stage Game Board */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden', height: '100%' }}>
              {/* Top Section: Full Screen Video Feeds Grid */}
              <div className="video-grid-wrapper mobile-video-full">
                <VideoGrid
                  localPlayer={localPlayer}
                  localStream={localStream}
                  remotePlayers={room.players.filter((p) => p.id !== localPlayer.id)}
                  remoteStreams={remoteStreams}
                  currentTurnPlayerId={room.currentTurnPlayerId}
                  floatingReactions={reactions}
                />
              </div>

              {/* Center Stage Floating Game Controller */}
              <div className="game-stage-wrapper mobile-stage-float">
                <GameStage
                  room={room}
                  localPlayer={localPlayer}
                  onSpin={handleSpinWheel}
                  onSelectChoice={handleSelectChoice}
                  onVerdict={handleVerdict}
                  onVerifyDare={handleVerifyDare}
                  onReroll={handleReroll}
                />
              </div>
            </div>

            {/* Right Area: Desktop Sidebar Leaderboard & Chat */}
            <div className="sidebar-container">
              <Sidebar
                players={room.players}
                messages={messages}
                customPrompts={room.customPrompts}
                onSendMessage={handleSendMessage}
                onAddCustomPrompt={handleAddCustomPrompt}
              />
            </div>
          </div>

          {/* Bottom Floating Media Footer Bar */}
          <div className="media-controls-bar mobile-controls-float">
            <MediaControls
              isMuted={localPlayer.isMuted}
              isVideoOff={localPlayer.isVideoOff}
              isHost={localPlayer.isHost}
              onToggleMic={handleToggleMic}
              onToggleVideo={handleToggleVideo}
              onToggleScreenShare={handleToggleScreenShare}
              onSendReaction={handleSendReaction}
              onOpenSettings={() => setShowSettingsModal(true)}
              onSkipPartner={handleSkipPartner}
              onLeaveRoom={handleLeaveRoom}
            />
          </div>

          {/* Mobile Slide-Up Chat & Leaderboard Drawer Overlay */}
          {showMobileDrawer && (
            <>
              <div className="mobile-drawer-backdrop" onClick={() => setShowMobileDrawer(false)} />
              <div className="mobile-drawer-panel">
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-glass)',
                    background: 'rgba(0,0,0,0.3)'
                  }}
                >
                  <span style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#fff', fontSize: '1rem' }}>
                    💬 Room Chat & Leaderboard
                  </span>
                  <button
                    onClick={() => setShowMobileDrawer(false)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Sidebar
                    players={room.players}
                    messages={messages}
                    customPrompts={room.customPrompts}
                    onSendMessage={handleSendMessage}
                    onAddCustomPrompt={handleAddCustomPrompt}
                  />
                </div>
              </div>
            </>
          )}

          {/* Erotic Mode Consent Modal */}
          {consentModalData && (
            <ModeConsentModal
              requesterName={consentModalData.requesterName}
              proposedMode="erotic"
              onRespond={handleRespondConsent}
            />
          )}

          {/* Rate / Mark Opponent Modal */}
          {showRateModal && room.players.find((p) => p.id !== localPlayer.id) && (
            <RateOpponentModal
              opponent={room.players.find((p) => p.id !== localPlayer.id)!}
              onClose={() => setShowRateModal(false)}
              onSubmitRating={handleSubmitOpponentRating}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};
