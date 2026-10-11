export type FontChoice =
  | 'font-twitter'
  | 'font-caveat'
  | 'font-poppins'
  | 'font-playfair'
  | 'font-jakarta'
  | 'font-outfit';

export type LayoutMode = 'mosaic' | 'timeline' | 'bento';

export type NoteColor = 'yellow' | 'pink' | 'mint' | 'lavender' | 'peach';

export interface UserProfile {
  id: string;
  name: string;
  handle: string; // @usuario
  avatar: string;
  avatarType?: 'image' | 'video';
  cover: string;
  coverType?: 'image' | 'video';
  bio: string;
  customTitle: string;
  customSubtitle: string;
  bgColor: string;
  fontFamily: FontChoice;
  layoutMode: LayoutMode;
  themeColor: string;
  relationshipDate?: string;
  pinnedQuote?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  handle: string;
  name: string;
  password?: string;
  profile: UserProfile;
}

export interface MediaEmbed {
  type: 'youtube' | 'spotify' | 'audio' | 'link';
  url: string;
  title?: string;
  artistOrChannel?: string;
  thumbnail?: string;
  embedId?: string;
  audioDuration?: string;
}

export interface PinOrPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  title?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'embed';
  aspectRatio?: 'tall' | 'square' | 'wide';
  boardId?: string;
  boardName?: string;
  mediaEmbed?: MediaEmbed;
  tags: string[];
  likes: number;
  reposts: number;
  commentsCount: number;
  createdAt: string;
  isPinned?: boolean;
  likedByMe?: boolean;
  repostedByMe?: boolean;
  comments?: {
    id: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    createdAt: string;
  }[];
}

export interface AlbumFolder {
  id: string;
  name: string;
  cover: string;
  pinCount: number;
  profileId: string;
  color: string;
  description?: string;
}

export interface StickyNote {
  id: string;
  targetProfileId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  color: NoteColor;
  sticker: string;
  rotation: number;
  createdAt: string;
  pinned?: boolean;
  reactions: Record<string, number>;
}

export interface WeatherSeasonState {
  city: string;
  temp: number;
  condition: string;
  season: 'Primavera' | 'Verão' | 'Outono' | 'Inverno';
  emojis: string[];
  activeAnimation: boolean;
  particlesDensity: 'low' | 'normal' | 'high';
}

export interface AppNotification {
  id: string;
  type: 'reminder' | 'like' | 'comment' | 'repost' | 'music';
  actorName: string;
  actorAvatar: string;
  message: string;
  target: string;
  timestamp: string;
  read: boolean;
}
