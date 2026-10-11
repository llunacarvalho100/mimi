import React from 'react';
import { Compass, ArrowLeft, Home, Sparkles, Search } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface NotFoundPageProps {
  onGoHome: () => void;
  onGoCommunity: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onGoHome,
  onGoCommunity,
}) => {
  return (
    <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 animate-in fade-in duration-200">
      <Breadcrumbs
        items={[
          { label: 'Páginas', onClick: onGoHome },
          { label: 'Erro 404', active: true },
        ]}
      />

      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800 p-8 sm:p-12 text-center shadow-sm">
        {/* Visual 404 Graphic */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto border-4 border-rose-100 dark:border-rose-900/60 shadow-inner">
            <Compass className="w-12 h-12 animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-xs shadow-md">
            404
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Cantinho Não Encontrado
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
          A memória, álbum ou sub-página que você tentou acessar não existe, foi movida ou ainda não foi publicada.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Meu Perfil</span>
          </button>

          <button
            onClick={onGoCommunity}
            className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Explorar Feed da Comunidade</span>
          </button>
        </div>

        {/* Helpful hints */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
          <span>Dica: Use as abas do cabeçalho ou o menu lateral para navegar entre suas fotos, álbuns e lembretes.</span>
        </div>
      </div>
    </div>
  );
};
