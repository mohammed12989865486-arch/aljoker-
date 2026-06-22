/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  isVIP: boolean;
  vipExpiry?: string;
  clubId?: string;
  clubName?: string;
  wins: number;
  losses: number;
  winStreak: number;
}

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type CardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  value: CardValue;
  scoreValue: number; // For calculations if needed, though standard high card ranking is enough
  imageUrl?: string;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  cardsCount: number;
  cards?: Card[];
  seatIndex: number; // 0: User, 1: Left Bot, 2: Partner Bot, 3: Right Bot
  currentBid?: number | 'pass';
}

export interface PlayState {
  gameStarted: boolean;
  phase: 'dealing' | 'bidding' | 'selecting_trump' | 'playing' | 'round_end' | 'game_over';
  shuffling: boolean;
  deck: Card[];
  players: Player[];
  dealerSeat: number;
  bidWinnerSeat: number;
  finalBid: number;
  trumpSuit: Suit | null;
  currentTurnSeat: number;
  leadingSuit: Suit | null;
  cardsInCenter: { [seatIndex: number]: Card }; // Cards played in the current trick
  tricksWon: { [teamIndex: number]: number }; // Team 0 (0 and 2), Team 1 (1 and 3)
  tricksHistory: { seatPlayed: number; card: Card }[][];
  scores: { team0: number; team1: number }; // Accumulated score across rounds (Target 41)
  roundHistory: { roundNum: number; team0Score: number; team1Score: number; bidWinnerSeat: number; finalBid: number; trumpSuit: Suit }[];
  rngCertificate: string;
}

export interface StoreItem {
  id: string;
  name: string;
  nameAr: string;
  type: 'table' | 'card_back' | 'avatar' | 'emoji_pack';
  cost: number;
  previewUrl?: string;
  styleClass?: string; // Tailwind styling class for table, etc.
  purchased: boolean;
}

export interface Club {
  id: string;
  name: string;
  logo: string;
  membersCount: number;
  totalPoints: number;
  rank: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderSeat?: number; // if inside a game
  message: string;
  isSystem?: boolean;
  timestamp: string;
  emojiOnly?: string;
}

export interface QuizQuest {
  id: string;
  textAr: string;
  rewardCoins: number;
  progress: number;
  target: number;
  completed: boolean;
}

export interface TournamentMatch {
  id: string;
  round: number; // 1: Quarter, 2: Semi, 3: Final
  player1: string;
  player2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  isUserMatch: boolean;
}
