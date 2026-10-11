import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, User, Users, CheckCircle, X, Loader2 } from 'lucide-react';
import { WeatherSeasonState, AppNotification } from '../types';
import { ApiClient } from '../services/apiClient';

interface TopSearchBarProps {
  currentView: 'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'albumDetail' | 'thankYou' | 'landing';
  onSelectView: (view: 'profile' | 'community') => void;
  weather: WeatherSeasonState;
  onOpenWeatherModal: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenEditProfile: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSearchedUser?: (user: { handle: string; name: string }) => void;
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
  onSelectSearchedUser,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio: string;
    followersCount: number;
    verified?: boolean;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounced Native Search exclusively by @username & name
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const users = await ApiClient.searchUsers(searchQuery);
        setSearchResults(users);
        setIsDropdownOpen(users.length > 0);
      } catch (err) {
        console.error('Erro na busca de usuários:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-2.5 bg-white/70 dark:bg-[#0c111c]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/70">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Native @username Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            role="combobox"
            aria-expanded={isDropdownOpen}
            aria-label="Buscar usuários pelo @username"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setIsDropdownOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsDropdownOpen(false);
            }}
            placeholder="Buscar exclusivamente pelo @username..."
            className="w-full pl-9 pr-9 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-transparent dark:border-slate-700/50 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-rose-400 outline-none transition-all shadow-2xs"
          />

          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3.5 top-2.5" />
          ) : searchQuery ? (
            <button
              onClick={() => {
                onSearchChange('');
                setSearchResults([]);
                setIsDropdownOpen(false);
              }}
              className="absolute right-3 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}

          {/* Instant Dropdown Results for @username */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                Usuários Autênticos (@)
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (onSelectSearchedUser) {
                        onSelectSearchedUser(user);
                      }
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </span>
                        {user.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 fill-blue-500 text-white" />
                        )}
                      </div>
                      <div className="text-[11px] text-rose-500 font-mono truncate">
                        {user.handle}
                      </div>
                    </div>
                    {user.followersCount !== undefined && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {user.followersCount} seguidor{user.followersCount === 1 ? '' : 'es'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Switcher (Perfil Próprio ↔ Feed Comum) */}
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
          <button
            onClick={onOpenWeatherModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700/60 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 transition-all cursor-pointer"
            title="Alterar clima e emojis de estação"
          >
            <span>{weather.emojis[0] || '🌸'}</span>
            <span className="tabular-nums font-semibold">{weather.temp}ºC</span>
            <span className="text-slate-400 hidden md:inline">{weather.city}</span>
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notificações"
            aria-label="Abrir notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenEditProfile}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Configurações do perfil"
            aria-label="Abrir configurações do perfil"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
