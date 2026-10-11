import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Users,
  Image as ImageIcon,
  Lock,
  ArrowRight,
  Heart,
  CheckCircle2,
  LogIn,
  UserPlus,
  Eye,
} from 'lucide-react';

interface AuthLandingViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onExplorePublicFeed: () => void;
  onOpenFAQ: () => void;
  onOpenLegal: () => void;
}

export const AuthLandingView: React.FC<AuthLandingViewProps> = ({
  onOpenAuth,
  onExplorePublicFeed,
  onOpenFAQ,
  onOpenLegal,
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto w-full px-4 py-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4 pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 text-xs font-bold tracking-wide shadow-2xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Rede Autêntica Enterprise • 100% Pessoas Reais</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-2xl mx-auto">
          O seu cantinho de afeto, fotos e conexões reais.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Unindo a estética do Pinterest com a dinâmica ágil do Twitter/X. Perfis com banner e avatar responsivos, mural colaborativo e segurança com autenticação Google e 2FA.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Minha Conta Gratuita</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Já tenho uma conta (Entrar)</span>
          </button>

          <button
            onClick={onExplorePublicFeed}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Explorar como Visitante</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Perfis Estilo Twitter & Banner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Personalize sua capa, foto de perfil, cores e fontes exclusivas. Mídia com validação estrita anti-malware.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Mural Afetivo & Pastas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Deixe post-its com adesivos carinhosos para amigos, organize álbuns estéticos e ouça músicas favoritas.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Segurança Real & Sem Bots
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Isolamento multitenancy, rate limiting contra força bruta, suporte a 2FA e conformidade integral com a LGPD.
          </p>
        </div>
      </div>

      {/* Social Proof (Verified Community Members) */}
      <div className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 my-4 text-center">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Comunidade ativa com conexões autênticas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero perfis fantasmas</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google SSO integrado</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verificação em 2 etapas (2FA)</span>
          </span>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="pt-6 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>© 2026 PinTweet Tecnologia S.A. • CNPJ: 48.912.304/0001-82</div>
        <div className="flex items-center gap-4">
          <button onClick={onOpenFAQ} className="hover:text-rose-500 transition-colors cursor-pointer">
            Perguntas Frequentes (FAQ)
          </button>
          <button onClick={onOpenLegal} className="hover:text-rose-500 transition-colors cursor-pointer">
            Privacidade & LGPD
          </button>
          <button onClick={onOpenLegal} className="hover:text-rose-500 transition-colors cursor-pointer">
            Termos & Reembolso
          </button>
        </div>
      </footer>

      {/* Fixed Mobile CTA */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => onOpenAuth('register')}
          className="w-full py-3.5 px-5 rounded-2xl bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-500/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Criar Conta ou Fazer Login no PinTweet</span>
        </button>
      </div>
    </div>
  );
};
