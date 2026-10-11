import React, { useState, useRef } from 'react';
import {
  Camera,
  Edit3,
  MapPin,
  Calendar,
  Cake,
  Share2,
  Sparkles,
  Check,
  Image as ImageIcon,
  X,
  Upload,
  Video,
  Film,
  Trash2,
  AlertCircle,
  Smartphone,
  Info,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { UserAvatar } from './UserAvatar';
import {
  processAvatarMedia,
  processCoverMedia,
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_COVER_IMAGE,
  AvatarProcessingResult,
  CoverProcessingResult,
} from '../utils/mediaStorage';

interface ProfileHeaderProps {
  profile: UserProfile;
  activeTab: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets';
  onSelectTab: (tab: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets') => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  postsCount: number;
  notesCount: number;
  albumsCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onUpdateProfile,
  postsCount,
  notesCount,
  albumsCount,
}) => {
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  // Profile fields editing
  const [nameInput, setNameInput] = useState(profile.name);
  const [handleInput, setHandleInput] = useState(profile.handle);
  const [titleInput, setTitleInput] = useState(profile.customTitle);
  const [subtitleInput, setSubtitleInput] = useState(profile.customSubtitle);
  const [bioInput, setBioInput] = useState(profile.bio);

  // Cover Modal State
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverPreview, setCoverPreview] = useState(profile.cover);
  const [coverStats, setCoverStats] = useState<CoverProcessingResult | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  // Avatar Modal State (Image or 5s Video with data suppression)
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [avatarTypePreview, setAvatarTypePreview] = useState<'image' | 'video'>(
    profile.avatarType || (profile.avatar?.startsWith('data:video') ? 'video' : 'image')
  );
  const [avatarStats, setAvatarStats] = useState<AvatarProcessingResult | null>(null);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handleInput.trim().startsWith('@')
      ? handleInput.trim()
      : `@${handleInput.trim()}`;

    onUpdateProfile({
      name: nameInput.trim() || profile.name,
      handle: cleanHandle || profile.handle,
      customTitle: titleInput.trim() || profile.customTitle,
      customSubtitle: subtitleInput.trim() || profile.customSubtitle,
      bio: bioInput.trim(),
    });
    setIsEditingModalOpen(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    confetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.7 },
    });
  };

  // Avatar Upload Handler
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingAvatar(true);
    setAvatarError(null);

    try {
      const result = await processAvatarMedia(file);
      setAvatarPreview(result.dataUrl);
      setAvatarTypePreview(result.type);
      setAvatarStats(result);
    } catch (err: any) {
      setAvatarError(err.message || 'Erro ao processar arquivo selecionado.');
    } finally {
      setIsProcessingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveAvatar = () => {
    onUpdateProfile({
      avatar: avatarPreview,
      avatarType: avatarTypePreview,
    });
    setShowAvatarModal(false);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
  };

  const handleDeleteAvatar = () => {
    onUpdateProfile({
      avatar: DEFAULT_AVATAR_IMAGE,
      avatarType: 'image',
    });
    setAvatarPreview(DEFAULT_AVATAR_IMAGE);
    setAvatarTypePreview('image');
    setAvatarStats(null);
    setShowAvatarModal(false);
  };

  // Cover Upload Handler
  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingCover(true);
    setCoverError(null);

    try {
      const result = await processCoverMedia(file);
      setCoverPreview(result.dataUrl);
      setCoverStats(result);
    } catch (err: any) {
      setCoverError(err.message || 'Erro ao processar imagem de capa.');
    } finally {
      setIsProcessingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveCover = () => {
    onUpdateProfile({
      cover: coverPreview,
      coverType: 'image',
    });
    setShowCoverModal(false);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
  };

  const handleDeleteCover = () => {
    onUpdateProfile({
      cover: DEFAULT_COVER_IMAGE,
      coverType: 'image',
    });
    setCoverPreview(DEFAULT_COVER_IMAGE);
    setCoverStats(null);
    setShowCoverModal(false);
  };

  const COVER_PRESETS = [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=80',
  ];

  const isProfileVideo =
    profile.avatarType === 'video' ||
    (typeof profile.avatar === 'string' &&
      (profile.avatar.startsWith('data:video') ||
        profile.avatar.endsWith('.mp4') ||
        profile.avatar.endsWith('.webm')));

  return (
    <div className="w-full max-w-2xl mx-auto select-none">
      {/* Profile Container modeled after the reference image */}
      <div className="bg-white/80 dark:bg-[#111726]/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden shadow-sm">
        {/* Banner Cover with click to upload and hover action */}
        <div
          onClick={() => {
            setCoverPreview(profile.cover);
            setCoverStats(null);
            setCoverError(null);
            setShowCoverModal(true);
          }}
          className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 group cursor-pointer"
          title="Clique para alterar a capa do perfil"
        >
          <img
            src={profile.cover}
            alt="Capa do perfil"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_COVER_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCoverPreview(profile.cover);
              setCoverStats(null);
              setCoverError(null);
              setShowCoverModal(true);
            }}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 transition-all opacity-90 group-hover:opacity-100 cursor-pointer shadow-md"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Trocar capa</span>
          </button>
        </div>

        {/* Profile Info Row (Avatar + Buttons: Compartilhar / Editar Perfil) */}
        <div className="px-5 sm:px-6 pb-4">
          <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-3">
            {/* Round Avatar overlapping cover with video loop support */}
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                setAvatarPreview(profile.avatar);
                setAvatarTypePreview(
                  profile.avatarType || (profile.avatar?.startsWith('data:video') ? 'video' : 'image')
                );
                setAvatarStats(null);
                setAvatarError(null);
                setShowAvatarModal(true);
              }}
              title="Clique para alterar foto ou vídeo de perfil"
            >
              <UserAvatar
                src={profile.avatar}
                type={profile.avatarType}
                alt={profile.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-[#111726] shadow-xl ring-2 ring-rose-400/40"
              />

              {/* Moving Video Indicator Badge */}
              {isProfileVideo && (
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-rose-500/95 text-white text-[9px] font-bold shadow-md flex items-center gap-0.5 pointer-events-none ring-2 ring-white dark:ring-[#111726]">
                  <Film className="w-2.5 h-2.5" />
                  <span>5s</span>
                </span>
              )}

              {/* Hover overlay with Camera icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarPreview(profile.avatar);
                  setAvatarTypePreview(
                    profile.avatarType || (profile.avatar?.startsWith('data:video') ? 'video' : 'image')
                  );
                  setAvatarStats(null);
                  setAvatarError(null);
                  setShowAvatarModal(true);
                }}
                className="absolute inset-0 rounded-full bg-black/55 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                title="Trocar avatar ou vídeo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Trocar</span>
              </button>
            </div>

            {/* Top Right Action Buttons: "Compartilhar", "Editar perfil" */}
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={handleShare}
                className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </button>

              <button
                onClick={() => {
                  setNameInput(profile.name);
                  setHandleInput(profile.handle);
                  setTitleInput(profile.customTitle);
                  setSubtitleInput(profile.customSubtitle);
                  setBioInput(profile.bio);
                  setIsEditingModalOpen(true);
                }}
                className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar perfil</span>
              </button>
            </div>
          </div>

          {/* User Name & Handle */}
          <div className="mb-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{profile.name}</span>
            </h1>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {profile.handle}
            </p>
          </div>

          {/* Bio text */}
          {profile.bio && (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              {profile.bio}
            </p>
          )}

          {/* Metadata Row: Location, Birthday, Join Date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Guarulhos, Brasil</span>
            </span>

            <span className="flex items-center gap-1">
              <Cake className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nasceu em 5 de junho</span>
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Participa desde 2024</span>
            </span>
          </div>

          {/* Profile Tabs matching reference image (`Posts`, `Lembretes`, `Álbuns`, `Hobby`, `Widgets`) */}
          <div className="flex items-center justify-around border-t border-slate-200/60 dark:border-slate-800/80 pt-1 -mb-1">
            <button
              onClick={() => onSelectTab('posts')}
              className={`py-3 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
                activeTab === 'posts'
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Posts</span>
              {activeTab === 'posts' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('mural')}
              className={`py-3 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
                activeTab === 'mural'
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Lembretes ({notesCount})</span>
              {activeTab === 'mural' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('albums')}
              className={`py-3 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
                activeTab === 'albums'
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Álbuns ({albumsCount})</span>
              {activeTab === 'albums' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('hobby')}
              className={`py-3 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
                activeTab === 'hobby'
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Hobby</span>
              {activeTab === 'hobby' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('widgets')}
              className={`py-3 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
                activeTab === 'widgets'
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Widgets</span>
              {activeTab === 'widgets' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Editar Perfil & Configuração de @usuario */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-500" />
                Configurar Perfil & @usuário
              </h3>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileDetails} className="space-y-3">
              <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                <label className="text-xs font-bold text-rose-700 dark:text-rose-300 block mb-1">
                  Identificador @usuário:
                </label>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHandleInput(val.startsWith('@') ? val : `@${val}`);
                  }}
                  placeholder="@usuario"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Nome de Exibição:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Título do Cantinho:
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Biografia:
                </label>
                <textarea
                  rows={2}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Trocar Capa: Upload direto do navegador/celular, Salvamento e Exclusão */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-rose-500" />
                Imagem de Capa do Perfil
              </h3>
              <button
                onClick={() => setShowCoverModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden File Input for mobile device / desktop file picker */}
            <input
              type="file"
              ref={coverFileInputRef}
              accept="image/*"
              onChange={handleCoverFileSelect}
              className="hidden"
            />

            {/* Cover Live Preview */}
            <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200 dark:border-slate-700">
              <img
                src={coverPreview}
                alt="Prévia da capa"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                Prévia da Capa
              </span>
            </div>

            {/* Upload Area for device / mobile */}
            <div
              onClick={() => coverFileInputRef.current?.click()}
              className="p-4 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800/60 hover:border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-center cursor-pointer transition-all hover:scale-[1.01] mb-3 group"
            >
              {isProcessingCover ? (
                <div className="flex flex-col items-center justify-center py-2 text-rose-600 dark:text-rose-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-1.5" />
                  <span className="text-xs font-semibold">Otimizando e comprimindo imagem...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 justify-center">
                    <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                    <span>Upload de Foto do Aparelho ou Navegador</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Toque para escolher da galeria, câmera ou arquivos do celular/PC
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {coverError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{coverError}</span>
              </div>
            )}

            {/* Compression Stats */}
            {coverStats && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between mb-3">
                <span className="flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Capa pronta para salvar
                </span>
                <span className="font-mono font-semibold">
                  {coverStats.sizeFormatted} ({coverStats.reductionPercent}% reduzido)
                </span>
              </div>
            )}

            {/* Presets Row */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Ou escolha um tema pronto:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {COVER_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCoverPreview(url);
                      setCoverStats(null);
                    }}
                    className={`h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      coverPreview === url ? 'border-rose-500 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Tema ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Excluir / Cancelar / Salvar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDeleteCover}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Excluir capa atual e restaurar padrão"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Capa</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoverModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCover}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Capa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Trocar Avatar: Upload de fotos ou vídeos de até 5s em loop com repressão máxima de informação */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-500" />
                  Foto ou Vídeo de Perfil (5s Loop)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload do celular ou navegador com compressão inteligente
                </p>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden File Input for mobile device / desktop (accepts images and video up to 5s) */}
            <input
              type="file"
              ref={avatarFileInputRef}
              accept="image/*,video/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />

            {/* Live Media Preview (Image or Looping Muted Video) */}
            <div className="flex flex-col items-center justify-center my-3">
              <div className="relative group">
                {avatarTypePreview === 'video' || avatarPreview.startsWith('data:video') ? (
                  <video
                    src={avatarPreview}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-24 h-24 rounded-full object-cover border-4 border-rose-400 shadow-xl ring-2 ring-rose-300/40"
                  />
                ) : (
                  <img
                    src={avatarPreview}
                    alt="Prévia"
                    className="w-24 h-24 rounded-full object-cover border-4 border-rose-400 shadow-xl ring-2 ring-rose-300/40"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_AVATAR_IMAGE;
                    }}
                  />
                )}

                {/* Badge for Video Avatar */}
                {(avatarTypePreview === 'video' || avatarPreview.startsWith('data:video')) && (
                  <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 border-2 border-white dark:border-slate-900">
                    <Film className="w-3 h-3" />
                    <span>5s loop</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                {avatarTypePreview === 'video'
                  ? '🎬 Base em movimento (vídeo de 5s mudo em loop contínuo)'
                  : '📷 Foto de perfil estática'}
              </span>
            </div>

            {/* Upload Selector Card */}
            <div
              onClick={() => avatarFileInputRef.current?.click()}
              className="p-4 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800/60 hover:border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-center cursor-pointer transition-all hover:scale-[1.01] mb-3 group"
            >
              {isProcessingAvatar ? (
                <div className="flex flex-col items-center justify-center py-2 text-rose-600 dark:text-rose-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-1.5" />
                  <span className="text-xs font-semibold">
                    Reconhecendo arquivo e reprimindo o máximo de dados...
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Silenciando áudio, limitando a 5s e compactando
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 justify-center">
                    <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                    <span>Upload do Celular ou Navegador</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Escolha uma <strong>foto</strong> ou <strong>vídeo curto</strong> (MP4, WebM, MOV). Vídeos são automaticamente cortados para 5s em loop sem áudio.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {avatarError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{avatarError}</span>
              </div>
            )}

            {/* Recognition & Maximum Data Suppression Report */}
            {avatarStats && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold">
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    Mídia Reconhecida & Otimizada
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                    {avatarStats.reductionPercent}% reprimido
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="block text-[10px] text-slate-400">Duração no perfil:</span>
                    <strong className="text-slate-800 dark:text-slate-100">
                      {avatarStats.duration ? `${avatarStats.duration}s em loop` : 'Foto única'}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="block text-[10px] text-slate-400">Tamanho final:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {avatarStats.sizeFormatted}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  💡 {avatarStats.infoMessage}
                </p>
              </div>
            )}

            {/* Informative Note for Videos */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2 mb-4">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Privacidade e Economia:</strong> Para preservar desempenho e espaço, os vídeos são reprimidos para 5 segundos máximos, sem faixa de áudio e em resolução quadrada ideal para o perfil.
              </span>
            </div>

            {/* Action Buttons: Excluir Foto / Cancelar / Salvar no Perfil */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Excluir foto/vídeo atual e restaurar padrão"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Foto</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar no Perfil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
