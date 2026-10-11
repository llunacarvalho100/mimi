import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, Shield, Video, Users, Palette, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface FaqPageProps {
  onBack: () => void;
  onGoProfile: () => void;
}

interface FaqItem {
  id: number;
  question: string;
  category: string;
  icon: React.ReactNode;
  answer: string;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onBack, onGoProfile }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQ_ITEMS: FaqItem[] = [
    {
      id: 1,
      question: 'Como funciona a personalização de fontes, cores e tema do meu perfil?',
      category: 'Personalização',
      icon: <Palette className="w-4 h-4 text-pink-500" />,
      answer:
        'Cada perfil no Melin possui total independência estética! Na aba "Widgets" ou no botão "Personalizar", você pode alterar o estilo visual (Mosaico estilo Pinterest, Feed Cronológico ou Painel Bento), a família de fontes (Caveat, Poppins, Playfair, Jakarta, Outfit), a cor de fundo e a cor de destaque. As alterações são salvas automaticamente no seu navegador.',
    },
    {
      id: 2,
      question: 'Como funciona o vídeo de até 5 segundos no perfil com movimento?',
      category: 'Mídia e Avatar',
      icon: <Video className="w-4 h-4 text-purple-500" />,
      answer:
        'Ao clicar no seu avatar ou no ícone da câmera, você pode fazer upload de um arquivo de vídeo (MP4, WebM ou MOV) diretamente do seu celular ou navegador. O Melin analisa e reprime a informação ao máximo: recorta estritamente para os primeiros 5 segundos em loop, remove qualquer áudio para manter a página silenciosa e compacta para resolução quadrada de avatar (200x200), reduzindo até 95% do tamanho original.',
    },
    {
      id: 3,
      question: 'Quem pode ver e colar lembretes no Mural Colaborativo?',
      category: 'Colaboração Afetiva',
      icon: <Users className="w-4 h-4 text-emerald-500" />,
      answer:
        'O Mural de Lembretes foi concebido como um espaço acolhedor. Qualquer pessoa ou amigo que visitar o seu cantinho pode deixar um bilhete afetuoso (post-it colorido) com mensagem e adesivo/sticker. Como dono do cantinho, você pode fixar os bilhetes mais importantes no topo ou excluir mensagens quando desejar.',
    },
    {
      id: 4,
      question: 'O Melin gasta tokens de inteligência artificial desnecessários?',
      category: 'Economia e Performance',
      icon: <Shield className="w-4 h-4 text-blue-500" />,
      answer:
        'Não! O Melin segue uma política estrita de consumo de tokens: todas as funções centrais (upload de fotos e vídeos, personalização de layout, salvamento em álbuns, reprodução musical e lembretes) funcionam no seu próprio navegador via IndexedDB e Web APIs sem gastar nenhum token. A inteligência artificial só entra em ação se você solicitar explicitamente uma legenda poética.',
    },
    {
      id: 5,
      question: 'Como funciona a divisão entre "Meu Perfil" e "Feed da Comunidade"?',
      category: 'Navegação e Privacidade',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      answer:
        'O Melin mantém uma separação limpa: o "Meu Perfil" é o seu santuário particular com suas fotos, seus álbuns, seu mural e seu hobby. Já o "Feed da Comunidade" reúne publicações e inspirações compartilhadas por outros usuários. Você alterna entre os dois mundos discretamente pelo topo da página ou pelo menu lateral.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 animate-in fade-in duration-200">
      <Breadcrumbs
        items={[
          { label: 'Páginas', onClick: onBack },
          { label: 'Central de Dúvidas (FAQ)', active: true },
        ]}
      />

      {/* Header */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Perguntas Frequentes (FAQ)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tire suas principais dúvidas sobre o funcionamento do Melin
            </p>
          </div>
        </div>
      </div>

      {/* Accordion List with 5 Questions */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.id}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden transition-all shadow-2xs"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                      {item.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {item.question}
                    </h3>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4.5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-150">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Back CTA */}
      <div className="mt-6 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 p-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-rose-500 font-semibold hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a tela anterior</span>
        </button>

        <button
          onClick={onGoProfile}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer shadow-2xs"
        >
          Ir para Meu Perfil
        </button>
      </div>
    </div>
  );
};
