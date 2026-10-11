/**
 * Enterprise API Client with Hardened Security, Multitenancy & Double Validation
 */

import { UserAccount, UserProfile, PinOrPost } from '../types';

const TOKEN_KEY = 'pintweet_session_token';
const USER_KEY = 'pintweet_active_user';

// List of legacy mock handles to eradicate from browser cache
const GHOST_BOT_HANDLES = [
  '@larissafontes',
  '@gabriel.dev',
  '@beatriz.arte',
  '@test_bot',
  '@bot_user',
  '@mock_user',
];

export class ApiClient {
  private static token: string | null = null;

  /**
   * Eradicates any ghost bots, fake mock profiles and expired sessions on startup
   */
  public static purgeGhostCacheAndBots(): void {
    try {
      // 1. Purge legacy mock storage keys
      localStorage.removeItem('melin_twitter_font_migrated');
      localStorage.removeItem('melin_twitter_font_migrated_session');

      // 2. Inspect melin_accounts for mock bots
      const oldAccounts = localStorage.getItem('melin_accounts');
      if (oldAccounts) {
        try {
          const parsed = JSON.parse(oldAccounts);
          if (Array.isArray(parsed)) {
            const hasMock = parsed.some((acc: any) =>
              GHOST_BOT_HANDLES.includes(acc.handle?.toLowerCase())
            );
            if (hasMock) {
              localStorage.removeItem('melin_accounts');
            }
          }
        } catch {
          localStorage.removeItem('melin_accounts');
        }
      }

      // 3. Inspect melin_session
      const oldSession = localStorage.getItem('melin_session');
      if (oldSession) {
        try {
          const parsed = JSON.parse(oldSession);
          if (GHOST_BOT_HANDLES.includes(parsed.handle?.toLowerCase()) || parsed.id?.startsWith('acc-')) {
            localStorage.removeItem('melin_session');
          }
        } catch {
          localStorage.removeItem('melin_session');
        }
      }

      // 4. Initialize session token if valid
      const savedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        this.token = savedToken;
      }
    } catch (err) {
      console.warn('[Security] Erro ao limpar cache de bots:', err);
    }
  }

  public static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  public static setToken(token: string | null, persist: boolean = true): void {
    this.token = token;
    if (token) {
      if (persist) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'PinTweet-Client',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Register a new authentic user account in database
   */
  public static async register(data: {
    name: string;
    handle: string;
    email: string;
    password: string;
  }): Promise<{ user: UserAccount; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Falha ao registrar conta.');
    }

    this.setToken(json.token, true);
    localStorage.setItem(USER_KEY, JSON.stringify(json.user));
    return json;
  }

  /**
   * Login user with rate-limiting and 2FA challenge handling
   */
  public static async login(data: {
    handleOrEmail: string;
    password: string;
    twoFactorCode?: string;
  }): Promise<{ user?: UserAccount; token?: string; requires2FA?: boolean; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Credenciais inválidas.');
    }

    if (json.requires2FA) {
      return { requires2FA: true, message: json.message };
    }

    this.setToken(json.token, true);
    localStorage.setItem(USER_KEY, JSON.stringify(json.user));
    return json;
  }

  /**
   * Google SSO OAuth 2.0 Integration
   */
  public static async loginGoogle(profile: {
    email: string;
    name: string;
    googleId?: string;
    avatar?: string;
  }): Promise<{ user: UserAccount; token: string }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(profile),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Falha na autenticação via Google.');
    }

    this.setToken(json.token, true);
    localStorage.setItem(USER_KEY, JSON.stringify(json.user));
    return json;
  }

  /**
   * Check authenticated session against backend
   */
  public static async getMe(): Promise<UserAccount | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        this.setToken(null);
        return null;
      }

      const json = await res.json();
      localStorage.setItem(USER_KEY, JSON.stringify(json.user));
      return json.user;
    } catch {
      // Offline fallback: check cached active user if valid
      const cached = localStorage.getItem(USER_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Logout user and invalidate token
   */
  public static async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch {
      // Proceed with local logout regardless of network
    } finally {
      this.setToken(null);
    }
  }

  /**
   * Toggle 2FA on account
   */
  public static async toggle2FA(enable: boolean): Promise<boolean> {
    const res = await fetch('/api/auth/2fa/toggle', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ enable }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Erro ao alterar 2FA.');
    }
    return json.twoFactorEnabled;
  }

  /**
   * Strict User Search exclusively by @username
   */
  public static async searchUsers(query: string): Promise<Array<{
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio: string;
    followersCount: number;
    verified?: boolean;
  }>> {
    if (!query.trim()) return [];
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.users || [];
    } catch {
      return [];
    }
  }

  /**
   * Update Profile with Multitenancy and IDOR validation
   */
  public static async updateProfile(updates: Partial<UserProfile>): Promise<UserAccount> {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Erro ao atualizar perfil.');
    }

    localStorage.setItem(USER_KEY, JSON.stringify(json.user));
    return json.user;
  }

  /**
   * Double-Validated Secure Media Upload with Anti-Malware
   */
  public static async uploadMedia(file: File, category: 'avatar' | 'cover' | 'post' = 'post'): Promise<{
    url: string;
    mimeType: string;
    sizeBytes: number;
  }> {
    // 1. Client-side Pre-Validation
    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido (${file.type}). Use JPG, PNG, WEBP ou MP4.`);
    }

    const MAX_SIZE = file.type.startsWith('video/') ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`Arquivo excede o limite permitido (${file.type.startsWith('video/') ? '15MB' : '5MB'}).`);
    }

    // Convert to Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    // 2. Server-side Double-Validation & Magic Header Sniffing
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name,
        mimeType: file.type,
        category,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Falha no upload do arquivo.');
    }

    return json;
  }

  /**
   * Fetch Real Posts
   */
  public static async getPosts(handle?: string): Promise<PinOrPost[]> {
    try {
      const url = handle ? `/api/posts?handle=${encodeURIComponent(handle)}` : '/api/posts';
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      return json.posts || [];
    } catch {
      return [];
    }
  }

  /**
   * Create Post
   */
  public static async createPost(post: {
    content: string;
    title?: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: 'image' | 'video' | 'embed';
    tags?: string[];
  }): Promise<PinOrPost> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(post),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Erro ao publicar.');
    }

    return json.post;
  }

  /**
   * Delete Post
   */
  public static async deletePost(id: string): Promise<void> {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Erro ao excluir publicação.');
    }
  }
}
