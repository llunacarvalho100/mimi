import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('melin_cookie_consent');
    if (!hasConsented) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('melin_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-3 duration-200">
      <div className="p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl text-xs text-slate-700 dark:text-slate-300 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 shrink-0 mt-0.5">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Privacidade & Armazenamento Local</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                O Melin armazena suas fotos, vídeos e personalizações no seu dispositivo com total segurança e sem rastreadores invasivos de terceiros.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenPrivacy}
            className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
          >
            Ver Política & Termos
          </button>

          <button
            onClick={handleAccept}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Entendido & Aceitar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
