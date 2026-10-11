import React from 'react';
import {
  User,
  Users,
  Bookmark,
  Mail,
  Palette,
  Settings,
  Plus,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Compass,
  HelpCircle,
  Shield,
  ShieldCheck,
  FileQuestion,
} from 'lucide-react';
import { UserProfile, UserAccount } from '../types';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  currentUser: UserAccount | null;
  activeProfile: UserProfile;
  currentView: 'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'albumDetail' | 'thankYou' | 'landing';
  onSelectView: (view: 'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'thankYou' | 'landing') => void;
  activeProfileTab: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets';
  onSelectProfileTab: (tab: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets') => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  onOpenEditProfile: () => void;
  onOpenSecurityModal?: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeProfile,
  currentView,
  onSelectView,
  activeProfileTab,
  onSelectProfileTab,
  onOpenCreateModal,
  onOpenAuthModal,
  onOpenEditProfile,
  onOpenSecurityModal,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <aside className="w-64 lg:w-72 shrink-0 hidden md:flex flex-col justify-between p-4 h-screen sticky top-0 border-r border-slate-200/50 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c111c]/80 backdrop-blur-xl z-30 select-none">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Melin Brand Logo - sleek minimalist mark */}
        <div className="flex items-center justify-between px-2 pt-1">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectView('profile');
              onSelectProfileTab('posts');
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold text-xl tracking-tighter">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Melin
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-mono">social space</span>
            </div>
          </a>
        </div>

        {/* User Mini Profile Card with stats (like screenshot) */}
        {currentUser && (
          <div
            onClick={onOpenEditProfile}
            className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserAvatar
                src={activeProfile.avatar}
                type={activeProfile.avatarType}
                alt={activeProfile.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-400/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {activeProfile.name}
                </p>
                <p className="text-xs font-mono text-rose-500 dark:text-rose-400 truncate">
                  {activeProfile.handle}
                </p>
              </div>
            </div>

            {/* Status Real e Sem Seguidores Falsos */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-800/60 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Cantinho Ativo</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-[10px] text-slate-400">Dados Locais & Privados</span>
            </div>
          </div>
        )}

        {/* Navigation Menu (Inspiração do print com abas bem definidas) */}
        <nav className="space-y-1">
          {/* Perfil Próprio */}
          <button
            onClick={() => {
              onSelectView('profile');
              onSelectProfileTab('posts');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'profile' && activeProfileTab === 'posts'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </button>

          {/* Comunidades / Feed Comum */}
          <button
            onClick={() => onSelectView('community')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'community'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Comunidades & Feed</span>
          </button>

          {/* Mural de Lembretes */}
          <button
            onClick={() => {
              onSelectView('profile');
              onSelectProfileTab('mural');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'profile' && activeProfileTab === 'mural'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Mural de Lembretes</span>
          </button>

          {/* Itens Salvos & Álbuns */}
          <button
            onClick={() => {
              onSelectView('profile');
              onSelectProfileTab('albums');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'profile' && activeProfileTab === 'albums'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Itens Salvos & Álbuns</span>
          </button>

          {/* Espaço de Hobby */}
          <button
            onClick={() => {
              onSelectView('profile');
              onSelectProfileTab('hobby');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'profile' && activeProfileTab === 'hobby'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Hobby & Mídia</span>
          </button>

          {/* Widgets & Interesses */}
          <button
            onClick={() => {
              onSelectView('profile');
              onSelectProfileTab('widgets');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'profile' && activeProfileTab === 'widgets'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Widgets & Metas</span>
          </button>

          {/* Configurações do Perfil */}
          <button
            onClick={onOpenEditProfile}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Configurações & @perfil</span>
          </button>

          <div className="pt-2 pb-1 border-t border-slate-200/50 dark:border-slate-800/60">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Institucional & Ajuda
            </p>

            {/* FAQ */}
            <button
              onClick={() => onSelectView('faq')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'faq'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Dúvidas & FAQ (5 Perguntas)</span>
            </button>

            {/* Privacidade & Termos */}
            <button
              onClick={() => onSelectView('privacy')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'privacy'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Privacidade & Termos</span>
            </button>

            {/* Central de Segurança & Testes de Escala */}
            <button
              onClick={onOpenSecurityModal}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 group"
              title="Auditoria de vazamentos de chaves e testes em larga escala"
            >
              <ShieldCheck className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between flex-1">
                <span>Segurança & Escala</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Auditado
                </span>
              </div>
            </button>

            {/* Simulação de Erro 404 */}
            <button
              onClick={() => onSelectView('notFound')}
              className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-2xl text-[11px] font-medium transition-all cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`}
              title="Testar visualização da página 404"
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Página 404 (Teste)</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Section: Contas & Dark Mode Toggle (Idêntico ao print) */}
      <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/80">
        {/* Painel Contas */}
        <div className="px-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Contas
          </p>
          {currentUser ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 truncate">
                  <UserAvatar
                    src={activeProfile.avatar}
                    type={activeProfile.avatarType}
                    alt={activeProfile.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {currentUser.handle}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                  title="Sair desta conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={onOpenAuthModal}
                className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors text-center cursor-pointer"
              >
                Criar uma nova conta
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold text-center cursor-pointer shadow-xs"
            >
              Entrar ou Criar Conta
            </button>
          )}
        </div>

        {/* Theme mode button (Lua/Sol) */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-[10px] text-slate-400 font-mono">Melin v2.0</span>
        </div>
      </div>
    </aside>
  );
};
