import React, { useState } from 'react';
import { Shield, FileText, Cookie, Lock, ArrowLeft, CheckCircle2, RotateCcw, Building, Mail } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface PrivacyTermsPageProps {
  onBack: () => void;
  onGoProfile: () => void;
}

export const PrivacyTermsPage: React.FC<PrivacyTermsPageProps> = ({
  onBack,
  onGoProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'privacy' | 'terms' | 'cookies' | 'refund'>('privacy');

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 animate-in fade-in duration-200">
      <Breadcrumbs
        items={[
          { label: 'Páginas', onClick: onBack },
          { label: 'Conformidade Legal & Termos', active: true },
        ]}
      />

      {/* Header Container */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Transparência, Legalidade & Termos
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conformidade LGPD/GDPR, termos de uso claros, política de cookies e garantia de reembolso
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pt-1 -mb-2">
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
              Privacidade (LGPD)
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
              Termos de Serviço
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
              Política de Cookies
            </span>
            {activeSubTab === 'cookies' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('refund')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
              activeSubTab === 'refund'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Reembolso & Cancelamento
            </span>
            {activeSubTab === 'refund' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 shadow-sm">
        {activeSubTab === 'privacy' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs">
                <strong>Conformidade Rigorosa com a LGPD (Lei nº 13.709/2018):</strong> O PinTweet trata dados pessoais estritamente sob as bases legais de execução de contrato e consentimento legítimo. Seus dados nunca são comercializados com terceiros.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                1. Quais dados são coletados e por quê?
              </h3>
              <p>
                Coletamos apenas dados estritamente necessários para autenticação e personalização: nome, @username, e-mail de acesso, foto de perfil, capa e postagens publicadas pelo usuário. Não coletamos dados sensíveis desnecessários nem rastreamos geolocalização exata sem permissão pontual.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                2. Armazenamento e Criptografia
              </h3>
              <p>
                Senhas são protegidas com algoritmos de hash criptográfico e salt exclusivo. A autenticação via Google OAuth 2.0 utiliza tokens verificados. Toda a transmissão ocorre sob túnel TLS/HTTPS com criptografia ponta a ponta.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                3. Direitos do Titular (Art. 18 da LGPD)
              </h3>
              <p>
                Você pode solicitar a qualquer momento a confirmação de existência de tratamento, acesso aos dados, correção de dados incompletos ou a <strong>eliminação definitiva da sua conta</strong> através do menu de configurações ou via contato com nosso Encarregado de Proteção de Dados (DPO).
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'terms' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                1. Condições de Uso e Convivência
              </h3>
              <p>
                O PinTweet é uma plataforma focada em conexão humana autêntica, estética e colaborativa. É terminantemente proibido o envio de spam, ataques coordenados, conteúdo ofensivo, pornografia não autorizada ou violação de patentes e marcas registradas.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                2. Direitos Autorais e Mídia
              </h3>
              <p>
                O usuário declara ser o legítimo detentor dos direitos autorais de qualquer foto, ilustração ou vídeo carregado na plataforma, ou possuir autorização expressa para uso. Mídias embedadas (como YouTube e Spotify) operam sob as diretrizes de incorporação pública e APIs dos respectivos provedores.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                3. Suspensão por Fraude ou Malware
              </h3>
              <p>
                Contas que tentarem realizar injeção de scripts maliciosos (XSS, SQLi), tentativas de força bruta ou evasão de quotas de segurança serão sumariamente bloqueadas pelo sistema automatizado de segurança.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'cookies' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Como usamos Cookies e Armazenamento do Navegador?
              </h3>
              <p>
                Utilizamos armazenamento seguro exclusivamente para funções essenciais: manter sua sessão ativa de forma segura, recordar seu modo de exibição (claro/escuro) e reter preferências visuais do seu cantinho.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-semibold text-rose-500">pintweet_session_token</span>
                <span className="text-slate-400">Token de autenticação seguro (Essencial)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-semibold text-rose-500">melin_darkmode</span>
                <span className="text-slate-400">Tema e contraste da interface (Preferência)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-semibold text-rose-500">pintweet_cookie_consent</span>
                <span className="text-slate-400">Registro do seu consentimento explícito (Legal)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Não vendemos seus hábitos de navegação a redes de publicidade comportamental de terceiros.
            </p>
          </div>
        )}

        {activeSubTab === 'refund' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs">
                <strong>Garantia Incondicional de 7 Dias:</strong> Em conformidade com o Artigo 49 do Código de Defesa do Consumidor (CDC), qualquer aquisição de planos premium, badges de apoio ou serviços digitais pode ser reembolsada em até 7 dias corridos sem necessidade de justificativa.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                1. Como solicitar reembolso?
              </h3>
              <p>
                Basta enviar um e-mail para <strong className="text-rose-500">suporte@pintweet.app</strong> ou abrir uma solicitação no painel informando o ID da sua conta e o comprovante. O estorno é processado em até 48 horas úteis para o mesmo método original de pagamento (Pix, Cartão de Crédito ou Boleto).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                2. Cancelamento de Assinaturas
              </h3>
              <p>
                Assinaturas recorrentes podem ser pausadas ou canceladas a qualquer momento diretamente pelo seu perfil com um único clique, mantendo o acesso ativo até o término do ciclo já quitado.
              </p>
            </div>
          </div>
        )}

        {/* Corporate Transparency Details (LGPD / Real Business) */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-1">
            <Building className="w-3.5 h-3.5 text-rose-500" />
            <span>Dados Corporativos & Encarregado de Dados (DPO)</span>
          </div>
          <p>PinTweet Tecnologia e Mídia Ltda. • CNPJ: 48.912.304/0001-82</p>
          <p>Encarregado Geral de Proteção de Dados (DPO): Lucas Leite Cardoso</p>
          <p className="flex items-center gap-1.5 pt-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>Contato Jurídico & Privacidade: <strong>juridico@pintweet.app</strong></span>
          </p>
        </div>
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
          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer shadow-2xs"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};
