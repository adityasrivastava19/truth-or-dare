export type GenderType = 'male' | 'female' | 'neutral';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  gender: GenderType;
  score: number;
  streak: number;
  truthsDone: number;
  daresDone: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
}

export interface CustomPrompt {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  author: string;
}

export type GameCategory = 'all' | 'classic' | 'party' | 'deep' | 'spicy' | 'couples' | 'icebreaker';
export type TurnMode = 'random' | 'staggered';
export type GameState = 'idle' | 'spinning' | 'choosing' | 'answering' | 'verdict' | 'verifying';

export interface CurrentQuestion {
  id?: string;
  type: 'truth' | 'dare';
  text: string;
  category: string;
  intensity: string;
}

export interface RoomState {
  code: string;
  hostId: string;
  players: Player[];
  turnMode: TurnMode;
  lastGenderTurn?: GenderType;
  activeCategory: GameCategory;
  currentTurnPlayerId: string | null;
  gameState: GameState;
  currentQuestion: CurrentQuestion | null;
  questionTimer: number;
  usedQuestionIds: string[];
  customPrompts: CustomPrompt[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  targetPlayerId: string;
}
