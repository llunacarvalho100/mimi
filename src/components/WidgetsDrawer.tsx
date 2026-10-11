import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Tag,
  Calendar,
  Music,
  CheckCircle2,
  Plus,
  Trash2,
  Smile,
  Compass,
} from 'lucide-react';
import { UserProfile } from '../types';

interface WidgetsDrawerProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

interface BucketItem {
  id: string;
  text: string;
  completed: boolean;
}

export const WidgetsDrawer: React.FC<WidgetsDrawerProps> = ({
  profile,
  onUpdateProfile,
}) => {
  // Favorite Interests Tags
  const [interests, setInterests] = useState<string[]>([
    'Fotografia 35mm',
    'Café Artesanal',
    'Lo-fi & Vinil',
    'Viagens & Trilhas',
    'Piquenique ao Ar Livre',
    'Gatinhos & Pets',
    'Cinema Vintage',
    'Arquitetura SP',
  ]);
  const [newInterestInput, setNewInterestInput] = useState('');

  // Bucket list / Wishlist de momentos
  const [bucketList, setBucketList] = useState<BucketItem[]>([
    { id: '1', text: 'Assistir ao pôr do sol na praia de Santos 🌅', completed: true },
    { id: '2', text: 'Piquenique no Parque Ibirapuera com bolo caseiro 🧺', completed: true },
    { id: '3', text: 'Viagem de trem pelas serras de Minas Gerais 🚂', completed: false },
    { id: '4', text: 'Aprender uma receita nova juntos no domingo 🍝', completed: false },
  ]);
  const [newBucketInput, setNewBucketInput] = useState('');

  // Relationship date editor
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(profile.relationshipDate || '2024-06-12');

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterestInput.trim()) return;
    setInterests([...interests, newInterestInput.trim()]);
    setNewInterestInput('');
  };

  const handleRemoveInterest = (tag: string) => {
    setInterests(interests.filter((t) => t !== tag));
  };

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketInput.trim()) return;
    setBucketList([
      ...bucketList,
      { id: Date.now().toString(), text: newBucketInput.trim(), completed: false },
    ]);
    setNewBucketInput('');
  };

  const handleToggleBucket = (id: string) => {
    setBucketList(
      bucketList.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveBucket = (id: string) => {
    setBucketList(bucketList.filter((item) => item.id !== id));
  };

  const handleSaveDate = () => {
    onUpdateProfile({ relationshipDate: tempDate });
    setIsEditingDate(false);
  };

  // Milestone days
  const calculateDays = () => {
    if (!profile.relationshipDate) return 0;
    const diff = Math.floor(
      (new Date().getTime() - new Date(profile.relationshipDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  };

  const days = calculateDays();

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🧩</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Widgets Customizáveis de Interesses
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize seus interesses favoritos, marcos de relacionamento e metas afetivas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Contador de Dias & Momentos Especiais */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                Marco de Dias
              </span>
              <button
                onClick={() => setIsEditingDate(!isEditingDate)}
                className="text-[11px] text-rose-600 hover:underline"
              >
                {isEditingDate ? 'Cancelar' : 'Alterar Data'}
              </button>
            </div>

            {isEditingDate ? (
              <div className="space-y-2 my-2">
                <label className="text-[11px] text-slate-500 block">
                  Data de início do relacionamento / amizade:
                </label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800"
                />
                <button
                  onClick={handleSaveDate}
                  className="w-full py-1 text-xs font-semibold text-white bg-rose-500 rounded-md"
                >
                  Salvar Data
                </button>
              </div>
            ) : (
              <div className="my-3 text-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                  {days}
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                  Dias Colecionando Momentos Juntos
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Desde {new Date(profile.relationshipDate || '2024-06-12').toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-rose-200/60 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300">
            ✨ Cada dia é uma página linda da nossa história!
          </div>
        </div>

        {/* Widget 2: Nuvem de Interesses Favoritos */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-indigo-500" />
                Interesses & Hobbies
              </span>
              <span className="text-[11px] text-slate-400">{interests.length} tags</span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Temas que inspiram o perfil e guiam os pins compartilhados:
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3 max-h-32 overflow-y-auto">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveInterest(tag)}
                    className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5"
                    title="Remover interesse"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddInterest} className="flex gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={newInterestInput}
              onChange={(e) => setNewInterestInput(e.target.value)}
              placeholder="Adicionar novo interesse..."
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <button
              type="submit"
              className="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
              title="Adicionar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Widget 3: Metas Afetivas / Bucket List Compartilhada */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                Metas & Desejos Compartilhados
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {bucketList.filter((b) => b.completed).length}/{bucketList.length}
              </span>
            </div>

            <div className="space-y-1.5 my-2 max-h-36 overflow-y-auto">
              {bucketList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-amber-100 dark:border-amber-900/50 text-xs"
                >
                  <button
                    onClick={() => handleToggleBucket(item.id)}
                    className="flex items-center gap-2 text-left flex-1 mr-1"
                  >
                    <span className="text-sm select-none">
                      {item.completed ? '✅' : '⬜'}
                    </span>
                    <span
                      className={`truncate ${
                        item.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {item.text}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemoveBucket(item.id)}
                    className="text-slate-300 hover:text-rose-500 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddBucket} className="flex gap-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/60">
            <input
              type="text"
              value={newBucketInput}
              onChange={(e) => setNewBucketInput(e.target.value)}
              placeholder="Nova meta afetiva..."
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900"
            />
            <button
              type="submit"
              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
              title="Adicionar meta"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
