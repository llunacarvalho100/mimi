import React, { useState } from 'react';
import {
  Compass,
  X,
  Mail,
  FolderPlus,
  Image as ImageIcon,
  Users,
  User,
  Plus,
  Palette,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface QuickNavigationPopupProps {
  onNavigate: (destination: {
    view: 'profile' | 'community';
    tab?: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets';
    action?: 'create_post' | 'create_album' | 'write_note';
  }) => void;
  onOpenSecurity?: () => void;
}

export const QuickNavigationPopup: React.FC<QuickNavigationPopupProps> = ({
  onNavigate,
  onOpenSecurity,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (destination: {
    view: 'profile' | 'community';
    tab?: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets';
    action?: 'create_post' | 'create_album' | 'write_note';
  }) => {
    onNavigate(destination);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button with Speech Bubble matching the reference image */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 select-none">
        {/* Speech Bubble Pill: "O que está acontecendo?" */}
        <button
          onClick={() => setIsOpen(true)}
          className="hidden sm:flex items-center px-4 py-2 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer relative"
        >
          <span>O que está acontecendo?</span>
          {/* Subtle triangle point */}
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1d9bf0] rotate-45" />
        </button>

        {/* Circular Plus Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-13 h-13 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white flex items-center justify-center shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Abrir opções e navegação"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Pop-up with Direct Navigation and Update Actions */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111726] rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1d9bf0]/10 text-[#1d9bf0] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Para Onde Quer Ir?
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Navegue ou atualize áreas do Melin com um clique
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Criar Publicação Agora */}
              <button
                onClick={() => handleAction({ view: 'profile', action: 'create_post' })}
                className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#1d9bf0] to-indigo-500 text-white shadow-md shadow-sky-500/20 hover:opacity-95 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-xs font-bold">Publicar Agora</p>
                    <p className="text-[10px] text-white/80">Compartilhar fotos, notas ou ideias</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
              </button>

              {/* 2. Atualizar Lembretes no Mural */}
              <button
                onClick={() =>
                  handleAction({ view: 'profile', tab: 'mural', action: 'write_note' })
                }
                className="p-3 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">💌</span>
                  <span className="text-[10px] uppercase font-bold text-rose-500">Mural</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Atualizar Lembretes
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Colar ou ver bilhetinhos
                  </p>
                </div>
              </button>

              {/* 3. Atualizar Pastas de Álbuns */}
              <button
                onClick={() =>
                  handleAction({ view: 'profile', tab: 'albums', action: 'create_album' })
                }
                className="p-3 rounded-2xl border border-sky-200/80 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-100/60 dark:hover:bg-sky-900/40 transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">📁</span>
                  <span className="text-[10px] uppercase font-bold text-sky-500">Álbuns</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Atualizar Álbuns
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Criar ou organizar pastas
                  </p>
                </div>
              </button>

              {/* 4. Feed Comum com Outras Pessoas */}
              <button
                onClick={() => handleAction({ view: 'community' })}
                className="p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🌐</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-500">Comum</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Feed da Comunidade
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ver outras pessoas
                  </p>
                </div>
              </button>

              {/* 5. Espaço de Hobby & Mídia */}
              <button
                onClick={() => handleAction({ view: 'profile', tab: 'hobby' })}
                className="p-3 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🎨</span>
                  <span className="text-[10px] uppercase font-bold text-amber-500">Hobby</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Hobby & Mídia
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Vídeos e faixas
                  </p>
                </div>
              </button>

              {/* 6. Segurança & Auditoria de Escala */}
              {onOpenSecurity && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSecurity();
                  }}
                  className="p-3 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-all text-left flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">🛡️</span>
                    <span className="text-[10px] uppercase font-bold text-rose-500">Auditoria</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Segurança & Escala
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Vazamentos & Estresse
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
