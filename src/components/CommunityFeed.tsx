import React, { useState } from 'react';
import { Users, Heart, Repeat2, MessageCircle, Sparkles, Filter, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PinOrPost, UserProfile } from '../types';

interface CommunityFeedProps {
  posts: PinOrPost[];
  activeProfile: UserProfile;
  onLikePost: (postId: string) => void;
  onRepostPost: (postId: string) => void;
  onOpenPinModal: (post: PinOrPost) => void;
  onOpenCreatePost: () => void;
}

const COMMUNITY_POSTS: PinOrPost[] = [
  {
    id: 'comm-1',
    authorId: 'user-clara',
    authorName: 'Clara Silveira 🌻',
    authorHandle: '@clara_arte',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    title: 'Aquarela de sábado à tarde 🎨✨',
    content: 'Passei o dia pintando flores silvestres inspiradas na primavera. A arte cura qualquer cansaço da semana corrida!',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    tags: ['arte', 'aquarela', 'primavera', 'criatividade'],
    likes: 38,
    reposts: 5,
    commentsCount: 7,
    createdAt: 'Há 15 min',
    likedByMe: false,
  },
  {
    id: 'comm-2',
    authorId: 'user-felipe',
    authorName: 'Felipe Santos 🛹',
    authorHandle: '@felipe_sp',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Sessão de skate no Vale do Anhangabaú 🌇',
    content: 'Fim de tarde com a luz dourada batendo nos prédios do centro de SP. Dias bons que recarregam a energia.',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    tags: ['sãopaulo', 'skate', 'rua', 'goldenhour'],
    likes: 72,
    reposts: 11,
    commentsCount: 9,
    createdAt: 'Há 45 min',
    likedByMe: false,
  },
  {
    id: 'comm-3',
    authorId: 'user-gabriel',
    authorName: 'Gabriel & Laura ☕',
    authorHandle: '@cafe_duo',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Receita do novo blend coado com notas de cacau 🍫',
    content: 'Descobrimos uma torra artesanal sensacional hoje em Pinheiros! Quem aqui também não vive sem um bom café fresquinho?',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    tags: ['café', 'gastronomia', 'manhã', 'afeto'],
    likes: 54,
    reposts: 8,
    commentsCount: 4,
    createdAt: 'Há 2 horas',
    likedByMe: false,
  },
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  activeProfile,
  onLikePost,
  onRepostPost,
  onOpenPinModal,
  onOpenCreatePost,
}) => {
  const [filter, setFilter] = useState<'all' | 'popular' | 'media'>('all');
  const allCommunityItems = [...posts, ...COMMUNITY_POSTS];

  const filteredItems = allCommunityItems.filter((item) => {
    if (filter === 'media') return Boolean(item.imageUrl || item.mediaEmbed);
    if (filter === 'popular') return item.likes > 40;
    return true;
  });

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    onLikePost(postId);
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#ec4899'],
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Header Info */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Feed Comum da Comunidade
            </h2>
            <p className="text-[11px] text-slate-400">
              Acompanhe publicações, fotos e ideias compartilhadas por outras pessoas
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreatePost}
          className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Postar</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-rose-500 text-white font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Todas as Postagens
        </button>
        <button
          onClick={() => setFilter('popular')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            filter === 'popular'
              ? 'bg-rose-500 text-white font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🔥 Em Destaque
        </button>
        <button
          onClick={() => setFilter('media')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            filter === 'media'
              ? 'bg-rose-500 text-white font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📸 Apenas Fotos
        </button>
      </div>

      {/* Stream of posts */}
      <div className="space-y-4">
        {filteredItems.map((post) => (
          <article
            key={post.id}
            onClick={() => onOpenPinModal(post)}
            className="p-5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs cursor-pointer group"
          >
            {/* Author row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-200 dark:ring-rose-900"
                  referrerPolicy="no-referrer"
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
                </div>
              </div>
            </div>

            {/* Post content */}
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
                  <span key={idx} className="text-xs text-rose-500 hover:underline">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Video */}
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

            {/* Media */}
            {post.imageUrl && !post.videoUrl && (
              <div className="relative rounded-2xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-800 max-h-[400px] bg-slate-100 dark:bg-slate-800">
                <img
                  src={post.imageUrl}
                  alt={post.title || 'Foto'}
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Interaction bar */}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onRepostPost(post.id);
                }}
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
