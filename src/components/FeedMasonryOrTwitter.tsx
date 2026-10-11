import React from 'react';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Share2,
  Pin,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PinOrPost, UserProfile, LayoutMode } from '../types';
import { UserAvatar } from './UserAvatar';

interface FeedMasonryOrTwitterProps {
  posts: PinOrPost[];
  layoutMode: LayoutMode;
  activeProfile: UserProfile;
  onLikePost: (postId: string) => void;
  onRepostPost: (postId: string) => void;
  onOpenPinModal: (post: PinOrPost) => void;
  onOpenCreatePost: () => void;
}

export const FeedMasonryOrTwitter: React.FC<FeedMasonryOrTwitterProps> = ({
  posts,
  layoutMode,
  activeProfile,
  onLikePost,
  onRepostPost,
  onOpenPinModal,
  onOpenCreatePost,
}) => {
  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    onLikePost(postId);
    confetti({
      particleCount: 18,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#ec4899', '#fda4af'],
    });
  };

  const handleRepost = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    onRepostPost(postId);
  };

  if (posts.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-12 px-4 bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-slate-200/60 dark:border-slate-800">
        <p className="text-2xl mb-2">📸</p>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Nenhuma publicação nesta pasta ainda
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-3">
          Compartilhe uma foto, nota ou link de mídia para preencher seu mural.
        </p>
        <button
          onClick={onOpenCreatePost}
          className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Criar Primeira Publicação
        </button>
      </div>
    );
  }

  // MODE 1: LINHA DO TEMPO (Chronological Timeline)
  if (layoutMode === 'timeline') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            onClick={() => onOpenPinModal(post)}
            className="p-5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs cursor-pointer group"
          >
            {/* Header: Author Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <UserAvatar
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-200 dark:ring-rose-900"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {post.authorName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {post.authorHandle}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                  </div>
                  {post.boardName && (
                    <span className="text-[11px] text-rose-500 font-medium">
                      em {post.boardName}
                    </span>
                  )}
                </div>
              </div>

              {post.isPinned && (
                <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-rose-500" />
                  <span>Fixado</span>
                </span>
              )}
            </div>

            {/* Post Title & Content */}
            {post.title && (
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {post.title}
              </h3>
            )}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3 select-text">
              {post.content}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Attached Video */}
            {post.videoUrl && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative rounded-2xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-800 max-h-[420px] bg-black"
              >
                <video
                  src={post.videoUrl}
                  controls
                  playsInline
                  className="w-full max-h-[420px] rounded-2xl object-contain bg-black"
                />
              </div>
            )}

            {/* Attached Photo */}
            {post.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-800 max-h-[400px] bg-slate-100 dark:bg-slate-800">
                <img
                  src={post.imageUrl}
                  alt={post.title || 'Foto'}
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Media Box if attached */}
            {post.mediaEmbed && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 mb-3"
              >
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Prévia Multimídia:</span>
                </div>

                {post.mediaEmbed.type === 'youtube' && post.mediaEmbed.embedId && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${post.mediaEmbed.embedId}`}
                      title={post.mediaEmbed.title || 'Vídeo'}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {post.mediaEmbed.type === 'spotify' && post.mediaEmbed.embedId && (
                  <div className="w-full h-32 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://open.spotify.com/embed/${post.mediaEmbed.embedId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="Áudio"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPinModal(post);
                }}
                className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="tabular-nums">{post.commentsCount || 0}</span>
              </button>

              <button
                onClick={(e) => handleRepost(e, post.id)}
                className={`flex items-center gap-1.5 transition-colors ${
                  post.repostedByMe ? 'text-emerald-500 font-bold' : 'hover:text-emerald-500'
                }`}
              >
                <Repeat2 className="w-3.5 h-3.5" />
                <span className="tabular-nums">{post.reposts || 0}</span>
              </button>

              <button
                onClick={(e) => handleLike(e, post.id)}
                className={`flex items-center gap-1.5 transition-colors ${
                  post.likedByMe
                    ? 'text-rose-500 fill-rose-500 font-bold'
                    : 'hover:text-rose-500'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${post.likedByMe ? 'fill-rose-500' : ''}`}
                />
                <span className="tabular-nums">{post.likes || 0}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                title="Copiar link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  // MODE 2: MOSAICO VISUAL (Waterfall Grid)
  if (layoutMode === 'mosaic') {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 w-full">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => onOpenPinModal(post)}
            className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-850 transition-all hover:shadow-md cursor-pointer"
          >
            {/* Video */}
            {post.videoUrl && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full overflow-hidden bg-black"
              >
                <video
                  src={post.videoUrl}
                  controls
                  playsInline
                  className="w-full max-h-72 object-contain bg-black"
                />
              </div>
            )}

            {/* Image */}
            {post.imageUrl && !post.videoUrl && (
              <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={post.imageUrl}
                  alt={post.title || 'Foto'}
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Hover overlay with Salvar button */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                  <div className="flex justify-end pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRepost(e, post.id);
                      }}
                      className="px-3 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                    >
                      Salvar
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-white pointer-events-auto">
                    <span className="text-[11px] font-medium backdrop-blur-md bg-black/40 px-2 py-0.5 rounded-full">
                      {post.boardName || 'Álbum'}
                    </span>
                    <button
                      onClick={(e) => handleLike(e, post.id)}
                      className="p-1 rounded-full bg-white/90 text-slate-800 hover:text-rose-500 transition-colors shadow-2xs"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${post.likedByMe ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="p-3">
              {post.title && (
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
                  {post.title}
                </h4>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-2">
                {post.content}
              </p>

              {/* Author & Likes */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                  <UserAvatar
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                    {post.authorName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span className="flex items-center gap-1 font-semibold tabular-nums">
                    <Heart className={`w-3 h-3 ${post.likedByMe ? 'text-rose-500 fill-rose-500' : ''}`} />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-0.5 tabular-nums">
                    <MessageCircle className="w-3 h-3" />
                    {post.commentsCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // MODE 3: PAINEL BENTO (Blocos Asimétricos)
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {posts.map((post, idx) => {
        const isFeatured = idx % 4 === 0;
        return (
          <div
            key={post.id}
            onClick={() => onOpenPinModal(post)}
            className={`p-4 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 transition-all shadow-2xs cursor-pointer flex flex-col justify-between ${
              isFeatured ? 'md:col-span-2' : 'col-span-1'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {post.authorName}
                    </p>
                    <p className="text-[10px] text-slate-400">{post.createdAt}</p>
                  </div>
                </div>
                <span className="text-xs text-rose-500 font-medium">{post.boardName}</span>
              </div>

              {post.title && (
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {post.title}
                </h3>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-2.5">
                {post.content}
              </p>

              {post.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden mb-2.5 h-48 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={post.imageUrl}
                    alt={post.title || 'Foto'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <button
                onClick={(e) => handleLike(e, post.id)}
                className="flex items-center gap-1 hover:text-rose-500 font-semibold tabular-nums"
              >
                <Heart className={`w-3.5 h-3.5 ${post.likedByMe ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>{post.likes}</span>
              </button>
              <button
                onClick={(e) => handleRepost(e, post.id)}
                className="flex items-center gap-1 hover:text-emerald-500 font-semibold tabular-nums"
              >
                <Repeat2 className="w-3.5 h-3.5" />
                <span>{post.reposts}</span>
              </button>
              <span className="flex items-center gap-1 tabular-nums">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{post.commentsCount || 0}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
