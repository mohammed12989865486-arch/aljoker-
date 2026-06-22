/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import SplashIntro from './components/SplashIntro';
import DashboardLobby from './components/DashboardLobby';
import TarneebGame from './components/TarneebGame';
import GameIntroLoader from './components/GameIntroLoader';
import { UserProfile } from './types';
import { Dialect } from './utils/audio';

export default function App() {
  const [introCompleted, setIntroCompleted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Cosmetic skin selectors
  const [activeTableBg, setActiveTableBg] = useState('bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950');
  const [activeDeckBg, setActiveDeckBg] = useState('bg-gradient-to-br from-red-700 to-red-900 text-white');

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    username: '',
    avatar: '',
    level: 1,
    xp: 0,
    coins: 1500,
    isVIP: false,
    wins: 0,
    losses: 0,
    winStreak: 0,
    clubId: undefined,
    clubName: undefined,
  });

  const [appDialect, setAppDialect] = useState<Dialect>('egypt');

  // Load saved progress from localStorage on boot
  useEffect(() => {
    const savedProfile = localStorage.getItem('joker_user_profile');
    const savedLoggedIn = localStorage.getItem('joker_is_logged_in');
    const savedTable = localStorage.getItem('joker_equipped_table');
    const savedDeck = localStorage.getItem('joker_equipped_deck');

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(parsed);
        if (parsed.dialect) {
          setAppDialect(parsed.dialect);
        }
      } catch (e) {
        console.warn('Stale cache, loading defaults.');
      }
    }
    if (savedLoggedIn === 'true') {
      setIsLoggedIn(true);
    }
    if (savedTable) {
      setActiveTableBg(savedTable);
    }
    if (savedDeck) {
      setActiveDeckBg(savedDeck);
    }
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('joker_user_profile', JSON.stringify(newProfile));
  };

  const handleLoginSuccess = (profileData: any) => {
    const finalProfile: UserProfile = {
      id: profileData.id,
      username: profileData.username,
      avatar: profileData.avatar,
      level: profileData.level,
      xp: profileData.xp,
      coins: profileData.coins,
      isVIP: profileData.isVIP,
      wins: profileData.wins,
      losses: profileData.losses,
      winStreak: profileData.winStreak,
      clubId: undefined,
      clubName: undefined,
    };

    saveProfile(finalProfile);
    setAppDialect(profileData.dialect);
    setIsLoggedIn(true);
    localStorage.setItem('joker_is_logged_in', 'true');
  };

  const handleUpdateCoins = (newCoins: number) => {
    const updated = { ...userProfile, coins: newCoins };
    saveProfile(updated);
  };

  const handleUpdateVIP = (isVIP: boolean) => {
    const updated = { ...userProfile, isVIP };
    saveProfile(updated);
  };

  const handleJoinClub = (clubId: string, name: string) => {
    const updated = { ...userProfile, clubId, clubName: name };
    saveProfile(updated);
  };

  const handleLeaveClub = () => {
    const updated = { ...userProfile, clubId: undefined, clubName: undefined };
    saveProfile(updated);
  };

  const handleEquipTable = (id: string) => {
    // Maps item IDs to tailwind class
    const tableStyles: Record<string, string> = {
      table_emerald: 'bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950',
      table_velvet: 'bg-gradient-to-b from-red-900 via-red-950 to-red-900',
      table_void: 'bg-gradient-to-b from-slate-950 to-zinc-900',
      table_gold: 'bg-gradient-to-b from-[#451a03] via-[#020617] to-[#451a03]',
    };
    const style = tableStyles[id] || tableStyles.table_emerald;
    setActiveTableBg(style);
    localStorage.setItem('joker_equipped_table', style);
  };

  const handleEquipDeck = (id: string) => {
    const deckStyles: Record<string, string> = {
      deck_classic: 'bg-gradient-to-br from-red-700 to-red-900 text-white',
      deck_vip_gold: 'bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-500 text-slate-950',
      deck_dark_matter: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-indigo-400',
      deck_neon: 'bg-gradient-to-br from-fuchsia-600 to-cyan-500 text-white',
    };
    const style = deckStyles[id] || deckStyles.deck_classic;
    setActiveDeckBg(style);
    localStorage.setItem('joker_equipped_deck', style);
  };

  // Callback at game ends (41 pts)
  const handleUpdateWinLoss = (won: boolean, coinsReward: number) => {
    const nextWins = userProfile.wins + (won ? 1 : 0);
    const nextLosses = userProfile.losses + (won ? 0 : 1);
    const nextStreak = won ? userProfile.winStreak + 1 : 0;
    
    // Level up calculation: simple level up with every win
    const nextLevel = won ? userProfile.level + 1 : userProfile.level;

    const updated: UserProfile = {
      ...userProfile,
      wins: nextWins,
      losses: nextLosses,
      winStreak: nextStreak,
      level: nextLevel,
      coins: userProfile.coins + coinsReward,
    };
    saveProfile(updated);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsCurrentlyPlaying(false);
    localStorage.removeItem('joker_is_logged_in');
    localStorage.removeItem('joker_user_profile');
  };

  if (!introCompleted) {
    return <GameIntroLoader onComplete={() => setIntroCompleted(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Upper Navigation Strip for logged in users */}
      {isLoggedIn && (
        <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur py-3 px-6 flex items-center justify-between font-sans shadow-md select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 font-bold text-xs border border-slate-800 hover:border-red-500/10 px-3 py-1.5 rounded-xl bg-slate-900 transition-all cursor-pointer"
            >
              تسجيل خروج الحساب
            </button>
            <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
              لهجة المعلق: <strong className="text-emerald-500 font-black">{appDialect === 'egypt' ? '🇪🇬 مصري' : appDialect === 'gulf' ? '🇸🇦 خليجي' : '🇸🇾 شامي'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.h1 
              onClick={() => setIsCurrentlyPlaying(false)}
              className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-100 cursor-pointer active:scale-95 transition-all"
            >
              الجوكر 🤡
            </motion.h1>
          </div>
        </header>
      )}

      {/* State router viewport */}
      <main className="py-4">
        {!isLoggedIn ? (
          <SplashIntro onLoginSuccess={handleLoginSuccess} />
        ) : isCurrentlyPlaying ? (
          <TarneebGame
            userProfile={userProfile}
            appDialect={appDialect}
            activeTableBg={activeTableBg}
            activeDeckBg={activeDeckBg}
            onUpdateWinLoss={handleUpdateWinLoss}
            onExitGame={() => setIsCurrentlyPlaying(false)}
          />
        ) : (
          <DashboardLobby
            userProfile={userProfile}
            botDifficulty={botDifficulty}
            activeTableBg={activeTableBg}
            activeDeckBg={activeDeckBg}
            onSelectGame={(gType) => setIsCurrentlyPlaying(true)}
            onUpdateCoins={handleUpdateCoins}
            onUpdateVIP={handleUpdateVIP}
            onJoinClub={handleJoinClub}
            onLeaveClub={handleLeaveClub}
            onEquipTable={handleEquipTable}
            onEquipDeck={handleEquipDeck}
            onSetBotDifficulty={setBotDifficulty}
          />
        )}
      </main>
    </div>
  );
}
