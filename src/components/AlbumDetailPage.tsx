import React from 'react';
import { ArrowLeft, Folder, Plus, Heart, MessageCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AlbumFolder, PinOrPost, UserProfile } from '../types';
import { Breadcrumbs } from './Breadcrumbs';
import { FeedMasonryOrTwitter } from './FeedMasonryOrTwitter';

interface AlbumDetailPageProps {
  album: AlbumFolder;
  posts: PinOrPost[];
  activeProfile: UserProfile;
  onBack: () => void;
  onOpenCreatePost: () => void;
  onLikePost: (postId: string) => void;
  onRepostPost: (postId: string) => void;
  onOpenPinModal: (post: PinOrPost) => void;
}

export const AlbumDetailPage: React.FC<AlbumDetailPageProps> = ({
  album,
  posts,
  activeProfile,
  onBack,
  onOpenCreatePost,
  onLikePost,
  onRepostPost,
  onOpenPinModal,
}) => {
  const albumPosts = posts.filter((p) => p.boardId === album.id);

  return (
    <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 animate-in fade-in duration-200 space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Meu Perfil', onClick: onBack },
          { label: 'Álbuns', onClick: onBack },
          { label: album.name, active: true },
        ]}
      />

      {/* Album Banner & Details Card */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          <img
            src={album.cover}
            alt={album.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <button
            onClick={onBack}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar aos Álbuns</span>
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
              <Folder className="w-3 h-3" />
              Álbum & Coleção
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{album.name}</h1>
            {album.description && (
              <p className="text-xs text-slate-200 mt-0.5 line-clamp-1">{album.description}</p>
            )}
          </div>
        </div>

        {/* Sub-header info and Add memory CTA */}
        <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {albumPosts.length} {albumPosts.length === 1 ? 'memória guardada' : 'memórias guardadas'}
          </span>

          <button
            onClick={onOpenCreatePost}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar a este Álbum</span>
          </button>
        </div>
      </div>

      {/* Album Posts Grid */}
      {albumPosts.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            Nenhuma memória neste álbum ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
            Comece a guardar fotos, links e inspirações para organizar seus interesses.
          </p>
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer shadow-sm"
          >
            Guardar primeira memória
          </button>
        </div>
      ) : (
        <FeedMasonryOrTwitter
          posts={albumPosts}
          layoutMode={activeProfile.layoutMode}
          activeProfile={activeProfile}
          onLikePost={onLikePost}
          onRepostPost={onRepostPost}
          onOpenPinModal={onOpenPinModal}
          onOpenCreatePost={onOpenCreatePost}
        />
      )}
    </div>
  );
};
