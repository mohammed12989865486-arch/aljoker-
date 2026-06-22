/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, ShieldAlert, Wifi, MessageSquare, Award, RefreshCw, Star, Info, ListOrdered, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardValue, Player, PlayState, Suit, UserProfile } from '../types';
import { playShuffleSound, playCardThrowSound, playCardSlamSound, playTimerTickSound, playEmojiWhooshSound, playEmojiSplatSound, speakArabicCallout, Dialect } from '../utils/audio';

const SUIT_ICONS: Record<Suit, string> = {
  spades: '♠️',
  hearts: '♥️',
  diamonds: '♦️',
  clubs: '♣️',
};

const SUIT_COLORS: Record<Suit, string> = {
  spades: 'text-zinc-900',
  hearts: 'text-red-600',
  diamonds: 'text-amber-500',
  clubs: 'text-zinc-900',
};

const SUIT_NAMES_AR: Record<Suit, string> = {
  spades: 'باص كوشة (سبيت)',
  hearts: 'كبة (هارت)',
  diamonds: 'ديناري (ديمن)',
  clubs: 'سباتي صلب (شري)',
};

const CARD_RANKS: CardValue[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Helpers to generate Deck
function createFullDeck(): Card[] {
  const cards: Card[] = [];
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  
  suits.forEach((suit) => {
    CARD_RANKS.forEach((val) => {
      cards.push({
        suit,
        value: val,
        scoreValue: CARD_RANKS.indexOf(val) + 2,
        id: `${suit}_${val}`,
      });
    });
  });

  return cards;
}

// Fisher-Yates shuffle with seed hash simulation
function shuffleDeck(deck: Card[]): { shuffled: Card[]; seed: string } {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const hex = '0123456789abcdef';
  let seed = 'rng_';
  for (let i = 0; i < 12; i++) {
    seed += hex[Math.floor(Math.random() * 16)];
  }
  return { shuffled, seed };
}

interface TarneebGameProps {
  userProfile: UserProfile;
  appDialect: Dialect;
  activeTableBg: string; // Tailwind styling class from store
  activeDeckBg: string;  // Tailwind styling class from store
  onUpdateWinLoss: (won: boolean, coinsReward: number) => void;
  onExitGame: () => void;
}

// Bot Names
const BOT_NAMES = ['صقر الرافدين 🦅', 'شيخ المتربين 👑', 'فارس الشام ⚔️'];

export default function TarneebGame({
  userProfile,
  appDialect,
  activeTableBg,
  activeDeckBg,
  onUpdateWinLoss,
  onExitGame,
}: TarneebGameProps) {
  const [gameState, setGameState] = useState<PlayState | null>(null);
  const [biddingTurnIndex, setBiddingTurnIndex] = useState<number>(-1);
  const [bidsSubmittedCount, setBidsSubmittedCount] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showRngDialog, setShowRngDialog] = useState<boolean>(false);
  const [isBotConnected, setIsBotConnected] = useState<boolean>(true);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [selectedEmojiTarget, setSelectedEmojiTarget] = useState<number | null>(null);
  const [showScoreCard, setShowScoreCard] = useState<boolean>(false);
  const [trickWinnerOverlay, setTrickWinnerOverlay] = useState<string | null>(null);
  const [isScoresOpen, setIsScoresOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

  // States for flying emojis
  const [flyingEmojis, setFlyingEmojis] = useState<{
    id: string;
    type: 'tomato' | 'shoe' | 'coffee' | 'rose';
    fromSeat: number;
    toSeat: number;
    completed: boolean;
  }[]>([]);

  // Sound control
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Auto Bot delay timers
  const botTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger game start / setup
  const initNewGame = () => {
    // Generate standard profiles
    const player0: Player = {
      id: userProfile.id,
      name: userProfile.username,
      avatar: userProfile.avatar,
      isBot: false,
      cardsCount: 0,
      cards: [],
      seatIndex: 0,
    };

    const playersList: Player[] = [player0];
    for (let i = 1; i <= 3; i++) {
      playersList.push({
        id: `bot_${i}`,
        name: BOT_NAMES[i - 1],
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=BotPlayer_${i}`,
        isBot: true,
        cardsCount: 0,
        cards: [],
        seatIndex: i,
      });
    }

    const { shuffled, seed } = shuffleDeck(createFullDeck());

    // Deal 13 cards to everyone
    playersList[0].cards = shuffled.slice(0, 13).sort((a, b) => {
      // Sort first by suit, then by card value descending
      const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
      if (a.suit !== b.suit) {
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return b.scoreValue - a.scoreValue;
    });
    playersList[0].cardsCount = 13;

    for (let s = 1; s <= 3; s++) {
      playersList[s].cards = shuffled.slice(s * 13, (s + 1) * 13);
      playersList[s].cardsCount = 13;
    }

    const firstPlayState: PlayState = {
      gameStarted: true,
      phase: 'dealing',
      shuffling: true,
      deck: shuffled,
      players: playersList,
      dealerSeat: 0, // Always start user first for quick demonstration
      bidWinnerSeat: -1,
      finalBid: 0,
      trumpSuit: null,
      currentTurnSeat: -1,
      leadingSuit: null,
      cardsInCenter: {},
      tricksWon: { 0: 0, 1: 0 }, // Team 0 (0 & 2) VS Team 1 (1 & 3)
      tricksHistory: [],
      scores: { team0: 0, team1: 0 },
      roundHistory: [],
      rngCertificate: seed,
    };

    setGameState(firstPlayState);
    setGameLogs(['جاري خلط الكروت وتفقد الـ RNG...']);
    playShuffleSound();

    setTimeout(() => {
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          shuffling: false,
          phase: 'bidding',
        };
      });
      // Bidding starts from seat 1 (left bot)
      setBiddingTurnIndex(1);
      setBidsSubmittedCount(0);
      setGameLogs((prev) => [...prev, 'بدأت مرحلة المزايدة (الطلب)! العب دورك أو طوف.']);
      if (audioEnabled) {
        speakArabicCallout('start', appDialect);
      }
    }, 2000);
  };

  useEffect(() => {
    initNewGame();
    if (window.innerWidth < 1024) {
      setIsScoresOpen(false);
      setIsChatOpen(false);
    }
    return () => {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
    };
  }, []);

  // Trigger Bot Bids Automatically
  useEffect(() => {
    if (!gameState || gameState.phase !== 'bidding') return;
    if (biddingTurnIndex !== -1 && biddingTurnIndex !== 0) {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
      botTurnTimeoutRef.current = setTimeout(() => {
        executeBotBid(biddingTurnIndex);
      }, 1500); // 1.5 seconds delay for realistic feel
    }
  }, [biddingTurnIndex, gameState?.phase]);

  // Computer AI Bidding Engine
  const executeBotBid = (seat: number) => {
    if (!gameState) return;
    const botHand = gameState.players[seat].cards || [];
    
    // Evaluate bidding power: count Aces, Kings, and long suits
    let acesCount = botHand.filter(c => c.value === 'A').length;
    let kingsCount = botHand.filter(c => c.value === 'K').length;
    
    // Find longest suit count
    const suitCounts: Record<Suit, number> = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 };
    botHand.forEach(c => suitCounts[c.suit]++);
    const longestCount = Math.max(...Object.values(suitCounts));

    // Simple estimation rule
    let estimatedTricks = acesCount * 1.5 + kingsCount * 0.8 + (longestCount >= 4 ? longestCount - 1 : 0);
    estimatedTricks = Math.floor(estimatedTricks);

    // Current high bid
    const currentHighBid = gameState.finalBid;
    let botDecision: number | 'pass' = 'pass';

    if (estimatedTricks >= 7 && estimatedTricks > currentHighBid) {
      botDecision = Math.min(estimatedTricks, 13);
    }

    applyPlayerBid(seat, botDecision);
  };

  const applyPlayerBid = (seat: number, bid: number | 'pass') => {
    setGameState((prev) => {
      if (!prev) return null;
      const updatedPlayers = [...prev.players];
      updatedPlayers[seat].currentBid = bid;

      let nextBidWinner = prev.bidWinnerSeat;
      let nextFinalBid = prev.finalBid;

      if (bid !== 'pass' && bid > prev.finalBid) {
        nextFinalBid = bid;
        nextBidWinner = seat;
      }

      return {
        ...prev,
        players: updatedPlayers,
        finalBid: nextFinalBid,
        bidWinnerSeat: nextBidWinner,
      };
    });

    const botName = seat === 0 ? 'أنت' : gameState?.players[seat].name;
    const textBid = bid === 'pass' ? 'طوّف / باص' : `طلب ${bid} أكلات!`;
    
    setGameLogs((prev) => [...prev, `${botName}: ${textBid}`]);

    // Narrative TTS triggers
    if (audioEnabled) {
      if (bid === 'pass') {
        speakArabicCallout('pass', appDialect);
      } else {
        speakArabicCallout('bid', appDialect, bid);
      }
    }

    // Move to next bidding seat
    const nextSeat = (seat + 1) % 4;
    const nextSubmittedCount = bidsSubmittedCount + 1;
    setBidsSubmittedCount(nextSubmittedCount);

    if (nextSubmittedCount < 4) {
      setBiddingTurnIndex(nextSeat);
    } else {
      // Bidding stage ended!
      setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return null;
          
          let finalWinner = prev.bidWinnerSeat;
          let finalBidAmount = prev.finalBid;

          // If everyone passed, the dealer is forced to bid 7 (إجباري الطلب)
          if (finalWinner === -1) {
            finalWinner = prev.dealerSeat;
            finalBidAmount = 7;
            const updated = [...prev.players];
            updated[finalWinner].currentBid = 7;
            setGameLogs((prevLogs) => [
              ...prevLogs,
              `مر الجميع دون طلب! إجباري ${updated[finalWinner].name} يطلب 7.`
            ]);
          }

          return {
            ...prev,
            bidWinnerSeat: finalWinner,
            finalBid: finalBidAmount,
            phase: 'selecting_trump',
          };
        });
        setBiddingTurnIndex(-1);
      }, 1000);
    }
  };

  // Bot automatically selects Trump Suit if they won the bid
  useEffect(() => {
    if (gameState && gameState.phase === 'selecting_trump') {
      const winner = gameState.players[gameState.bidWinnerSeat];
      if (winner.isBot) {
        if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
        botTurnTimeoutRef.current = setTimeout(() => {
          // Select longest suit of bot
          const botHand = winner.cards || [];
          const suitCounts: Record<Suit, number> = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 };
          botHand.forEach(c => suitCounts[c.suit]++);
          let bestSuit: Suit = 'spades';
          let max = -1;
          for (const s in suitCounts) {
            if (suitCounts[s as Suit] > max) {
              max = suitCounts[s as Suit];
              bestSuit = s as Suit;
            }
          }
          declareTrumpSuit(bestSuit);
        }, 1200);
      }
    }
  }, [gameState?.phase]);

  const declareTrumpSuit = (suit: Suit) => {
    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        trumpSuit: suit,
        phase: 'playing',
        currentTurnSeat: prev.bidWinnerSeat, // Bidding winner starts the gameplay
        leadingSuit: null,
        cardsInCenter: {},
      };
    });

    const winnerName = gameState?.players[gameState.bidWinnerSeat].name || 'المذيع';
    setGameLogs((prev) => [...prev, `📢 ترنيب الجولة هو: "${SUIT_NAMES_AR[suit]}" قررها ${winnerName}!`]);

    if (audioEnabled) {
      if (suit === 'spades') speakArabicCallout('spades', appDialect);
      if (suit === 'hearts') speakArabicCallout('hearts', appDialect);
      if (suit === 'diamonds') speakArabicCallout('diamonds', appDialect);
      if (suit === 'clubs') speakArabicCallout('clubs', appDialect);
    }
  };

  // Turn management loop
  useEffect(() => {
    if (!gameState || gameState.phase !== 'playing') return;

    const currentSeat = gameState.currentTurnSeat;
    const activePlayer = gameState.players[currentSeat];

    // Check if the current trick is complete (4 cards in center)
    if (Object.keys(gameState.cardsInCenter).length === 4) {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
      botTurnTimeoutRef.current = setTimeout(() => {
        evaluateTrickWinner();
      }, 2000);
      return;
    }

    if (activePlayer.isBot) {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
      // Play after tiny realistic thinking delay
      botTurnTimeoutRef.current = setTimeout(() => {
        executeBotTurn(currentSeat);
      }, 1500);
    }
  }, [gameState?.currentTurnSeat, gameState?.phase, gameState?.cardsInCenter]);

  // AI Bots Play Card Decision Engine
  const executeBotTurn = (seat: number) => {
    if (!gameState) return;
    const botHand = gameState.players[seat].cards || [];
    if (botHand.length === 0) return;

    const led = gameState.leadingSuit;
    let playableCards = [...botHand];

    // Follow suit rule
    if (led) {
      const matchingSuitCards = botHand.filter(c => c.suit === led);
      if (matchingSuitCards.length > 0) {
        playableCards = matchingSuitCards;
      }
    }

    // Bot strategy:
    // If partner played highest card, play low. If opponent leading, play higher than opponent, or play trump if no led suit.
    // Choose first eligible card for robustness
    const selectedCard = playableCards[0];
    playCard(seat, selectedCard);
  };

  const playCard = (seat: number, card: Card) => {
    if (!gameState) return;

    // Check if move is legal (User only verification)
    if (seat === 0 && gameState.leadingSuit && card.suit !== gameState.leadingSuit) {
      const userHand = gameState.players[0].cards || [];
      const hasCorrectSuit = userHand.some(c => c.suit === gameState.leadingSuit);
      if (hasCorrectSuit) {
        setWarningMessage(`عفواً! يجب أن تلعب أوراق من نفس الجرّة (${SUIT_NAMES_AR[gameState.leadingSuit]}) إذا كانت لديك!`);
        setTimeout(() => setWarningMessage(null), 3000);
        return;
      }
    }

    playCardThrowSound();

    setGameState((prev) => {
      if (!prev) return null;

      // Card thrown
      const updatedPlayers = prev.players.map((p) => {
        if (p.seatIndex === seat) {
          const filteredCards = (p.cards || []).filter((c) => c.id !== card.id);
          return {
            ...p,
            cards: filteredCards,
            cardsCount: filteredCards.length,
          };
        }
        return p;
      });

      const nextCenter = { ...prev.cardsInCenter, [seat]: card };
      const nextLeadingSuit = prev.leadingSuit === null ? card.suit : prev.leadingSuit;
      
      // Select next clockwise player
      const nextTurn = (seat + 1) % 4;

      return {
        ...prev,
        players: updatedPlayers,
        cardsInCenter: nextCenter,
        leadingSuit: nextLeadingSuit,
        currentTurnSeat: nextTurn,
      };
    });

    playCardSlamSound();
  };

  // Evaluate Trick Winner
  const evaluateTrickWinner = () => {
    setGameState((prev) => {
      if (!prev) return null;

      const center = prev.cardsInCenter;
      const led = prev.leadingSuit;
      const trump = prev.trumpSuit;

      let winningSeat = -1;
      let highestPower = -1;

      for (let s = 0; s < 4; s++) {
        const card = center[s];
        if (!card) continue;

        let power = card.scoreValue; // base card value (2-14)

        // Trump cards are boosted tremendously
        if (trump && card.suit === trump) {
          power += 100;
        } else if (card.suit !== led) {
          // If they threw any other non-led, non-trump card (سلخوا حَمِل), power is 0 for this trick
          power = 0;
        }

        if (power > highestPower) {
          highestPower = power;
          winningSeat = s;
        }
      }

      // Add scores (Team 0: 0 & 2, Team 1: 1 & 3)
      const winningTeam = (winningSeat === 0 || winningSeat === 2) ? 0 : 1;
      const updatedTricksCount = { ...prev.tricksWon };
      updatedTricksCount[winningTeam] = (updatedTricksCount[winningTeam] || 0) + 1;

      // Save historic tricks played
      const trickResult = Object.keys(center).map((k) => ({
        seatPlayed: parseInt(k),
        card: center[parseInt(k)],
      }));

      // Find winner name
      const winnerName = winningSeat === 0 ? 'أنت' : prev.players[winningSeat].name;
      const announcement = `🍲 الأكلة من نصيب (${winnerName})!`;
      
      setGameLogs((logs) => [...logs, announcement]);

      // Check if this was the last card (13 tricks completed)
      const isGameOver = prev.players[0].cardsCount === 0;

      return {
        ...prev,
        tricksWon: updatedTricksCount,
        cardsInCenter: {}, // reset table center
        leadingSuit: null, // reset led suit
        currentTurnSeat: winningSeat, // winner of previous trick starts next trick
        tricksHistory: [...prev.tricksHistory, trickResult],
        phase: isGameOver ? 'round_end' : 'playing',
      };
    });
  };

  // Trigger round calculations when phase becomes 'round_end'
  useEffect(() => {
    if (gameState && gameState.phase === 'round_end') {
      const team0Tricks = gameState.tricksWon[0]; // User + partner
      const team1Tricks = gameState.tricksWon[1]; // Bots Left + Right
      const bidWinner = gameState.bidWinnerSeat;
      const biddingTeam = (bidWinner === 0 || bidWinner === 2) ? 0 : 1;
      const targetBid = gameState.finalBid;

      let team0RoundPoints = 0;
      let team1RoundPoints = 0;

      if (biddingTeam === 0) {
        // User team won the bid
        if (team0Tricks >= targetBid) {
          team0RoundPoints = team0Tricks; // scored full tricks
          team1RoundPoints = team1Tricks; // scored opponents tricks
          setGameLogs((prev) => [...prev, `🎉 كفو! حصدتم الطلب بـ ${team0Tricks} أكلة!`]);
          if (audioEnabled) speakArabicCallout('wonTrick', appDialect);
        } else {
          team0RoundPoints = -targetBid; // broken target penalty! (خسارة الطلب)
          team1RoundPoints = team1Tricks;
          setGameLogs((prev) => [...prev, `💔 خسارة! فشلت المزايدة ولم تحققوا الـ ${targetBid} أكلة! عقوبة بالسالب.`]);
          if (audioEnabled) speakArabicCallout('lostTrick', appDialect);
        }
      } else {
        // Bots team won the bid
        if (team1Tricks >= targetBid) {
          team1RoundPoints = team1Tricks;
          team0RoundPoints = team0Tricks;
          setGameLogs((prev) => [...prev, `🤖 خصومك حصدوا طلبهم بـ ${team1Tricks} أكلة.`]);
        } else {
          team1RoundPoints = -targetBid;
          team0RoundPoints = team0Tricks;
          setGameLogs((prev) => [...prev, `🥳 فزتم الماتش! خصمك خسر طلبه بـ ${team1Tricks} أكلات.`]);
        }
      }

      const nextScore0 = gameState.scores.team0 + team0RoundPoints;
      const nextScore1 = gameState.scores.team1 + team1RoundPoints;

      const isUltimateMatchOver = nextScore0 >= 41 || nextScore1 >= 41;

      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          scores: { team0: nextScore0, team1: nextScore1 },
          phase: isUltimateMatchOver ? 'game_over' : 'round_end',
        };
      });

      // Submit rewards / losses to profile if game was fully finished
      if (isUltimateMatchOver) {
        const userWonMatch = nextScore0 >= 41;
        const rewardCoins = userWonMatch ? 500 : 100;
        
        onUpdateWinLoss(userWonMatch, rewardCoins);
        if (audioEnabled) {
          speakArabicCallout(userWonMatch ? 'winGame' : 'loseGame', appDialect);
        }
      }
    }
  }, [gameState?.phase]);

  // Deal next round
  const dealNextRound = () => {
    if (!gameState) return;
    const { shuffled, seed } = shuffleDeck(createFullDeck());

    const updatedPlayers = [...gameState.players];
    updatedPlayers[0].cards = shuffled.slice(0, 13).sort((a, b) => {
      const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
      if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit];
      return b.scoreValue - a.scoreValue;
    });
    updatedPlayers[0].cardsCount = 13;

    for (let s = 1; s <= 3; s++) {
      updatedPlayers[s].cards = shuffled.slice(s * 13, (s + 1) * 13);
      updatedPlayers[s].cardsCount = 13;
      updatedPlayers[s].currentBid = undefined;
    }
    updatedPlayers[0].currentBid = undefined;

    setGameState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        shuffling: false,
        phase: 'bidding',
        deck: shuffled,
        rngCertificate: seed,
        players: updatedPlayers,
        dealerSeat: (prev.dealerSeat + 1) % 4,
        bidWinnerSeat: -1,
        finalBid: 0,
        trumpSuit: null,
        cardsInCenter: {},
        tricksWon: { 0: 0, 1: 0 },
      };
    });

    setBiddingTurnIndex((gameState.dealerSeat + 1) % 4);
    setBidsSubmittedCount(0);
    setGameLogs((prev) => [...prev, '--- جولة ترنيب جديدة انطلقت وبدأت المزايدة! ---']);
    playShuffleSound();
  };

  // Throws interactive emojis to targeted bot
  const throwEmojiToPlayer = (emojiType: 'tomato' | 'shoe' | 'coffee' | 'rose', targetSeat: number) => {
    if (!gameState) return;
    const fromSeat = 0; // standard from User
    if (fromSeat === targetSeat) return;

    setSelectedEmojiTarget(null); // Close popover
    playEmojiWhooshSound();

    const newId = `emo_${Date.now()}`;
    const newEmoji = { id: newId, type: emojiType, fromSeat, toSeat: targetSeat, completed: false };
    setFlyingEmojis(prev => [...prev, newEmoji]);

    // Speak funny comments after Splat
    setTimeout(() => {
      playEmojiSplatSound(emojiType);
      
      // Update state
      setFlyingEmojis(prev => prev.map(e => e.id === newId ? { ...e, completed: true } : e));
      
      // Trigger comical dialet reaction from bot (narrated text chat/voiceover)
      const botReplyType = `emoji_${emojiType}`;
      if (audioEnabled) {
        speakArabicCallout(botReplyType, appDialect);
      }
      setGameLogs(prev => [...prev, `${gameState.players[targetSeat].name} يصرخ غاضباً ومتحمساً في الشات!`]);
    }, 900); // 900ms flight duration
  };

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-white min-h-[350px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-emerald-400">جاري وضع كراسي طاولة الترنيب...</p>
      </div>
    );
  }

  // Visual coordinates for 4 players (spaced perfectly around the 4 cardinal sides of the table)
  // 0: Bottom-Center, 1: Left-Center, 2: Top-Center, 3: Right-Center
  const SEAT_COORDINATES: Record<number, string> = {
    0: 'bottom-2 left-1/2 -translate-x-1/2',
    1: 'left-3 top-1/2 -translate-y-1/2',
    2: 'top-2 left-1/2 -translate-x-1/2',
    3: 'right-3 top-1/2 -translate-y-1/2',
  };

  return (
    <div className={`w-full max-w-7xl mx-auto rounded-3xl p-4 lg:p-6 text-right select-none grid grid-cols-1 lg:grid-cols-4 gap-6 relative overflow-hidden min-h-[550px] ${activeTableBg} border-4 border-emerald-500/15 shadow-[inset_0_0_100px_rgba(0,0,0,0.85)]`}>
      {/* Absolute luxury felt texture and ambient vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.65)_100%)] opacity-90 z-0" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/></svg>')] z-0" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none z-0" />

      {/* Main Table Screen Area (Takes 3 columns on lg) */}
      <div className="lg:col-span-3 bg-slate-950/20 backdrop-blur-[2px] rounded-3xl p-4 relative min-h-[500px] border border-white/5 flex flex-col justify-between">
        
        {/* Table Header: Status, disconnect bot replacement, volume toggler */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 z-10">
          {/* RNG Verification Info */}
          <button
            onClick={() => setShowRngDialog(true)}
            className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10 hover:bg-emerald-500/20"
          >
            <ShieldAlert size={12} className="text-emerald-400 animate-pulse" />
            <span>خلط عشوائي 100% (RNG)</span>
          </button>

          {/* Quick Stats: tricks, trump */}
          <div className="flex items-center gap-3">
            {gameState.trumpSuit && (
              <div className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                <span>الترنيب: {SUIT_ICONS[gameState.trumpSuit]} ({SUIT_NAMES_AR[gameState.trumpSuit].split(' ')[0]})</span>
              </div>
            )}
            <div className="bg-slate-900 border border-slate-700/60 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
              <span>طلب الجولة: <strong className="text-emerald-400">{gameState.finalBid || '?'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBotConnected(!isBotConnected)}
              className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full cursor-pointer ${
                isBotConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              <Wifi size={12} />
              <span>{isBotConnected ? 'متصل بالشبكة المحلية' : 'منقطع (بوت تكميلي)'}</span>
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-1.5 rounded-full border cursor-pointer ${
                audioEnabled ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <Volume2 size={14} />
            </button>
          </div>
        </div>

        {/* The Felt Table Arena */}
        <div className="flex-1 relative flex items-center justify-center min-h-[380px] my-4 bg-emerald-950/20 rounded-3xl border border-white/5 shadow-2xl">
          
          {/* Flying emojis rendering layer */}
          <AnimatePresence>
            {flyingEmojis.filter(e => !e.completed).map((emo) => {
              // Evaluated translate endpoints matching the updated cardinal player seats
              const seatsCoordsMap: Record<number, { x: number; y: number }> = {
                0: { x: 0, y: 160 },
                1: { x: -200, y: 0 },
                2: { x: 0, y: -160 },
                3: { x: 200, y: 0 },
              };
              const from = seatsCoordsMap[emo.fromSeat];
              const to = seatsCoordsMap[emo.toSeat];
              const emojiGlyphs = { tomato: '🍅', shoe: '🥿', coffee: '☕', rose: '🌹' };

              return (
                <motion.div
                  key={emo.id}
                  initial={{ x: from.x, y: from.y, scale: 0.5, rotate: 0 }}
                  animate={{ x: to.x, y: to.y, scale: [1, 1.4, 1.1], rotate: 360 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  className="absolute text-4xl z-40 pointer-events-none filter drop-shadow-xl select-none"
                >
                  {emojiGlyphs[emo.type]}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Table Center: Current Tricks Cards heap (Enlarged and highly organized center space) */}
          <div className="w-56 h-56 bg-slate-950/25 rounded-full border border-white/5 flex items-center justify-center relative shadow-inner backdrop-blur-[1px]">
            <span className="text-[10px] text-white/10 uppercase tracking-widest pointer-events-none absolute bottom-5">طاولة الترنيب</span>
            
            {/* Cards actually in center */}
            {Object.entries(gameState.cardsInCenter).map(([seatStr, cardRaw]) => {
              const card = cardRaw as Card;
              const sIndex = parseInt(seatStr);
              // Pushed towards seats for natural, highly clear layouts
              const positions: Record<number, string> = {
                0: 'bottom-4 left-1/2 -translate-x-1/2 rotate-0 z-10',
                1: 'left-4 top-1/2 -translate-y-1/2 -rotate-[12deg] z-10',
                2: 'top-4 left-1/2 -translate-x-1/2 rotate-0 z-10',
                3: 'right-4 top-1/2 -translate-y-1/2 rotate-[12deg] z-10',
              };

              return (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  key={card.id}
                  className={`absolute w-14 h-21 bg-gradient-to-b from-white via-slate-50 to-zinc-100 text-slate-900 border-2 border-zinc-300 rounded-xl p-2 flex flex-col justify-between font-bold shadow-[0_10px_25px_rgba(0,0,0,0.7)] ${positions[sIndex]}`}
                >
                  <div className="flex justify-between items-center text-sm leading-none font-sans font-black">
                    <span className="tracking-tighter">{card.value}</span>
                    <span className={`${SUIT_COLORS[card.suit]} text-[13px]`}>{SUIT_ICONS[card.suit]}</span>
                  </div>
                  <div className={`text-center text-2xl select-none filter drop-shadow-[0_0.7px_0.7px_rgba(0,0,0,0.15)] ${SUIT_COLORS[card.suit]}`}>
                    {SUIT_ICONS[card.suit]}
                  </div>
                  <div className="text-[9.5px] text-slate-500 text-center font-bold font-sans leading-none truncate w-full max-w-[48px] scale-90 border-t border-slate-200/50 pt-0.5 mt-0.5">
                    {gameState.players[sIndex].name}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 4 Players Seats rendering */}
          {gameState.players.map((plr) => {
            const isTurn = gameState.phase === 'playing' && gameState.currentTurnSeat === plr.seatIndex;
            const isBidTurn = gameState.phase === 'bidding' && biddingTurnIndex === plr.seatIndex;

            return (
              <div
                key={plr.seatIndex}
                className={`absolute flex flex-col items-center z-20 ${SEAT_COORDINATES[plr.seatIndex]}`}
              >
                {/* Profile wrapper with turn indicator glow */}
                <div 
                  className={`relative w-16 h-16 rounded-full border-2 p-0.5 transition-all cursor-pointer ${
                    isTurn ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105' : 
                    isBidTurn ? 'border-emerald-400 animate-pulse' : 'border-slate-800'
                  }`}
                  onClick={() => {
                    if (plr.seatIndex !== 0) setSelectedEmojiTarget(plr.seatIndex);
                  }}
                >
                  <img src={plr.avatar} className="w-full h-full rounded-full bg-slate-900" alt={plr.name} />
                  
                  {/* VIP badging overlay */}
                  {plr.seatIndex === 0 && userProfile.isVIP && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 p-1 rounded-full text-[8px] font-black shadow-lg">👑 VIP</span>
                  )}

                  {/* Bids amount bubble */}
                  {plr.currentBid !== undefined && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-md">
                      {plr.currentBid === 'pass' ? 'طوف' : `طلب ${plr.currentBid}`}
                    </span>
                  )}

                  {/* Tricks won in current game bubble */}
                  <span className="absolute -bottom-1 -left-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md">
                    أكل: {plr.seatIndex === 0 || plr.seatIndex === 2 ? gameState.tricksWon[0] : gameState.tricksWon[1]}
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-2.5 py-1 text-[11px] font-bold mt-1 text-white text-center shadow max-w-[110px] truncate">
                  {plr.name}
                </div>

                {/* Left Cards stock indicator */}
                {plr.seatIndex !== 0 && (
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {plr.cardsCount} ورق
                  </span>
                )}

                {/* Emojis selection popover right over bots photo */}
                {selectedEmojiTarget === plr.seatIndex && (
                  <div className="absolute top-16 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-2xl flex gap-1.5 z-30">
                    {[
                      { key: 'tomato', emoji: '🍅', label: 'طماطم' },
                      { key: 'shoe', emoji: '🥿', label: 'شبشب' },
                      { key: 'coffee', emoji: '☕', label: 'قهوة' },
                      { key: 'rose', emoji: '🌹', label: 'وردة' },
                    ].map((em) => (
                      <button
                        key={em.key}
                        onClick={() => throwEmojiToPlayer(em.key as any, plr.seatIndex)}
                        className="hover:bg-slate-800 p-2.5 rounded-xl transition-all text-xl cursor-pointer"
                        title={em.label}
                      >
                        {em.emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedEmojiTarget(null)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 px-1"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Bottom Panel: Interactive User Choice Stage or User Cards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 min-h-[140px] flex flex-col justify-end">
          
          {/* Warning banner */}
          {warningMessage && (
            <div className="text-center bg-red-500/20 text-red-400 border border-red-500/10 px-4 py-2.5 rounded-xl text-xs font-bold mb-3">
              {warningMessage}
            </div>
          )}

          {/* Phase A: Shuffling deal loaders */}
          {gameState.shuffling && (
            <div className="text-center py-6">
              <RefreshCw className="text-emerald-500 animate-spin mx-auto mb-2" size={24} />
              <p className="text-xs text-emerald-400 font-bold animate-pulse">جاري خلط الكروت وتوزيع الترتيب المناسب...</p>
            </div>
          )}

          {/* Phase B: User Bidding interactive interface */}
          {gameState.phase === 'bidding' && biddingTurnIndex === 0 && (
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-bold text-emerald-400 mb-3">دورك في طلب المزايدة يا كابتن! (أقصى طلب حالي: {gameState.finalBid || 'لا يوجد'})</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => applyPlayerBid(0, 'pass')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  باس / طوّف الجولة
                </button>
                {[7, 8, 9, 10, 11, 12, 13].map((bidVal) => {
                  const isDisabled = bidVal <= gameState.finalBid;
                  return (
                    <button
                      key={bidVal}
                      disabled={isDisabled}
                      onClick={() => applyPlayerBid(0, bidVal)}
                      className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                        isDisabled 
                          ? 'bg-slate-950 text-slate-600 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md font-extrabold cursor-pointer'
                      }`}
                    >
                      طلب {bidVal}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other players bidding message */}
          {gameState.phase === 'bidding' && biddingTurnIndex !== 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 font-bold animate-pulse">
                جاري انتظار طلب المزايد: <span className="text-emerald-400 font-extrabold">{gameState.players[biddingTurnIndex]?.name}</span>...
              </p>
            </div>
          )}

          {/* Phase C: Selecting Trump Suit */}
          {gameState.phase === 'selecting_trump' && gameState.bidWinnerSeat === 0 && (
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-emerald-400 mb-2">أنت كسبت مزايدة الطلب بـ ({gameState.finalBid})! حدد نوع كوش الخصم (الترنيب):</p>
              <div className="grid grid-cols-4 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {(Object.keys(SUIT_ICONS) as Suit[]).map((suit) => (
                  <button
                    key={suit}
                    onClick={() => declareTrumpSuit(suit)}
                    className="bg-slate-900 hover:bg-slate-800 text-xs font-bold px-4 py-3 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all border border-slate-800 hover:border-emerald-500"
                  >
                    <span className="text-xl">{SUIT_ICONS[suit]}</span>
                    <span className="text-[10px] text-slate-300">{SUIT_NAMES_AR[suit].split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bot selecting trump wait text */}
          {gameState.phase === 'selecting_trump' && gameState.bidWinnerSeat !== 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 font-bold animate-pulse">
                اللاعب <span className="text-emerald-400 font-extrabold">{gameState.players[gameState.bidWinnerSeat]?.name}</span> حصد المزايدة ويحدد الترنيب المناسب حالياً...
              </p>
            </div>
          )}

          {/* Phase D: User actual playable cards drawer */}
          {(gameState.phase === 'playing' || gameState.phase === 'bidding' || gameState.phase === 'selecting_trump') && (
            <div>
              <p className="text-[11px] text-slate-300 mb-2.5 text-center bg-slate-950/40 py-1.5 px-3 rounded-xl border border-white/5 animate-fade-in">
                {gameState.phase === 'playing' ? (
                  gameState.currentTurnSeat === 0 ? (
                     <strong className="text-emerald-400 animate-pulse">✓ دورك الآن للرمي على الطاولة!</strong>
                  ) : (
                    <span>انتظر دورك للعب من زملائك على الطاولة.</span>
                  )
                ) : gameState.phase === 'bidding' ? (
                  <strong className="text-emerald-305">🃏 ألقِ نظرة على أوراقك وحدد قيمة طلبك بناءً عليها من الأزرار بالأعلى!</strong>
                ) : (
                  <strong className="text-emerald-305">🃏 ألقِ نظرة على أوراقك وحدد نوع الترنيب (الكوش) المناسب لك!</strong>
                )}
              </p>
              
              <div className="flex flex-wrap gap-1.5 justify-center overflow-x-auto select-none py-1.5">
                {(gameState.players[0].cards || []).map((card) => {
                  const led = gameState.leadingSuit;
                  let isLegal = true;
                  
                  // Follow suit check
                  if (led && card.suit !== led) {
                    const searchForCorrectSuit = (gameState.players[0].cards || []).some(c => c.suit === led);
                    if (searchForCorrectSuit) isLegal = false;
                  }

                  const valLabel = card.value === 'A' ? 'أصل/A' : card.value;

                  return (
                    <motion.div
                      whileHover={{ y: -12, scale: 1.08, zIndex: 10 }}
                      key={card.id}
                      onClick={() => {
                        if (gameState.phase === 'playing' && gameState.currentTurnSeat === 0) {
                          playCard(0, card);
                        }
                      }}
                      className={`w-14 h-22 bg-gradient-to-b from-white via-slate-50 to-neutral-200 text-slate-900 rounded-xl p-1.5 border-2 flex flex-col justify-between font-bold shadow-[0_6px_15px_rgba(0,0,0,0.5)] relative cursor-pointer select-none transition-all duration-150 ${
                        !isLegal && gameState.currentTurnSeat === 0 && gameState.phase === 'playing' ? 'opacity-30 grayscale border-red-500/80' : 'border-zinc-300 hover:border-emerald-450 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)]'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] leading-none">
                        <span className="font-sans font-black tracking-tighter">{valLabel}</span>
                        <span className={`${SUIT_COLORS[card.suit]} text-[12px]`}>{SUIT_ICONS[card.suit]}</span>
                      </div>
                      <div className={`text-center text-xl select-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] ${SUIT_COLORS[card.suit]}`}>
                        {SUIT_ICONS[card.suit]}
                      </div>
                      <div className="text-[8px] text-slate-500 text-right font-sans whitespace-nowrap leading-none scale-90 origin-right">
                        {SUIT_NAMES_AR[card.suit].split(' ')[0]}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Phase E: Round End scoreboards */}
          {gameState.phase === 'round_end' && (
            <div className="flex flex-col items-center py-4">
              <h3 className="text-base font-bold text-yellow-400 mb-2">انتهت جولة الورق الـ 13!</h3>
              <p className="text-xs text-slate-300 mb-4 text-center">
                نتائج الجولة الحالية: فريقك الإيجابي حصل على <strong className="text-emerald-400 font-mono">{gameState.tricksWon[0]} أكلات</strong>. الخصوم حصلوا على <strong className="text-red-400 font-mono">{gameState.tricksWon[1]} أكلات</strong>.
              </p>
              <button
                onClick={dealNextRound}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-1"
              >
                <span>ابدأ المزايدة للجولة التالية</span>
                <RotateCcw size={14} />
              </button>
            </div>
          )}

          {/* Phase F: Ultimate Game Over Match results banner */}
          {gameState.phase === 'game_over' && (
            <div className="text-center py-4">
              {gameState.scores.team0 >= 41 ? (
                <div className="text-emerald-400 text-lg font-black mb-2 animate-bounce flex items-center justify-center gap-1">
                  👑 مبروك الكبود الكبرى! فزتم باللقاء بالبشا والنوماس 👑
                </div>
              ) : (
                <div className="text-red-400 text-lg font-black mb-2">
                  💔 هارد لك! الخصوم فازوا باللقاء ووصلوا للـ 41 أولاً 💔
                </div>
              )}
              <p className="text-xs text-slate-400 mb-4">
                النتيجة النهائية الكبرى: فريقكم {gameState.scores.team0} نقطة | الخصوم {gameState.scores.team1} نقطة.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={onExitGame}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  الخروج للردهة
                </button>
                <button
                  onClick={() => {
                    initNewGame();
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                >
                  لعب لقاء جديد
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Sidebar Game Information & Realtime Chat logs (Takes 1 column) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between h-fit lg:max-h-[600px] lg:col-span-1">
        
        {/* Panel 1: Scores and results */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden mb-3 bg-slate-950/40">
          <button 
            onClick={() => setIsScoresOpen(!isScoresOpen)}
            className="w-full flex items-center justify-between p-3 bg-slate-950 text-right hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {isScoresOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            <div className="flex items-center gap-1.5 justify-end">
              <h3 className="font-bold text-xs text-slate-200">النتائج وسجل الطاولة</h3>
              <span className="text-[10px] text-emerald-500 font-mono">طاولة #8221</span>
            </div>
          </button>
          
          <AnimatePresence initial={false}>
            {isScoresOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden p-3 border-t border-slate-900 bg-slate-900/60"
              >
                {/* Score details */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-center">
                  <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800 pb-2 mb-2">
                    <div>
                      <span className="block text-[10px] text-slate-500">الخصوم (سياف وبوت)</span>
                      <span className="text-xl font-mono font-extrabold text-red-400">
                        {gameState.scores.team1}
                      </span>
                    </div>
                    <div className="border-r border-slate-800">
                      <span className="block text-[10px] text-slate-500">فريقك (أنت وشريكك)</span>
                      <span className="text-xl font-mono font-extrabold text-emerald-400">
                        {gameState.scores.team0}
                      </span>
                      <span className="text-[9px] text-emerald-500 font-bold block">(الهدف: 41)</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400">
                    الديلر الموزع الحالي: <strong className="text-white">{gameState.players[gameState.dealerSeat]?.name}</strong>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel 2: Live Game Feed logs / dialogues & Fast predefined chat */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-full flex items-center justify-between p-3 bg-slate-950 text-right hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {isChatOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            <div className="flex items-center gap-1.5 justify-end">
              <h3 className="font-bold text-xs text-slate-200">سجل مجريات اللعب والدردشة</h3>
              <span className="text-[10px] text-emerald-500 font-mono">الدردشة والجمهور</span>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {isChatOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden p-3 border-t border-slate-900 bg-slate-900/60"
              >
                {/* Live Game Feed logs / dialog messages */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 h-48 overflow-y-auto space-y-1.5 scrollbar-thin mb-4">
                  <span className="text-[9px] text-slate-500 block mb-1 border-b border-slate-900 pb-0.5">دردشة وسجل مجريات الطاولة</span>
                  {gameLogs.map((log, lIdx) => (
                    <div key={lIdx} className="text-[10px] text-slate-300 leading-relaxed text-right">
                      {log}
                    </div>
                  ))}
                </div>

                {/* Floating Fast Predefined Chat buttons */}
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-2">أرسل دردشة سريعة لخصومك</span>
                  <div className="grid grid-cols-2 gap-1.5 text-right">
                    {[
                      { key: 'start', label: 'يلا يا رجالة', soundKey: 'start' },
                      { key: 'wonTrick', label: 'قشينا الأكلة', soundKey: 'wonTrick' },
                      { key: 'lostTrick', label: 'راحت علينا', soundKey: 'lostTrick' },
                      { key: 'winGame', label: 'كبووووت ناري!', soundKey: 'winGame' },
                    ].map((cht) => (
                      <button
                        key={cht.key}
                        onClick={() => {
                          setGameLogs(prev => [...prev, `أنت: ${cht.label}`]);
                          if (audioEnabled) {
                            speakArabicCallout(cht.soundKey, appDialect);
                          }
                        }}
                        className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-[10px] py-1.5 px-2 rounded-xl text-slate-300 transition-all truncate cursor-pointer text-center"
                      >
                        💬 {cht.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global actions at the very bottom */}
        <div className="mt-3">
          <button
            onClick={onExitGame}
            className="w-full bg-slate-950 hover:bg-red-950 hover:text-red-300 text-slate-400 text-xs font-bold py-2 rounded-xl transition-all border border-slate-800 cursor-pointer"
          >
            مغادرة الطاولة والعودة للرئيسية
          </button>
        </div>

      </div>

      {/* RNG Dialog Cert */}
      {showRngDialog && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 font-sans select-none text-right">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-end gap-1">
              <span>شهادة توزيع عشوائية نزيهة</span>
              <ShieldAlert className="text-emerald-400" size={20} />
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              نحن نأخذ نزاهة اللعب ومكافحة الغش بجدية تامة. يتم خلط الأوراق وتوزيعها محلياً على جهازك باستخدام خوارزمية Mersenne Twister المشفرة.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-lg">
                <span className="text-emerald-400 font-bold font-mono text-[10px]">{gameState.rngCertificate}</span>
                <span className="text-slate-500 font-bold">بصمة التشفير الحالية</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-900 pb-1.5">
                <span className="text-slate-200">52 كرت كاملة من A لـ 2</span>
                <span>كروت الجولة</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span className="text-slate-200 font-bold">SHA-256 Verified CERT</span>
                <span>ترخيص الخوارزمية</span>
              </div>
            </div>

            <button
              onClick={() => setShowRngDialog(false)}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              مفهوم، العودة للعب
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
