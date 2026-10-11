import React, { useState } from 'react';
import { FolderPlus, Folder, Trash2, ArrowUpRight, Check, Image as ImageIcon } from 'lucide-react';
import { AlbumFolder, UserProfile } from '../types';

interface AlbumPastasGridProps {
  albums: AlbumFolder[];
  activeProfile: UserProfile;
  selectedAlbumId: string | null;
  onSelectAlbum: (albumId: string | null) => void;
  onCreateAlbum: (album: Omit<AlbumFolder, 'id' | 'pinCount'>) => void;
  onDeleteAlbum: (albumId: string) => void;
  onUpdateAlbumCover: (albumId: string, newCover: string) => void;
}

export const AlbumPastasGrid: React.FC<AlbumPastasGridProps> = ({
  albums,
  activeProfile,
  selectedAlbumId,
  onSelectAlbum,
  onCreateAlbum,
  onDeleteAlbum,
  onUpdateAlbumCover,
}) => {
  const [albumNameInput, setAlbumNameInput] = useState('');
  const [editingCoverAlbumId, setEditingCoverAlbumId] = useState<string | null>(null);
  const [newCoverUrl, setNewCoverUrl] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumNameInput.trim()) return;

    onCreateAlbum({
      name: albumNameInput.trim(),
      cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
      profileId: activeProfile.id,
      color: '#f43f5e',
      description: `Pasta de fotos e inspirações de ${albumNameInput.trim()}`,
    });

    setAlbumNameInput('');
  };

  const handleSaveCover = (albumId: string) => {
    if (newCoverUrl.trim()) {
      onUpdateAlbumCover(albumId, newCoverUrl.trim());
    }
    setEditingCoverAlbumId(null);
    setNewCoverUrl('');
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Creation Bar exactly from user screenshots: "✨ Criar Nova Pasta de Álbum" */}
      <div className="mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✨</span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Criar Nova Pasta de Álbum
          </h2>
        </div>

        <form onSubmit={handleCreateSubmit} className="flex items-center gap-2 max-w-lg">
          <input
            type="text"
            value={albumNameInput}
            onChange={(e) => setAlbumNameInput(e.target.value)}
            placeholder="Nome do álbum... (ex: Viagem à Praia, Momentos Especiais)"
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-400 outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-500 dark:hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Criar Pasta
          </button>
        </form>
      </div>

      {/* Filter Bar (All vs Selected) */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Pastas de Álbuns:
        </h3>

        {selectedAlbumId && (
          <button
            onClick={() => onSelectAlbum(null)}
            className="text-xs text-rose-500 hover:underline font-medium"
          >
            Mostrar todas as publicações
          </button>
        )}
      </div>

      {/* Grid of Album Cards matching user screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {albums.map((album) => {
          const isSelected = selectedAlbumId === album.id;
          return (
            <div
              key={album.id}
              className={`group relative rounded-2xl border overflow-hidden transition-all bg-white dark:bg-slate-850 ${
                isSelected
                  ? 'ring-2 ring-rose-500 border-rose-400 shadow-md scale-102'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
              }`}
            >
              {/* Album Cover Photo with click to change */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={album.cover}
                  alt={album.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Edit Cover button */}
                <button
                  onClick={() => {
                    setEditingCoverAlbumId(album.id);
                    setNewCoverUrl(album.cover);
                  }}
                  className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                  title="Trocar capa deste álbum"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Trocar capa</span>
                </button>

                {/* Pin Count Pill */}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-white text-[10px] font-medium">
                  {album.pinCount} itens
                </span>
              </div>

              {/* Album Content info and buttons */}
              <div className="p-3.5">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                  {album.name}
                </h4>

                {album.description && (
                  <p className="text-[11px] text-slate-400 truncate mb-3">
                    {album.description}
                  </p>
                )}

                {/* Action buttons directly from screenshot: "Abrir Álbum" e "Excluir" */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onSelectAlbum(isSelected ? null : album.id)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{isSelected ? 'Álbum Ativo' : 'Abrir Álbum'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteAlbum(album.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Excluir álbum"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Popover to edit album cover */}
              {editingCoverAlbumId === album.id && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 flex flex-col justify-between z-30 animate-in fade-in">
                  <div>
                    <h5 className="text-xs font-bold mb-1">Trocar Capa do Álbum</h5>
                    <input
                      type="text"
                      value={newCoverUrl}
                      onChange={(e) => setNewCoverUrl(e.target.value)}
                      placeholder="Cole a URL da imagem..."
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setEditingCoverAlbumId(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveCover(album.id)}
                      className="px-3 py-1 bg-rose-500 text-white text-xs rounded font-medium"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
