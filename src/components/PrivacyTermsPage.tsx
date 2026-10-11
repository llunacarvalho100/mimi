import React, { useState } from 'react';
import { Shield, FileText, Cookie, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface PrivacyTermsPageProps {
  onBack: () => void;
  onGoProfile: () => void;
}

export const PrivacyTermsPage: React.FC<PrivacyTermsPageProps> = ({
  onBack,
  onGoProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'privacy' | 'terms' | 'cookies'>('privacy');

  return (
    <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 animate-in fade-in duration-200">
      <Breadcrumbs
        items={[
          { label: 'Páginas', onClick: onBack },
          { label: 'Privacidade & Termos', active: true },
        ]}
      />

      {/* Header Container */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Transparência, Privacidade & Termos
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compromisso com seus dados, ausência de rastreamento invasivo e armazenamento local
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pt-1 -mb-2">
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
              activeSubTab === 'privacy'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Política de Privacidade
            </span>
            {activeSubTab === 'privacy' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('terms')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
              activeSubTab === 'terms'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Termos de Uso
            </span>
            {activeSubTab === 'terms' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('cookies')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
              activeSubTab === 'cookies'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Cookie className="w-3.5 h-3.5" />
              Cookies & LocalStorage
            </span>
            {activeSubTab === 'cookies' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 shadow-sm">
        {activeSubTab === 'privacy' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs">
                <strong>Zero Rastreamento Invasivo:</strong> O Melin não vende seus dados, não utiliza rastreadores de publicidade de terceiros e armazena suas fotos e preferências com segurança no seu navegador.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                1. Quais dados são coletados?
              </h3>
              <p>
                Coletamos estritamente as informações necessárias para a experiência do aplicativo: nome de exibição, @identificador, biografia e as personalizações visuais escolhidas por você (cores, fontes e layout).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                2. Armazenamento de Fotos e Vídeos
              </h3>
              <p>
                Todas as fotos e vídeos enviados são processados e armazenados via <strong>IndexedDB</strong> local. Ao enviar vídeos de perfil com movimento, o Melin comprime a mídia e limita a duração a 5 segundos, sem áudio, preservando espaço no seu aparelho.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                3. Seus Direitos
              </h3>
              <p>
                Você tem controle total: ao excluir uma foto, capa ou conta, a mídia é removida imediatamente do armazenamento local do seu dispositivo.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'terms' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                1. Condições de Uso da Comunidade
              </h3>
              <p>
                O Melin é um espaço afetivo, criativo e respeitoso. Não é permitido publicar conteúdo ofensivo, discriminatório ou que viole direitos autorais de terceiros.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                2. Autoria de Conteúdo & Embeds
              </h3>
              <p>
                Ao compartilhar links de músicas, vídeos ou imagens, você confirma possuir os direitos de compartilhamento ou fazer uso justo de mídias públicas (como links do YouTube e plataformas de streaming).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                3. Lembretes Compartilhados
              </h3>
              <p>
                Os recados deixados em murais de amigos devem manter o espírito de carinho e colaboração do aplicativo. O titular do perfil tem o direito incondicional de remover qualquer nota.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'cookies' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Como usamos Cookies e LocalStorage?
              </h3>
              <p>
                Utilizamos armazenamento local exclusivamente para manter você conectado, lembrar sua escolha de tema (modo escuro ou claro), clima geográfico e preferências de fontes e cores.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-semibold">melin_session</span>
                <span className="text-slate-400">Sua sessão ativa</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-semibold">melin_darkmode</span>
                <span className="text-slate-400">Preferência visual de tema</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-semibold">melin_media_db</span>
                <span className="text-slate-400">IndexedDB de fotos e vídeos</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Nenhum cookie de rastreamento entre sites (cross-site tracking) é utilizado pelo Melin.
            </p>
          </div>
        )}
      </div>

      {/* Footer Back CTA */}
      <div className="mt-6 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 p-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-rose-500 font-semibold hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </button>

        <button
          onClick={onGoProfile}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer shadow-2xs"
        >
          Voltar ao Meu Perfil
        </button>
      </div>
    </div>
  );
};
