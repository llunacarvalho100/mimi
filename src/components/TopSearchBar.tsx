import React, { useState } from 'react';
import { Search, Bell, Settings, MapPin, Sparkles, User, Users } from 'lucide-react';
import { WeatherSeasonState, AppNotification } from '../types';

interface TopSearchBarProps {
  currentView: 'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'albumDetail';
  onSelectView: (view: 'profile' | 'community') => void;
  weather: WeatherSeasonState;
  onOpenWeatherModal: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenEditProfile: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  currentView,
  onSelectView,
  weather,
  onOpenWeatherModal,
  notifications,
  onOpenNotifications,
  onOpenEditProfile,
  searchQuery,
  onSearchChange,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-2.5 bg-white/70 dark:bg-[#0c111c]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/70">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Search Bar matching the reference screenshot */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar publicações, @usuários, álbuns..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-transparent dark:border-slate-700/50 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-rose-400 outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Discrete Header Tab Switcher (Perfil Próprio ↔ Feed Comum) */}
        <nav className="flex items-center p-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => onSelectView('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              currentView === 'profile'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Meu Perfil</span>
          </button>
          <button
            onClick={() => onSelectView('community')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              currentView === 'community'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Feed Comum</span>
          </button>
        </nav>

        {/* Right Action Icons: Weather & Notifications */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Weather pill */}
          <button
            onClick={onOpenWeatherModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700/60 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 transition-all cursor-pointer"
            title="Alterar clima e emojis de estação"
          >
            <span>{weather.emojis[0] || '🌸'}</span>
            <span className="tabular-nums font-semibold">{weather.temp}ºC</span>
            <span className="text-slate-400 hidden md:inline">{weather.city}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenEditProfile}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Configurações do perfil"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
