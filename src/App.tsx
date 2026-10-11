import React, { useState, useEffect } from 'react';
import {
  INITIAL_PROFILE,
  INITIAL_ALBUMS,
  INITIAL_STICKY_NOTES,
  INITIAL_POSTS,
  INITIAL_NOTIFICATIONS,
} from './utils/mockData';
import { DEFAULT_WEATHER_STATE } from './utils/weatherSeason';
import {
  UserProfile,
  UserAccount,
  AlbumFolder,
  StickyNote,
  PinOrPost,
  WeatherSeasonState,
  AppNotification,
  MediaEmbed,
} from './types';
import { ApiClient } from './services/apiClient';
import { FloatingParticles } from './components/FloatingParticles';
import { Sidebar } from './components/Sidebar';
import { TopSearchBar } from './components/TopSearchBar';
import { ProfileHeader } from './components/ProfileHeader';
import { MuralLembretes } from './components/MuralLembretes';
import { HobbySection } from './components/HobbySection';
import { AlbumPastasGrid } from './components/AlbumPastasGrid';
import { FeedMasonryOrTwitter } from './components/FeedMasonryOrTwitter';
import { CommunityFeed } from './components/CommunityFeed';
import { CreatePostModal } from './components/CreatePostModal';
import { NotificationsModal } from './components/NotificationsModal';
import { WeatherWidgetModal } from './components/WeatherWidgetModal';
import { InteractivePinModal } from './components/InteractivePinModal';
import { WidgetsDrawer } from './components/WidgetsDrawer';
import { AuthModal } from './components/AuthModal';
import { AuthLandingView } from './components/AuthLandingView';
import { ThankYouPage } from './components/ThankYouPage';
import { QuickNavigationPopup } from './components/QuickNavigationPopup';
import { Breadcrumbs } from './components/Breadcrumbs';
import { NotFoundPage } from './components/NotFoundPage';
import { FaqPage } from './components/FaqPage';
import { PrivacyTermsPage } from './components/PrivacyTermsPage';
import { AlbumDetailPage } from './components/AlbumDetailPage';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { SecurityModal } from './security';
import { Plus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('melin_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Current authenticated user (Clean slate: never forced auto-login to mock bots)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const token = ApiClient.getToken();
    if (!token) return null;
    const cached = localStorage.getItem('pintweet_active_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Active Profile (or clean fallback if visitor)
  const activeProfile: UserProfile = currentUser?.profile || INITIAL_PROFILE;

  // View state: 'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'albumDetail' | 'thankYou' | 'landing'
  const [currentView, setCurrentView] = useState<
    'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'albumDetail' | 'thankYou' | 'landing'
  >(() => {
    const hash = window.location.hash;
    if (hash === '#faq') return 'faq';
    if (hash === '#termos' || hash === '#privacidade') return 'privacy';
    if (hash === '#obrigado') return 'thankYou';
    if (hash === '#404') return 'notFound';
    if (hash === '#feed') return 'community';
    if (hash === '#perfil') return 'profile';
    // If not authenticated, root route goes to landing/login
    return ApiClient.getToken() ? 'community' : 'landing';
  });

  // Profile Active Tab: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets'
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'mural' | 'albums' | 'hobby' | 'widgets'>('posts');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Albums State
  const [albums, setAlbums] = useState<AlbumFolder[]>(() => {
    const saved = localStorage.getItem('melin_albums');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_ALBUMS;
  });

  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Sticky Notes State
  const [notes, setNotes] = useState<StickyNote[]>(() => {
    const saved = localStorage.getItem('melin_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_STICKY_NOTES;
  });

  // Posts State
  const [posts, setPosts] = useState<PinOrPost[]>(() => {
    const saved = localStorage.getItem('melin_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_POSTS;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('melin_notifs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Weather & Seasonal State
  const [weather, setWeather] = useState<WeatherSeasonState>(() => {
    const saved = localStorage.getItem('melin_weather');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_WEATHER_STATE;
  });

  // Hobby track
  const [currentTrack, setCurrentTrack] = useState<MediaEmbed | undefined>(undefined);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeDetailPost, setActiveDetailPost] = useState<PinOrPost | null>(null);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Large-Scale stress testing data injection
  const [isScaleInjected, setIsScaleInjected] = useState(false);
  const [scalePosts, setScalePosts] = useState<PinOrPost[]>([]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // 1. Core Architecture: Purge Ghost Bots & Validate Session on Mount
  useEffect(() => {
    ApiClient.purgeGhostCacheAndBots();

    ApiClient.getMe().then((authenticatedUser) => {
      if (authenticatedUser) {
        setCurrentUser(authenticatedUser);
      } else {
        setCurrentUser(null);
        if (!window.location.hash || window.location.hash === '#entrar') {
          setCurrentView('landing');
        }
      }
    });

    // Also fetch real posts from backend
    ApiClient.getPosts().then((backendPosts) => {
      if (backendPosts && backendPosts.length > 0) {
        setPosts(backendPosts);
      }
    });
  }, []);

  // 2. Dynamic SEO Document Title
  useEffect(() => {
    let title = 'PinTweet • Rede Social Híbrida & Mural Afetivo';
    if (currentView === 'community') {
      title = 'Feed da Comunidade • PinTweet';
    } else if (currentView === 'profile') {
      title = `${activeProfile.name} (${activeProfile.handle}) • PinTweet`;
    } else if (currentView === 'faq') {
      title = 'Perguntas Frequentes (FAQ) • PinTweet';
    } else if (currentView === 'privacy') {
      title = 'Privacidade, LGPD & Termos • PinTweet';
    } else if (currentView === 'thankYou') {
      title = 'Obrigado! Confirmação • PinTweet';
    } else if (currentView === 'notFound') {
      title = 'Página Não Encontrada (404) • PinTweet';
    } else if (currentView === 'landing') {
      title = 'Bem-vindo ao PinTweet • Rede Social Autêntica';
    }
    document.title = title;
  }, [currentView, activeProfile.name, activeProfile.handle]);

  // 3. Friendly URL Hash Navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#faq') setCurrentView('faq');
      else if (hash === '#termos' || hash === '#privacidade') setCurrentView('privacy');
      else if (hash === '#obrigado') setCurrentView('thankYou');
      else if (hash === '#404') setCurrentView('notFound');
      else if (hash === '#feed') setCurrentView('community');
      else if (hash === '#perfil') setCurrentView('profile');
      else if (hash === '#entrar') {
        if (!currentUser) {
          setCurrentView('landing');
          setAuthModalOpen(true);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Sync dark mode
  useEffect(() => {
    localStorage.setItem('melin_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persistent storage synchronizations
  useEffect(() => {
    try {
      localStorage.setItem('melin_albums', JSON.stringify(albums));
    } catch (err) {
      console.warn('Erro ao salvar álbuns:', err);
    }
  }, [albums]);

  useEffect(() => {
    try {
      localStorage.setItem('melin_notes', JSON.stringify(notes));
    } catch (err) {
      console.warn('Erro ao salvar notas:', err);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('melin_posts', JSON.stringify(posts));
    } catch (err) {
      console.warn('Erro ao salvar posts:', err);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('melin_notifs', JSON.stringify(notifications));
    } catch (err) {
      console.warn('Erro ao salvar notificações:', err);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('melin_weather', JSON.stringify(weather));
    } catch (err) {
      console.warn('Erro ao salvar clima:', err);
    }
  }, [weather]);

  // Update Profile with Server Persistence & Multitenancy
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const updatedProfile: UserProfile = { ...currentUser.profile, ...updates };
    const updatedUser: UserAccount = {
      ...currentUser,
      name: updates.name || currentUser.name,
      handle: updates.handle || currentUser.handle,
      profile: updatedProfile,
    };

    setCurrentUser(updatedUser);
    showToast('Perfil atualizado com segurança!');

    try {
      await ApiClient.updateProfile(updates);
    } catch (err: any) {
      console.warn('Erro ao sincronizar com backend:', err);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
    setCurrentView('thankYou');
    window.location.hash = '#obrigado';
    showToast(`Bem-vindo(a), ${account.name}!`);
  };

  const handleLogout = async () => {
    await ApiClient.logout();
    setCurrentUser(null);
    setCurrentView('landing');
    window.location.hash = '';
    showToast('Você encerrou sua sessão com segurança.');
  };

  // Quick Navigation Handler
  const handleQuickNavigate = (dest: {
    view: 'profile' | 'community';
    tab?: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets';
    action?: 'create_post' | 'create_album' | 'write_note';
  }) => {
    if (!currentUser && dest.view === 'profile') {
      setAuthModalOpen(true);
      showToast('Faça login ou crie sua conta para acessar seu perfil!');
      return;
    }

    setCurrentView(dest.view);
    if (dest.tab) {
      setActiveProfileTab(dest.tab);
    }
    if (dest.action === 'create_post') {
      if (!currentUser) {
        setAuthModalOpen(true);
      } else {
        setCreateModalOpen(true);
      }
    }
    showToast(
      dest.view === 'community'
        ? 'Acessando Feed da Comunidade 🌐'
        : `Abrindo ${dest.tab || 'perfil'} ⚡`
    );
  };

  // Notes
  const handleAddNote = (newNoteData: Omit<StickyNote, 'id' | 'createdAt' | 'reactions'>) => {
    const newNote: StickyNote = {
      ...newNoteData,
      id: `note-${Date.now()}`,
      createdAt: 'Agora mesmo',
      reactions: { '❤️': 1 },
    };

    setNotes((prev) => [newNote, ...prev]);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'reminder',
      actorName: newNote.authorName,
      actorAvatar: activeProfile.avatar,
      message: `colou um novo recadinho no seu mural: "${newNote.content.slice(0, 30)}..."`,
      target: 'Mural de Lembretes',
      timestamp: 'Agora mesmo',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast('💌 Recadinho colado no mural!');
  };

  const handleReactNote = (noteId: string, emoji: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        const currentCount = n.reactions?.[emoji] || 0;
        return {
          ...n,
          reactions: {
            ...n.reactions,
            [emoji]: currentCount + 1,
          },
        };
      })
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    showToast('Recadinho removido.');
  };

  const handleTogglePinNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Albums
  const handleCreateAlbum = (albumData: Omit<AlbumFolder, 'id' | 'pinCount'>) => {
    const newAlbum: AlbumFolder = {
      ...albumData,
      id: `album-${Date.now()}`,
      pinCount: 0,
    };
    setAlbums((prev) => [newAlbum, ...prev]);
    showToast(`Pasta "${newAlbum.name}" criada!`);
  };

  const handleDeleteAlbum = (albumId: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    if (selectedAlbumId === albumId) setSelectedAlbumId(null);
    showToast('Pasta excluída.');
  };

  const handleUpdateAlbumCover = (albumId: string, newCover: string) => {
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, cover: newCover } : a))
    );
    showToast('Capa do álbum atualizada!');
  };

  // Posts
  const handleCreatePost = async (
    postData: Omit<PinOrPost, 'id' | 'createdAt' | 'likes' | 'reposts' | 'commentsCount'>
  ) => {
    const newPost: PinOrPost = {
      ...postData,
      id: `post-${Date.now()}`,
      createdAt: 'Agora mesmo',
      likes: 1,
      reposts: 0,
      commentsCount: 0,
    };

    setPosts((prev) => [newPost, ...prev]);

    if (newPost.boardId) {
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === newPost.boardId ? { ...a, pinCount: a.pinCount + 1 } : a
        )
      );
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'like',
      actorName: activeProfile.name,
      actorAvatar: activeProfile.avatar,
      message: `compartilhou uma nova publicação: "${newPost.title || newPost.content.slice(0, 25)}"`,
      target: `Publicação #${newPost.id}`,
      timestamp: 'Agora mesmo',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast('Publicação compartilhada com sucesso!');

    // Persist to backend if logged in
    if (currentUser) {
      try {
        await ApiClient.createPost({
          content: newPost.content,
          title: newPost.title,
          imageUrl: newPost.imageUrl,
          videoUrl: newPost.videoUrl,
          mediaType: newPost.mediaType,
          tags: newPost.tags,
        });
      } catch (err) {
        console.warn('Erro ao salvar post no backend:', err);
      }
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const willLike = !p.likedByMe;
        return {
          ...p,
          likedByMe: willLike,
          likes: willLike ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      })
    );
  };

  const handleRepostPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const willRepost = !p.repostedByMe;
        return {
          ...p,
          repostedByMe: willRepost,
          reposts: willRepost ? p.reposts + 1 : Math.max(0, p.reposts - 1),
        };
      })
    );
    showToast('Publicação republicada no seu mural!');
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: activeProfile.name,
      authorAvatar: activeProfile.avatar,
      text,
      createdAt: 'Agora mesmo',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...(p.comments || []), newComment],
        };
      })
    );

    if (activeDetailPost && activeDetailPost.id === postId) {
      setActiveDetailPost((curr) =>
        curr
          ? {
              ...curr,
              commentsCount: curr.commentsCount + 1,
              comments: [...(curr.comments || []), newComment],
            }
          : null
      );
    }
    showToast('Comentário publicado!');
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.type === 'reminder') {
      setCurrentView('profile');
      setActiveProfileTab('mural');
    } else if (notif.type === 'music') {
      setCurrentView('profile');
      setActiveProfileTab('hobby');
    } else {
      setCurrentView('profile');
      setActiveProfileTab('posts');
    }
    setNotificationsModalOpen(false);
  };

  // Filter posts based on search query or selected album
  const allActivePosts = isScaleInjected ? [...posts, ...scalePosts] : posts;

  const displayedPosts = allActivePosts.filter((p) => {
    if (selectedAlbumId && p.boardId !== selectedAlbumId) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.authorHandle.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className={`min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300 relative flex ${
        isDarkMode ? 'dark bg-[#0a0e17]' : 'bg-[#f8fafc]'
      } ${activeProfile.fontFamily || 'font-twitter'}`}
      style={{
        backgroundColor: activeProfile.bgColor !== '#ffffff' && activeProfile.bgColor !== '#ffeef4'
          ? activeProfile.bgColor
          : undefined,
      }}
    >
      {/* Background Falling Seasonal Weather Emojis */}
      <FloatingParticles weather={weather} />

      {/* LEFT SIDEBAR */}
      <Sidebar
        currentUser={currentUser}
        activeProfile={activeProfile}
        currentView={currentView}
        onSelectView={(v) => {
          if (!currentUser && v === 'profile') {
            setAuthModalOpen(true);
            showToast('Faça login ou registre-se para abrir seu perfil!');
            return;
          }
          setCurrentView(v);
        }}
        activeProfileTab={activeProfileTab}
        onSelectProfileTab={setActiveProfileTab}
        onOpenCreateModal={() => {
          if (!currentUser) setAuthModalOpen(true);
          else setCreateModalOpen(true);
        }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenEditProfile={() => {
          if (!currentUser) setAuthModalOpen(true);
          else setAuthModalOpen(true);
        }}
        onOpenSecurityModal={() => setSecurityModalOpen(true)}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen relative z-10">
        {/* Top Search & Discrete Header Switcher */}
        <TopSearchBar
          currentView={currentView}
          onSelectView={(v) => {
            if (!currentUser && v === 'profile') {
              setAuthModalOpen(true);
              return;
            }
            setCurrentView(v);
          }}
          weather={weather}
          onOpenWeatherModal={() => setWeatherModalOpen(true)}
          notifications={notifications}
          onOpenNotifications={() => setNotificationsModalOpen(true)}
          onOpenEditProfile={() => setAuthModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectSearchedUser={(user) => {
            showToast(`Visualizando perfil de ${user.handle}`);
            setCurrentView('community');
          }}
        />

        {/* VIEWS WITH SMOOTH MOTION TRANSITION */}
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              <AuthLandingView
                onOpenAuth={() => setAuthModalOpen(true)}
                onExplorePublicFeed={() => {
                  setCurrentView('community');
                  window.location.hash = '#feed';
                }}
                onOpenFAQ={() => {
                  setCurrentView('faq');
                  window.location.hash = '#faq';
                }}
                onOpenLegal={() => {
                  setCurrentView('privacy');
                  window.location.hash = '#termos';
                }}
              />
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full"
            >
              {/* SUB-PÁGINA DEDICADA DE ÁLBUM */}
              <AnimatePresence mode="wait">
                {selectedAlbumId && albums.find((a) => a.id === selectedAlbumId) ? (
                  <motion.div
                    key={`album-${selectedAlbumId}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlbumDetailPage
                      album={albums.find((a) => a.id === selectedAlbumId)!}
                      posts={posts}
                      activeProfile={activeProfile}
                      onBack={() => setSelectedAlbumId(null)}
                      onOpenCreatePost={() => setCreateModalOpen(true)}
                      onLikePost={handleLikePost}
                      onRepostPost={handleRepostPost}
                      onOpenPinModal={setActiveDetailPost}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile-main-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Breadcrumbs de Navegação */}
                    <Breadcrumbs
                      items={[
                        {
                          label: 'Meu Perfil',
                          onClick: () => {
                            setActiveProfileTab('posts');
                            setSelectedAlbumId(null);
                          },
                        },
                        {
                          label:
                            activeProfileTab === 'posts'
                              ? 'Publicações'
                              : activeProfileTab === 'mural'
                              ? 'Lembretes'
                              : activeProfileTab === 'albums'
                              ? 'Álbuns'
                              : activeProfileTab === 'hobby'
                              ? 'Hobby'
                              : 'Widgets',
                          active: true,
                        },
                      ]}
                    />

                    {/* Profile Header Card */}
                    <ProfileHeader
                      profile={activeProfile}
                      activeTab={activeProfileTab}
                      onSelectTab={setActiveProfileTab}
                      onUpdateProfile={handleUpdateProfile}
                      postsCount={displayedPosts.length}
                      notesCount={notes.filter((n) => n.targetProfileId === activeProfile.id).length}
                      albumsCount={albums.length}
                    />

                    {/* TAB CONTENT WITH SUB-ANIMATION */}
                    <AnimatePresence mode="wait">
                      {activeProfileTab === 'posts' && (
                        <motion.div
                          key="tab-posts"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4 pt-1"
                        >
                          <FeedMasonryOrTwitter
                            posts={displayedPosts}
                            layoutMode={activeProfile.layoutMode}
                            activeProfile={activeProfile}
                            onLikePost={handleLikePost}
                            onRepostPost={handleRepostPost}
                            onOpenPinModal={setActiveDetailPost}
                            onOpenCreatePost={() => setCreateModalOpen(true)}
                          />
                        </motion.div>
                      )}

                      {activeProfileTab === 'mural' && (
                        <motion.div
                          key="tab-mural"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="pt-1"
                        >
                          <MuralLembretes
                            notes={notes}
                            activeProfile={activeProfile}
                            currentViewerName={currentUser?.name || 'Amigo(a)'}
                            onAddNote={handleAddNote}
                            onReactNote={handleReactNote}
                            onDeleteNote={handleDeleteNote}
                            onTogglePin={handleTogglePinNote}
                          />
                        </motion.div>
                      )}

                      {activeProfileTab === 'albums' && (
                        <motion.div
                          key="tab-albums"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="pt-1"
                        >
                          <AlbumPastasGrid
                            albums={albums}
                            activeProfile={activeProfile}
                            selectedAlbumId={selectedAlbumId}
                            onSelectAlbum={(id) => {
                              setSelectedAlbumId(id);
                            }}
                            onCreateAlbum={handleCreateAlbum}
                            onDeleteAlbum={handleDeleteAlbum}
                            onUpdateAlbumCover={handleUpdateAlbumCover}
                          />
                        </motion.div>
                      )}

                      {activeProfileTab === 'hobby' && (
                        <motion.div
                          key="tab-hobby"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="pt-1"
                        >
                          <HobbySection
                            currentTrack={currentTrack}
                            onSetTrack={setCurrentTrack}
                          />
                        </motion.div>
                      )}

                      {activeProfileTab === 'widgets' && (
                        <motion.div
                          key="tab-widgets"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="pt-1"
                        >
                          <WidgetsDrawer
                            profile={activeProfile}
                            onUpdateProfile={handleUpdateProfile}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentView === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-4 sm:p-6 max-w-2xl mx-auto w-full"
            >
              <Breadcrumbs
                items={[
                  { label: 'Feed Comum & Comunidade', active: true },
                ]}
              />
              <CommunityFeed
                posts={posts}
                activeProfile={activeProfile}
                onLikePost={handleLikePost}
                onRepostPost={handleRepostPost}
                onOpenPinModal={setActiveDetailPost}
                onOpenCreatePost={() => {
                  if (!currentUser) setAuthModalOpen(true);
                  else setCreateModalOpen(true);
                }}
              />
            </motion.div>
          )}

          {currentView === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              <FaqPage
                onBack={() => setCurrentView(currentUser ? 'community' : 'landing')}
                onGoProfile={() => setCurrentView('profile')}
              />
            </motion.div>
          )}

          {currentView === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              <PrivacyTermsPage
                onBack={() => setCurrentView(currentUser ? 'community' : 'landing')}
                onGoProfile={() => setCurrentView('profile')}
              />
            </motion.div>
          )}

          {currentView === 'thankYou' && (
            <motion.div
              key="thankYou"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full"
            >
              <ThankYouPage
                userName={currentUser?.name}
                userHandle={currentUser?.handle}
                onGoHome={() => {
                  setCurrentView('community');
                  window.location.hash = '#feed';
                }}
                onGoProfile={() => {
                  setCurrentView('profile');
                  window.location.hash = '#perfil';
                }}
              />
            </motion.div>
          )}

          {currentView === 'notFound' && (
            <motion.div
              key="notFound"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              <NotFoundPage
                onGoHome={() => setCurrentView(currentUser ? 'profile' : 'landing')}
                onGoCommunity={() => setCurrentView('community')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button with Speech Prompt */}
      <QuickNavigationPopup
        onNavigate={handleQuickNavigate}
        onOpenSecurity={() => setSecurityModalOpen(true)}
      />

      {/* Fixed Mobile CTA Button for fast posting or signing up */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        {currentUser ? (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white shadow-xl shadow-rose-500/30 flex items-center justify-center cursor-pointer"
            aria-label="Criar nova publicação"
          >
            <Plus className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold shadow-xl shadow-rose-500/30 flex items-center gap-1.5 cursor-pointer"
            aria-label="Entrar ou criar conta"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar</span>
          </button>
        )}
      </div>

      {/* Cookie & LocalStorage Consent Banner */}
      <CookieConsentBanner onOpenPrivacy={() => setCurrentView('privacy')} />

      {/* Modals */}
      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        activeProfile={activeProfile}
        albums={albums}
        onCreatePost={handleCreatePost}
      />

      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onClearNotifications={() => setNotifications([])}
        onNotificationClick={handleNotificationClick}
      />

      <WeatherWidgetModal
        isOpen={weatherModalOpen}
        onClose={() => setWeatherModalOpen(false)}
        weather={weather}
        onUpdateWeather={(u) => setWeather((prev) => ({ ...prev, ...u }))}
      />

      <InteractivePinModal
        post={activeDetailPost}
        onClose={() => setActiveDetailPost(null)}
        activeProfile={activeProfile}
        albums={albums}
        onLikePost={handleLikePost}
        onRepostPost={handleRepostPost}
        onAddComment={handleAddComment}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <SecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        isScaleInjected={isScaleInjected}
        onInjectScalePosts={(synthetic) => {
          setScalePosts(synthetic);
          setIsScaleInjected(true);
          showToast(`Injetadas ${synthetic.length} publicações para teste em larga escala!`);
        }}
        onResetScalePosts={() => {
          setScalePosts([]);
          setIsScaleInjected(false);
          showToast('Feed restaurado ao estado original.');
        }}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl text-xs font-medium animate-in slide-in-from-top-2 duration-150 flex items-center gap-2 border border-slate-700">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
