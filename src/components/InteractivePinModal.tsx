import React, { useState } from 'react';
import { X, Heart, Repeat2, MessageCircle, Send, Sparkles, Folder, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PinOrPost, UserProfile, AlbumFolder } from '../types';

interface InteractivePinModalProps {
  post: PinOrPost | null;
  onClose: () => void;
  activeProfile: UserProfile;
  albums: AlbumFolder[];
  onLikePost: (postId: string) => void;
  onRepostPost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

export const InteractivePinModal: React.FC<InteractivePinModalProps> = ({
  post,
  onClose,
  activeProfile,
  albums,
  onLikePost,
  onRepostPost,
  onAddComment,
}) => {
  if (!post) return null;

  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(post.id, commentText.trim());
    setCommentText('');
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.8 },
    });
  };

  const handleLike = () => {
    onLikePost(post.id);
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#ec4899', '#fda4af'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row">
        {/* Left Side: Media / Photo */}
        <div className="md:w-1/2 bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden min-h-[280px] md:min-h-[480px]">
          {post.videoUrl ? (
            <video
              src={post.videoUrl}
              controls
              playsInline
              className="w-full h-full object-contain max-h-[75vh]"
            />
          ) : post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title || 'Foto'}
              className="w-full h-full object-contain max-h-[75vh]"
              referrerPolicy="no-referrer"
            />
          ) : post.mediaEmbed ? (
            <div className="w-full p-4 flex flex-col items-center justify-center">
              {post.mediaEmbed.type === 'youtube' && post.mediaEmbed.embedId && (
                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${post.mediaEmbed.embedId}?autoplay=1`}
                    title="YouTube Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {post.mediaEmbed.type === 'spotify' && post.mediaEmbed.embedId && (
                <div className="w-full h-80 rounded-xl overflow-hidden">
                  <iframe
                    src={`https://open.spotify.com/embed/${post.mediaEmbed.embedId}`}
                    width="100%"
                    height="100%"
                    title="Spotify"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-center p-8">
              <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-2 opacity-60" />
              <p className="text-xs">Post textual de memórias</p>
            </div>
          )}

          {/* Close button on mobile overlay */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Details & Real-Time Comments */}
        <div className="md:w-1/2 flex flex-col justify-between p-5 sm:p-6 overflow-y-auto">
          {/* Top Bar with author & close */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-200 dark:ring-rose-900"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {post.authorName}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {post.authorHandle} • {post.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onRepostPost(post.id)}
                  className="px-3 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs"
                >
                  Salvar
                </button>
                <button
                  onClick={onClose}
                  className="hidden md:block p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Post Title & Text */}
            {post.title && (
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
                {post.title}
              </h3>
            )}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              {post.content}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive Media Embed in details if image is also shown */}
            {post.imageUrl && post.mediaEmbed && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trilha / Mídia Anexada:
                </p>
                {post.mediaEmbed.type === 'youtube' && post.mediaEmbed.embedId && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${post.mediaEmbed.embedId}`}
                      title="YouTube Video"
                      className="w-full h-full"
                    />
                  </div>
                )}
                {post.mediaEmbed.type === 'spotify' && post.mediaEmbed.embedId && (
                  <div className="h-32 w-full rounded-lg overflow-hidden">
                    <iframe
                      src={`https://open.spotify.com/embed/${post.mediaEmbed.embedId}`}
                      width="100%"
                      height="100%"
                      title="Spotify"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Metrics */}
            <div className="flex items-center gap-4 py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-500 mb-3">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 hover:text-rose-500 font-semibold"
              >
                <Heart
                  className={`w-4 h-4 ${post.likedByMe ? 'fill-rose-500 text-rose-500' : ''}`}
                />
                <span className="tabular-nums">{post.likes} curtidas</span>
              </button>
              <button
                onClick={() => onRepostPost(post.id)}
                className="flex items-center gap-1.5 hover:text-emerald-500 font-semibold"
              >
                <Repeat2 className="w-4 h-4" />
                <span className="tabular-nums">{post.reposts} salvos</span>
              </button>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span className="tabular-nums">
                  {(post.comments?.length || post.commentsCount || 0)} comentários
                </span>
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Comentários & Colaboração:
              </p>
              {(!post.comments || post.comments.length === 0) ? (
                <p className="text-xs text-slate-400 py-2">
                  Nenhum comentário ainda. Seja a primeira pessoa a comentar!
                </p>
              ) : (
                post.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adicionar um comentário carinhoso..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer"
              title="Enviar comentário"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
