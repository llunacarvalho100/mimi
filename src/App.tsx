import React, { useState, useEffect } from 'react';
import {
  INITIAL_PROFILE,
  INITIAL_ACCOUNTS,
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
import { QuickNavigationPopup } from './components/QuickNavigationPopup';
import { Breadcrumbs } from './components/Breadcrumbs';
import { NotFoundPage } from './components/NotFoundPage';
import { FaqPage } from './components/FaqPage';
import { PrivacyTermsPage } from './components/PrivacyTermsPage';
import { AlbumDetailPage } from './components/AlbumDetailPage';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { SecurityModal } from './security';

export default function App() {
  // Dark mode (default to true to match the reference screenshot)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('melin_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Accounts & Authentication State
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('melin_accounts');
    const migrated = localStorage.getItem('melin_twitter_font_migrated');
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        if (!migrated) {
          localStorage.setItem('melin_twitter_font_migrated', 'true');
          return parsed.map((acc) => ({
            ...acc,
            profile: {
              ...acc.profile,
              fontFamily:
                acc.profile.fontFamily === 'font-caveat'
                  ? 'font-twitter'
                  : acc.profile.fontFamily || 'font-twitter',
            },
          }));
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('melin_session');
    const migrated = localStorage.getItem('melin_twitter_font_migrated_session');
    if (saved) {
      try {
        const parsed: UserAccount = JSON.parse(saved);
        if (!migrated) {
          localStorage.setItem('melin_twitter_font_migrated_session', 'true');
          return {
            ...parsed,
            profile: {
              ...parsed.profile,
              fontFamily:
                parsed.profile.fontFamily === 'font-caveat'
                  ? 'font-twitter'
                  : parsed.profile.fontFamily || 'font-twitter',
            },
          };
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_ACCOUNTS[0] || null;
  });

  const activeProfile: UserProfile = currentUser?.profile || INITIAL_PROFILE;

  // View: 'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'albumDetail'
  const [currentView, setCurrentView] = useState<
    'profile' | 'community' | 'faq' | 'privacy' | 'notFound' | 'albumDetail'
  >('profile');

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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('melin_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('melin_accounts', JSON.stringify(accounts));
    } catch (err) {
      console.warn('Erro ao salvar contas no localStorage:', err);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('melin_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('melin_session');
      }
    } catch (err) {
      console.warn('Erro ao salvar sessão no localStorage:', err);
    }
  }, [currentUser]);

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

  // Update Profile
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedProfile: UserProfile = { ...currentUser.profile, ...updates };
    const updatedUser: UserAccount = {
      ...currentUser,
      name: updates.name || currentUser.name,
      handle: updates.handle || currentUser.handle,
      profile: updatedProfile,
    };

    setCurrentUser(updatedUser);
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedUser.id ? updatedUser : acc))
    );
    showToast('Perfil atualizado!');
  };

  // Auth Handlers
  const handleLogin = (account: UserAccount) => {
    setCurrentUser(account);
    showToast(`Bem-vindo(a) de volta, ${account.name}!`);
  };

  const handleRegister = (newAccount: UserAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
    setCurrentUser(newAccount);
    showToast(`Conta ${newAccount.handle} criada no Melin!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Você saiu da sua conta.');
  };

  // Quick Navigation Handler
  const handleQuickNavigate = (dest: {
    view: 'profile' | 'community';
    tab?: 'posts' | 'mural' | 'albums' | 'hobby' | 'widgets';
    action?: 'create_post' | 'create_album' | 'write_note';
  }) => {
    setCurrentView(dest.view);
    if (dest.tab) {
      setActiveProfileTab(dest.tab);
    }
    if (dest.action === 'create_post') {
      setCreateModalOpen(true);
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
  const handleCreatePost = (
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
    showToast('Publicação compartilhada!');
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newLiked = !p.likedByMe;
        return {
          ...p,
          likedByMe: newLiked,
          likes: newLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      })
    );

    if (activeDetailPost && activeDetailPost.id === postId) {
      setActiveDetailPost((prev) =>
        prev
          ? {
              ...prev,
              likedByMe: !prev.likedByMe,
              likes: !prev.likedByMe ? prev.likes + 1 : Math.max(0, prev.likes - 1),
            }
          : null
      );
    }
  };

  const handleRepostPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newReposted = !p.repostedByMe;
        return {
          ...p,
          repostedByMe: newReposted,
          reposts: newReposted ? p.reposts + 1 : Math.max(0, p.reposts - 1),
        };
      })
    );
    showToast('Publicação salva!');
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      authorName: activeProfile.name,
      authorAvatar: activeProfile.avatar,
      text,
      createdAt: 'Agora mesmo',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const currentComments = p.comments || [];
        return {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [...currentComments, newComment],
        };
      })
    );

    if (activeDetailPost && activeDetailPost.id === postId) {
      setActiveDetailPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: (prev.commentsCount || 0) + 1,
              comments: [...(prev.comments || []), newComment],
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

  // Filter posts based on search query or selected album (supports scale testing mode)
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

      {/* LEFT SIDEBAR matching reference screenshot */}
      <Sidebar
        currentUser={currentUser}
        activeProfile={activeProfile}
        currentView={currentView}
        onSelectView={setCurrentView}
        activeProfileTab={activeProfileTab}
        onSelectProfileTab={setActiveProfileTab}
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenEditProfile={() => setAuthModalOpen(true)}
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
          onSelectView={setCurrentView}
          weather={weather}
          onOpenWeatherModal={() => setWeatherModalOpen(true)}
          notifications={notifications}
          onOpenNotifications={() => setNotificationsModalOpen(true)}
          onOpenEditProfile={() => setAuthModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* VIEW 1: MEU PERFIL PRÓPRIO (E SUB-PÁGINA DE ÁLBUM) */}
        {currentView === 'profile' && (
          <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full animate-in fade-in duration-150">
            {/* SUB-PÁGINA DEDICADA DE ÁLBUM (Não sobrecarrega a página inicial) */}
            {selectedAlbumId && albums.find((a) => a.id === selectedAlbumId) ? (
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
            ) : (
              <>
                {/* Breadcrumbs de Navegação Limpa */}
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

                {/* TAB CONTENT */}
                {activeProfileTab === 'posts' && (
                  <div className="space-y-4 pt-1">
                    <FeedMasonryOrTwitter
                      posts={displayedPosts}
                      layoutMode={activeProfile.layoutMode}
                      activeProfile={activeProfile}
                      onLikePost={handleLikePost}
                      onRepostPost={handleRepostPost}
                      onOpenPinModal={setActiveDetailPost}
                      onOpenCreatePost={() => setCreateModalOpen(true)}
                    />
                  </div>
                )}

                {activeProfileTab === 'mural' && (
                  <div className="pt-1">
                    <MuralLembretes
                      notes={notes}
                      activeProfile={activeProfile}
                      currentViewerName={currentUser?.name || 'Amigo(a)'}
                      onAddNote={handleAddNote}
                      onReactNote={handleReactNote}
                      onDeleteNote={handleDeleteNote}
                      onTogglePin={handleTogglePinNote}
                    />
                  </div>
                )}

                {activeProfileTab === 'albums' && (
                  <div className="pt-1">
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
                  </div>
                )}

                {activeProfileTab === 'hobby' && (
                  <div className="pt-1">
                    <HobbySection
                      currentTrack={currentTrack}
                      onSetTrack={setCurrentTrack}
                    />
                  </div>
                )}

                {activeProfileTab === 'widgets' && (
                  <div className="pt-1">
                    <WidgetsDrawer
                      profile={activeProfile}
                      onUpdateProfile={handleUpdateProfile}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* VIEW 2: FEED COMUM COM OUTRAS PESSOAS */}
        {currentView === 'community' && (
          <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full animate-in fade-in duration-150">
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
              onOpenCreatePost={() => setCreateModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 3: CENTRAL DE DÚVIDAS & FAQ (5 PERGUNTAS) */}
        {currentView === 'faq' && (
          <FaqPage
            onBack={() => setCurrentView('profile')}
            onGoProfile={() => setCurrentView('profile')}
          />
        )}

        {/* VIEW 4: POLÍTICA DE PRIVACIDADE, TERMOS & COOKIES */}
        {currentView === 'privacy' && (
          <PrivacyTermsPage
            onBack={() => setCurrentView('profile')}
            onGoProfile={() => setCurrentView('profile')}
          />
        )}

        {/* VIEW 5: PÁGINA DE ERRO 404 AMIGÁVEL */}
        {currentView === 'notFound' && (
          <NotFoundPage
            onGoHome={() => setCurrentView('profile')}
            onGoCommunity={() => setCurrentView('community')}
          />
        )}
      </div>

      {/* Floating Action Button with Speech Prompt */}
      <QuickNavigationPopup
        onNavigate={handleQuickNavigate}
        onOpenSecurity={() => setSecurityModalOpen(true)}
      />

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
        accounts={accounts}
        onLogin={handleLogin}
        onRegister={handleRegister}
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
