import React, { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { UserAccount, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserAccount[];
  onLogin: (account: UserAccount) => void;
  onRegister: (newAccount: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onLogin,
  onRegister,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [handleOrEmail, setHandleOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const query = handleOrEmail.trim().toLowerCase();
    const formattedHandle = query.startsWith('@') ? query : `@${query}`;

    const found = accounts.find(
      (acc) =>
        acc.handle.toLowerCase() === formattedHandle ||
        acc.email.toLowerCase() === query ||
        acc.handle.toLowerCase() === query
    );

    if (found) {
      onLogin(found);
      onClose();
    } else {
      // If not found in mock list, let them log in with created profile
      const newAcc: UserAccount = {
        id: `user-${Date.now()}`,
        name: query.replace('@', ''),
        handle: formattedHandle,
        email: `${query.replace('@', '')}@exemplo.com`,
        profile: {
          id: `profile-${Date.now()}`,
          name: query.replace('@', ''),
          handle: formattedHandle,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80',
          bio: 'Novo membro da comunidade ✨',
          customTitle: 'Meu Espaço Afetivo ✨',
          customSubtitle: 'Compartilhando minhas inspirações e momentos.',
          bgColor: '#ffffff',
          fontFamily: 'font-twitter',
          layoutMode: 'mosaic',
          themeColor: '#f43f5e',
        },
      };
      onLogin(newAcc);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !newHandle.trim()) {
      setErrorMsg('Por favor, preencha o nome e o @usuario.');
      return;
    }

    const cleanHandle = newHandle.trim().startsWith('@')
      ? newHandle.trim()
      : `@${newHandle.trim()}`;

    const newAcc: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      handle: cleanHandle,
      email: newEmail.trim() || `${cleanHandle.replace('@', '')}@exemplo.com`,
      password: newPassword,
      profile: {
        id: `profile-${Date.now()}`,
        name: name.trim(),
        handle: cleanHandle,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80',
        bio: 'colecionando memórias e momentos favoritos.',
        customTitle: 'Meu Espaço Afetivo ✨',
        customSubtitle: 'Nosso cantinho de memórias e afeto.',
        bgColor: '#ffeef4',
        fontFamily: 'font-twitter',
        layoutMode: 'mosaic',
        themeColor: '#f43f5e',
        relationshipDate: new Date().toISOString().split('T')[0],
      },
    };

    onRegister(newAcc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-rose-500 font-serif text-lg">✦</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 mb-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium border border-rose-200">
            {errorMsg}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                @usuário ou E-mail:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={handleOrEmail}
                  onChange={(e) => setHandleOrEmail(e.target.value)}
                  placeholder="@maymay ou usuario@email.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Senha:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar no Perfil</span>
            </button>

            {/* Quick Demo Login */}
            {accounts.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] text-slate-400 mb-1.5">Acesso rápido com conta existente:</p>
                <div className="flex flex-col gap-1">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        onLogin(acc);
                        onClose();
                      }}
                      className="text-xs text-rose-600 hover:underline font-medium text-center"
                    >
                      Entrar como {acc.name} ({acc.handle})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Nome de Exibição:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lua, Lucas, Mayara..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Configuração do @usuário:
              </label>
              <input
                type="text"
                value={newHandle}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewHandle(val.startsWith('@') ? val : `@${val}`);
                }}
                placeholder="@seu_usuario"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                E-mail (opcional):
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Senha:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
