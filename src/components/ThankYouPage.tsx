import React from 'react';
import { CheckCircle2, Heart, ArrowRight, ShieldCheck, Sparkles, Home, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Breadcrumbs } from './Breadcrumbs';

interface ThankYouPageProps {
  onGoHome: () => void;
  onGoProfile: () => void;
  userHandle?: string;
  userName?: string;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  onGoHome,
  onGoProfile,
  userHandle,
  userName,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6'],
    });
  };

  React.useEffect(() => {
    triggerConfetti();
  }, []);

  return (
    <div className="max-w-xl mx-auto w-full p-4 sm:p-6 animate-in fade-in duration-200">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: onGoHome },
          { label: 'Confirmação', active: true },
        ]}
      />

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800 p-8 text-center shadow-lg relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center mb-5 shadow-inner">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-200/60 dark:border-emerald-800/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ação Concluída com Sucesso!</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Obrigado por Fazer Parte!
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          {userName
            ? `Olá, ${userName} (${userHandle})! Sua presença torna o PinTweet um espaço ainda mais inspirador, autêntico e seguro.`
            : 'Sua ação foi registrada com persistência definitiva na nossa base de dados enterprise.'}
        </p>

        {/* Real proof and security highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Dados 100% Protegidos</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sessão segura com isolamento multitenancy e validação dupla.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Sem Bots ou Simulações</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Conexões e publicações 100% orgânicas com pessoas reais.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoProfile}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <span>Ir ao Meu Perfil</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Explorar Feed Comum</span>
          </button>
        </div>
      </div>
    </div>
  );
};
