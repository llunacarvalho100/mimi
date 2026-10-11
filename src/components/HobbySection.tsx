import React, { useState } from 'react';
import { Sparkles, ExternalLink, Play, Film, Disc3, Plus } from 'lucide-react';
import { MediaEmbed } from '../types';
import { parseMediaUrl, SAMPLE_SONGS } from '../utils/mediaEmbedParser';

interface HobbySectionProps {
  currentTrack?: MediaEmbed;
  onSetTrack: (track: MediaEmbed) => void;
}

export const HobbySection: React.FC<HobbySectionProps> = ({
  currentTrack,
  onSetTrack,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [activeEmbed, setActiveEmbed] = useState<MediaEmbed | null>(
    currentTrack || SAMPLE_SONGS[0]
  );

  const handleLoadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const parsed = parseMediaUrl(urlInput.trim());
    if (parsed) {
      setActiveEmbed(parsed);
      onSetTrack(parsed);
      setUrlInput('');
    }
  };

  const handleSelectPreset = (item: MediaEmbed) => {
    setActiveEmbed(item);
    onSetTrack(item);
  };

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/70 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
      {/* Header Renamed to Hobby as requested */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎨</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Hobby & Criação Multimídia
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cole links de vídeos, faixas musicais ou projetos criativos para exibir uma prévia interativa
            </p>
          </div>
        </div>

        {activeEmbed && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <Disc3 className="w-3.5 h-3.5 animate-spin" />
            <span>Ativo no Mural</span>
          </div>
        )}
      </div>

      {/* Input to paste hobby link */}
      <form onSubmit={handleLoadUrl} className="mb-5">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          Cole o link de um vídeo, áudio ou link de projeto:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Cole aqui o link do vídeo, música ou projeto criativo..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-400 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            Carregar Prévia
          </button>
        </div>
      </form>

      {/* Interactive Box */}
      {activeEmbed ? (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Prévia Interativa de Hobby:
            </span>
            <a
              href={activeEmbed.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
            >
              <span>Abrir link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Video iframe */}
          {activeEmbed.type === 'youtube' && activeEmbed.embedId && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeEmbed.embedId}`}
                title={activeEmbed.title || 'Vídeo de Hobby'}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Audio stream */}
          {activeEmbed.type === 'spotify' && activeEmbed.embedId && (
            <div className="w-full h-80 rounded-xl overflow-hidden shadow-sm">
              <iframe
                src={`https://open.spotify.com/embed/${activeEmbed.embedId}?utm_source=generator&theme=0`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Áudio de Hobby"
              />
            </div>
          )}

          {/* Direct Audio player */}
          {activeEmbed.type === 'audio' && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {activeEmbed.title}
              </p>
              <audio controls src={activeEmbed.url} className="w-full mt-2" />
            </div>
          )}

          {activeEmbed.type === 'link' && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {activeEmbed.title}
              </span>
              <span className="text-[11px] text-slate-400 truncate">{activeEmbed.url}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 mb-5">
          <p className="text-xs text-slate-400">Nenhuma prévia carregada ainda.</p>
        </div>
      )}

      {/* Suggestions */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Sugestões de Hobbies e Inspirações:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_SONGS.map((song, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(song)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                activeEmbed?.url === song.url
                  ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-850'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0">
                <Play className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {song.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{song.artistOrChannel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
