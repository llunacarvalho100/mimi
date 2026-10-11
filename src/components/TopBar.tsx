import React, { useState } from 'react';
import { Bell, Plus, LogOut, LogIn, User, Users, ChevronDown } from 'lucide-react';
import { UserProfile, AppNotification, UserAccount } from '../types';
import { UserAvatar } from './UserAvatar';

interface TopBarProps {
  currentUser: UserAccount | null;
  activeProfile: UserProfile;
  notifications: AppNotification[];
  currentView: 'profile' | 'community';
  onSelectView: (view: 'profile' | 'community') => void;
  onOpenCreateModal: () => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  activeProfile,
  notifications,
  currentView,
  onSelectView,
  onOpenCreateModal,
  onOpenNotifications,
  onOpenAuthModal,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Zone 1: Single element brand wordmark - MELIN */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('profile');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 shrink-0"
        >
          <span className="text-rose-500 font-serif text-xl">✦</span>
          <span>Melin</span>
        </a>

        {/* Zone 2: Discrete Top Header Switcher (Separates Meu Perfil vs Feed Comum) */}
        <nav className="flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 text-xs">
          <button
            onClick={() => onSelectView('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentView === 'profile'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Acessar Meu Perfil Próprio"
          >
            <User className="w-3.5 h-3.5" />
            <span>Meu Perfil</span>
          </button>

          <button
            onClick={() => onSelectView('community')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentView === 'community'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Acessar Feed Comum com outras pessoas"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Feed Comum</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Post, Notifications, Login/Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notificações"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* New Post Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publicar</span>
          </button>

          {/* User Account Menu with Logout */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all cursor-pointer"
              >
                <UserAvatar
                  src={activeProfile.avatar}
                  type={activeProfile.avatarType}
                  alt={activeProfile.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-300"
                />
                <span className="hidden md:inline text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 max-w-[85px] truncate">
                  {currentUser.handle}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in duration-150 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] font-mono text-rose-500 truncate">
                      {currentUser.handle}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onSelectView('profile');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ver Meu Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onSelectView('community');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Feed da Comunidade</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <span>🔄 Trocar de Conta</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
