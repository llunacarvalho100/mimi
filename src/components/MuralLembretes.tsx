import React, { useState } from 'react';
import { Heart, Pin, Send, Sparkles, Smile, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StickyNote, NoteColor, UserProfile } from '../types';

interface MuralLembretesProps {
  notes: StickyNote[];
  activeProfile: UserProfile;
  currentViewerName: string;
  onAddNote: (note: Omit<StickyNote, 'id' | 'createdAt' | 'reactions'>) => void;
  onReactNote: (noteId: string, emoji: string) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

const COLOR_MAP: Record<NoteColor, { bg: string; border: string; text: string; pinBg: string }> = {
  yellow: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-950 dark:text-amber-100',
    pinBg: 'bg-amber-400',
  },
  pink: {
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-950 dark:text-rose-100',
    pinBg: 'bg-rose-400',
  },
  mint: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-950 dark:text-emerald-100',
    pinBg: 'bg-emerald-400',
  },
  lavender: {
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-950 dark:text-purple-100',
    pinBg: 'bg-purple-400',
  },
  peach: {
    bg: 'bg-orange-100 dark:bg-orange-950/60',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-950 dark:text-orange-100',
    pinBg: 'bg-orange-400',
  },
};

const STICKER_LIST = ['💖', '✨', '💌', '🌸', '☕', '🐱', '🧸', '🍰', '🛹', '⭐'];

export const MuralLembretes: React.FC<MuralLembretesProps> = ({
  notes,
  activeProfile,
  currentViewerName,
  onAddNote,
  onReactNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState<NoteColor>('pink');
  const [selectedSticker, setSelectedSticker] = useState('💖');
  const [authorName, setAuthorName] = useState(currentViewerName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onAddNote({
      targetProfileId: activeProfile.id,
      authorName: authorName.trim() || 'Amigo Secreto',
      content: inputText.trim(),
      color: selectedColor,
      sticker: selectedSticker,
      rotation: Math.floor(Math.random() * 6) - 3, // -3 to 3 deg
      pinned: false,
    });

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#34d399'],
    });

    setInputText('');
  };

  const handleReactionClick = (noteId: string, emoji: string) => {
    onReactNote(noteId, emoji);
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#fb7185'],
    });
  };

  const profileNotes = notes.filter((n) => n.targetProfileId === activeProfile.id);

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Title Header directly from user screenshot: "Mural de Lembretes Compartilhados" */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">💌</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Mural de Lembretes Compartilhados
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Amigos e familiares podem colar bilhetinhos carinhosos no perfil de {activeProfile.name}
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium tabular-nums">
          {profileNotes.length} lembretes colados
        </span>
      </div>

      {/* Input Box: "Escrever recadinho..." + Enviar button as in screenshot */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-3">
          {/* Author Name Input */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="text-slate-400">De:</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Seu nome ou apelido..."
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Color & Sticker Pickers */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Color circles */}
            <div className="flex items-center gap-1.5">
              {(['pink', 'yellow', 'mint', 'lavender', 'peach'] as NoteColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    COLOR_MAP[c].pinBg
                  } ${selectedColor === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                  title={`Post-it ${c}`}
                />
              ))}
            </div>

            {/* Sticker selector */}
            <div className="flex items-center gap-1">
              {STICKER_LIST.slice(0, 5).map((stk) => (
                <button
                  key={stk}
                  type="button"
                  onClick={() => setSelectedSticker(stk)}
                  className={`text-sm p-1 rounded-md transition-all ${
                    selectedSticker === stk ? 'bg-white dark:bg-slate-700 shadow-xs scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escrever recadinho carinhoso... (ex: Te amo infinitamente!, Passa pegar um café!)"
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-400 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </div>
      </form>

      {/* Grid of Notes with Cute Post-It Look */}
      {profileNotes.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <p className="text-2xl mb-2">💌</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            O mural ainda está vazio!
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Seja o primeiro a colar um recadinho doce para {activeProfile.name}!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {profileNotes.map((note) => {
            const colorStyle = COLOR_MAP[note.color] || COLOR_MAP.pink;
            return (
              <div
                key={note.id}
                style={{ transform: `rotate(${note.rotation}deg)` }}
                className={`relative p-4 rounded-2xl border shadow-sm transition-all hover:scale-102 hover:shadow-md hover:z-20 ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text}`}
              >
                {/* Pin pin head */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg select-none">{note.sticker}</span>
                    <span className="text-[11px] font-bold tracking-tight opacity-90 truncate max-w-[110px]">
                      {note.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTogglePin(note.id)}
                      className={`p-1 rounded-full text-xs transition-colors ${
                        note.pinned ? 'text-rose-600 opacity-100' : 'text-slate-400 opacity-40 hover:opacity-100'
                      }`}
                      title={note.pinned ? 'Fixado no topo' : 'Fixar bilhete'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-600 opacity-40 hover:opacity-100 text-xs transition-colors"
                      title="Excluir bilhete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <p className="font-caveat text-lg sm:text-xl leading-snug my-2 min-h-[48px] select-text">
                  {note.content}
                </p>

                {/* Footer with Timestamp and Reactions */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between mt-auto text-[10px]">
                  <span className="opacity-70">{note.createdAt}</span>

                  {/* Reaction buttons */}
                  <div className="flex items-center gap-1">
                    {['❤️', '✨', '🥺'].map((emoji) => {
                      const count = note.reactions?.[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReactionClick(note.id, emoji)}
                          className="px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 backdrop-blur-xs flex items-center gap-0.5 text-[10px] font-medium transition-transform active:scale-125"
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="font-bold tabular-nums">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
