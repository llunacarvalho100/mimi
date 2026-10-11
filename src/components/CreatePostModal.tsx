import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Film,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  Trash2,
  Video,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AlbumFolder, PinOrPost, UserProfile } from '../types';
import { parseMediaUrl } from '../utils/mediaEmbedParser';
import { saveMediaFile, generateAiCaption, StoredMedia } from '../utils/mediaStorage';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: UserProfile;
  albums: AlbumFolder[];
  onCreatePost: (post: Omit<PinOrPost, 'id' | 'createdAt' | 'likes' | 'reposts' | 'commentsCount'>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  albums,
  onCreatePost,
}) => {
  if (!isOpen) return null;

  const [postType, setPostType] = useState<'visual' | 'quick'>('visual');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id || '');
  const [tagsInput, setTagsInput] = useState('amor, memórias');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<StoredMedia | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedMedia = mediaUrl.trim() ? parseMediaUrl(mediaUrl.trim()) : null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Stored locally in IndexedDB (0 Tokens Cost!)
      const stored = await saveMediaFile(file);
      setUploadedMedia(stored);

      if (stored.type === 'video') {
        setVideoUrl(stored.dataUrl);
        setImageUrl('');
      } else {
        setImageUrl(stored.dataUrl);
        setVideoUrl('');
      }

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao processar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveUploadedMedia = () => {
    setUploadedMedia(null);
    setImageUrl('');
    setVideoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Only consume AI Token when user explicitly triggers this command
  const handleGenerateAiCaption = async () => {
    try {
      setIsGeneratingAi(true);
      const caption = await generateAiCaption({
        mediaType: videoUrl ? 'video' : 'image',
        contextTitle: title,
        tags: tagsInput,
      });
      setContent((prev) => (prev ? `${prev}\n\n${caption}` : caption));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim() && !videoUrl.trim() && !mediaUrl.trim()) return;

    const chosenAlbum = albums.find((a) => a.id === selectedAlbumId);
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onCreatePost({
      authorId: activeProfile.id,
      authorName: activeProfile.name,
      authorHandle: activeProfile.handle,
      authorAvatar: activeProfile.avatar,
      title: title.trim() || undefined,
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      mediaType: videoUrl ? 'video' : imageUrl ? 'image' : parsedMedia ? 'embed' : undefined,
      boardId: chosenAlbum?.id,
      boardName: chosenAlbum?.name,
      mediaEmbed: parsedMedia || undefined,
      tags: tagsArray,
      likedByMe: false,
    });

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111726] rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-rose-500 font-serif text-lg">✦</span>
            <span>Nova Publicação</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Type Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPostType('visual')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              postType === 'visual'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            📸 Cartão com Foto ou Vídeo
          </button>
          <button
            type="button"
            onClick={() => setPostType('quick')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              postType === 'quick'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            ✍️ Nota Rápida
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Título {postType === 'quick' ? '(opcional)' : ''}:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tarde inesquecível, Passeio na praia..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* REAL UPLOAD SYSTEM FOR PHOTOS AND VIDEOS (Stored in IndexedDB - 0 Tokens) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-rose-500" />
                <span>Upload de Foto ou Vídeo:</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                💾 Armazenamento Local • 0 Tokens
              </span>
            </div>

            {uploadedMedia ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/10">
                {uploadedMedia.type === 'video' ? (
                  <video
                    src={uploadedMedia.dataUrl}
                    controls
                    className="w-full max-h-56 rounded-xl object-contain bg-black"
                  />
                ) : (
                  <img
                    src={uploadedMedia.dataUrl}
                    alt="Upload"
                    className="w-full max-h-56 rounded-xl object-cover"
                  />
                )}

                <div className="p-2 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[200px] font-medium text-slate-700 dark:text-slate-300">
                    {uploadedMedia.name} ({uploadedMedia.sizeFormatted})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveUploadedMedia}
                    className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-rose-400 dark:hover:border-rose-500 transition-colors cursor-pointer bg-white dark:bg-slate-900"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1 text-slate-500 py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                    <span className="text-xs">Gravando no armazenamento do site...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 text-rose-500">
                      <ImageIcon className="w-5 h-5" />
                      <Video className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      Clique para escolher uma foto ou vídeo do seu aparelho
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Formatos suportados: MP4, WebM, JPG, PNG, WEBP, GIF
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description & Command AI Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Descrição da Publicação:
              </label>

              {/* AI Trigger - Explicitly consumes tokens only upon user command */}
              <button
                type="button"
                onClick={handleGenerateAiCaption}
                disabled={isGeneratingAi}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 transition-all cursor-pointer shadow-2xs"
                title="Gasta token apenas ao clicar neste comando"
              >
                {isGeneratingAi ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Sugerir Legenda com IA (Gasta Token)</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seus pensamentos ou clique em Sugerir Legenda com IA..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Fallback image/video URL if user wants to use a web link */}
          {!uploadedMedia && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Ou cole uma URL direta da internet:
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Album & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Pasta do Álbum:
              </label>
              <select
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Tags (separadas por vírgula):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="amor, primavera, viagem"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs cursor-pointer"
            >
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
