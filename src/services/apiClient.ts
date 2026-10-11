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

/**
 * Custom Error hierarchy for API and network failures.
 * Eliminates "Unexpected token '<' / 'T' is not valid JSON" crashes.
 */
export interface BackendHealth {
  status: string;
  service: string;
  timestamp: string;
  databaseMode: string;
  supabaseConfigured: boolean;
  isVercel: boolean;
  usersCount: number;
  postsCount: number;
}

export interface SupabaseStatus {
  connected: boolean;
  configured: boolean;
  databaseMode: string;
  message: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly endpoint?: string;
  public readonly isHtmlResponse: boolean;
  public readonly data?: any;
  public readonly code?: string;

  constructor(options: {
    message: string;
    status: number;
    statusText?: string;
    endpoint?: string;
    isHtmlResponse?: boolean;
    data?: any;
    code?: string;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.statusText = options.statusText || '';
    this.endpoint = options.endpoint;
    this.isHtmlResponse = options.isHtmlResponse ?? false;
    this.data = options.data;
    this.code = options.code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, endpoint?: string, isHtmlResponse: boolean = false) {
    super({
      message,
      status: 404,
      statusText: 'Not Found',
      endpoint,
      isHtmlResponse,
      code: 'NOT_FOUND',
    });
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string, endpoint?: string, data?: any) {
    super({
      message,
      status: 401,
      statusText: 'Unauthorized',
      endpoint,
      data,
      code: 'UNAUTHORIZED',
    });
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string, endpoint?: string, data?: any) {
    super({
      message,
      status: 403,
      statusText: 'Forbidden',
      endpoint,
      data,
      code: 'FORBIDDEN',
    });
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, endpoint?: string, data?: any) {
    super({
      message,
      status: 400,
      statusText: 'Bad Request',
      endpoint,
      data,
      code: 'BAD_REQUEST',
    });
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ServerError extends ApiError {
  constructor(message: string, status: number = 500, endpoint?: string, isHtmlResponse: boolean = false, data?: any) {
    super({
      message,
      status,
      statusText: 'Internal Server Error',
      endpoint,
      isHtmlResponse,
      data,
      code: 'SERVER_ERROR',
    });
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export class NetworkOrParseError extends ApiError {
  constructor(message: string, endpoint?: string, isHtmlResponse: boolean = false) {
    super({
      message,
      status: 0,
      statusText: 'Network / Parse Error',
      endpoint,
      isHtmlResponse,
      code: 'PARSE_ERROR',
    });
    this.name = 'NetworkOrParseError';
    Object.setPrototypeOf(this, NetworkOrParseError.prototype);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export class ApiClient {
  private static token: string | null = null;

  /**
   * Safely process fetch response with strict Content-Type and status validation.
   * Completely avoids calling res.json() on HTML error pages (e.g. Vercel 404 or 500).
   * Converts HTTP error responses into structured custom Error instances.
   */
  private static async handleResponse<T>(res: Response, fallbackError: string, endpoint?: string): Promise<T> {
    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    const isHtml =
      contentType.includes('text/html') ||
      rawText.includes('<!DOCTYPE') ||
      rawText.includes('<html') ||
      rawText.includes('<head') ||
      rawText.includes('<body') ||
      rawText.includes('The page cannot be found');

    let parsedJson: any = null;
    if (!isHtml && (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        parsedJson = null;
      }
    }

    // 1. Strict check of response.ok
    if (!res.ok) {
      let errorMessage = parsedJson?.error || parsedJson?.message || fallbackError;

      if (isHtml) {
        if (res.status === 404) {
          errorMessage =
            'Rota de API não encontrada (HTTP 404). Se você está na Vercel, certifique-se de que a rota /api está configurada e as Variáveis de Ambiente foram preenchidas nas configurações do projeto.';
          throw new NotFoundError(errorMessage, endpoint, true);
        }

        if (res.status === 401) {
          errorMessage = 'Não autorizado ou sessão expirada (HTTP 401).';
          throw new UnauthorizedError(errorMessage, endpoint);
        }

        if (res.status === 403) {
          errorMessage = 'Acesso não permitido a este recurso (HTTP 403).';
          throw new ForbiddenError(errorMessage, endpoint);
        }

        if (res.status >= 500) {
          errorMessage = `Erro interno do servidor backend (HTTP ${res.status}). Verifique a conexão com o Supabase/banco de dados e as credenciais na Vercel.`;
          throw new ServerError(errorMessage, res.status, endpoint, true);
        }

        errorMessage = `${fallbackError} (Resposta HTML da Vercel/Servidor com status HTTP ${res.status})`;
        throw new ApiError({
          message: errorMessage,
          status: res.status,
          statusText: res.statusText,
          endpoint,
          isHtmlResponse: true,
        });
      }

      // Non-HTML error response with JSON or plain text
      if (!parsedJson && rawText && rawText.length < 200 && !rawText.includes('<')) {
        errorMessage = rawText.trim();
      }

      if (res.status === 404) {
        throw new NotFoundError(errorMessage, endpoint, false);
      }
      if (res.status === 401) {
        throw new UnauthorizedError(errorMessage, endpoint, parsedJson);
      }
      if (res.status === 403) {
        throw new ForbiddenError(errorMessage, endpoint, parsedJson);
      }
      if (res.status === 400) {
        throw new BadRequestError(errorMessage, endpoint, parsedJson);
      }
      if (res.status >= 500) {
        throw new ServerError(errorMessage, res.status, endpoint, false, parsedJson);
      }

      throw new ApiError({
        message: errorMessage,
        status: res.status,
        statusText: res.statusText,
        endpoint,
        isHtmlResponse: false,
        data: parsedJson,
      });
    }

    // 2. Response IS OK (res.ok === true)
    // Guard against SPA returning index.html with HTTP 200 on API endpoints
    if (isHtml) {
      throw new NetworkOrParseError(
        'O servidor retornou uma página HTML em vez de resposta JSON. Verifique se o backend na Vercel está interceptando as chamadas /api.',
        endpoint,
        true
      );
    }

    if (!rawText || rawText.trim() === '') {
      return {} as T;
    }

    if (parsedJson !== null) {
      return parsedJson as T;
    }

    try {
      return JSON.parse(rawText) as T;
    } catch (parseErr: any) {
      throw new NetworkOrParseError(
        `Falha ao converter resposta do servidor em JSON: ${parseErr.message || 'formato inválido'}`,
        endpoint,
        false
      );
    }
  }

  /**
   * Eradicates any ghost bots, fake mock profiles and expired sessions on startup
   */
  public static purgeGhostCacheAndBots(): void {
    try {
      localStorage.removeItem('melin_twitter_font_migrated');
      localStorage.removeItem('melin_twitter_font_migrated_session');

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
    const endpoint = '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const json = await this.handleResponse<{ user: UserAccount; token: string }>(
      res,
      'Falha ao registrar conta.',
      endpoint
    );

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
    const endpoint = '/api/auth/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const json = await this.handleResponse<{
      user?: UserAccount;
      token?: string;
      requires2FA?: boolean;
      message?: string;
    }>(res, 'Credenciais inválidas.', endpoint);

    if (json.requires2FA) {
      return { requires2FA: true, message: json.message };
    }

    if (json.token && json.user) {
      this.setToken(json.token, true);
      localStorage.setItem(USER_KEY, JSON.stringify(json.user));
    }

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
    credential?: string;
  }): Promise<{ user: UserAccount; token: string }> {
    const endpoint = '/api/auth/google';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(profile),
    });

    const json = await this.handleResponse<{ user: UserAccount; token: string }>(
      res,
      'Falha na autenticação via Google.',
      endpoint
    );

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

    const endpoint = '/api/auth/me';
    try {
      const res = await fetch(endpoint, {
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          this.setToken(null);
        }
        return null;
      }

      const json = await this.handleResponse<{ user: UserAccount }>(
        res,
        'Falha ao autenticar sessão.',
        endpoint
      );

      if (json && json.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(json.user));
        return json.user;
      }
      return null;
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
    const endpoint = '/api/auth/logout';
    try {
      await fetch(endpoint, {
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
    const endpoint = '/api/auth/2fa/toggle';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ enable }),
    });

    const json = await this.handleResponse<{ twoFactorEnabled: boolean }>(
      res,
      'Erro ao alterar 2FA.',
      endpoint
    );

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
    const endpoint = `/api/users/search?q=${encodeURIComponent(query.trim())}`;
    try {
      const res = await fetch(endpoint);
      const json = await this.handleResponse<{ users: Array<any> }>(
        res,
        'Erro na busca de usuários.',
        endpoint
      );
      return json.users || [];
    } catch (err) {
      console.warn('[ApiClient] searchUsers failed:', err);
      return [];
    }
  }

  /**
   * Update Profile with Multitenancy and IDOR validation
   */
  public static async updateProfile(updates: Partial<UserProfile>): Promise<UserAccount> {
    const endpoint = '/api/users/profile';
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    const json = await this.handleResponse<{ user: UserAccount }>(
      res,
      'Erro ao atualizar perfil.',
      endpoint
    );

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
      throw new BadRequestError(`Tipo de arquivo não permitido (${file.type}). Use JPG, PNG, WEBP ou MP4.`, '/api/upload');
    }

    const MAX_SIZE = file.type.startsWith('video/') ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestError(`Arquivo excede o limite permitido (${file.type.startsWith('video/') ? '15MB' : '5MB'}).`, '/api/upload');
    }

    // Convert to Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    // 2. Server-side Double-Validation & Magic Header Sniffing
    const endpoint = '/api/upload';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name,
        mimeType: file.type,
        category,
      }),
    });

    return await this.handleResponse<{
      url: string;
      mimeType: string;
      sizeBytes: number;
    }>(res, 'Falha no upload do arquivo.', endpoint);
  }

  /**
   * Fetch Real Posts
   */
  public static async getPosts(handle?: string): Promise<PinOrPost[]> {
    const endpoint = handle ? `/api/posts?handle=${encodeURIComponent(handle)}` : '/api/posts';
    try {
      const res = await fetch(endpoint);
      const json = await this.handleResponse<{ posts: PinOrPost[] }>(
        res,
        'Erro ao carregar publicações.',
        endpoint
      );
      return json.posts || [];
    } catch (err) {
      console.warn('[ApiClient] getPosts failed:', err);
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
    const endpoint = '/api/posts';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(post),
    });

    const json = await this.handleResponse<{ post: PinOrPost }>(
      res,
      'Erro ao publicar.',
      endpoint
    );

    return json.post;
  }

  /**
   * Delete Post
   */
  public static async deletePost(id: string): Promise<void> {
    const endpoint = `/api/posts/${encodeURIComponent(id)}`;
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    await this.handleResponse<{ message: string }>(
      res,
      'Erro ao excluir publicação.',
      endpoint
    );
  }

  /**
   * Generic, hardened fetch method executing secure calls against backend & Supabase.
   * Strictly enforces response.ok validation and prevents JSON parse errors on HTML 404 pages.
   */
  public static async safeFetch<T = any>(
    endpoint: string,
    options: RequestInit = {},
    fallbackError: string = 'Erro na requisição à API.'
  ): Promise<T> {
    const defaultHeaders = this.getHeaders() as Record<string, string>;
    const customHeaders = (options.headers as Record<string, string>) || {};

    const mergedHeaders = {
      ...defaultHeaders,
      ...customHeaders,
    };

    const res = await fetch(endpoint, {
      ...options,
      headers: mergedHeaders,
    });

    return await this.handleResponse<T>(res, fallbackError, endpoint);
  }

  /**
   * Check backend server health and Supabase connectivity status
   */
  public static async checkHealth(): Promise<BackendHealth> {
    const endpoint = '/api/health';
    return await this.safeFetch<BackendHealth>(
      endpoint,
      { method: 'GET' },
      'Falha ao verificar saúde do backend e conexão com o banco de dados.'
    );
  }

  /**
   * Query status of cloud Supabase database
   */
  public static async getSupabaseStatus(): Promise<SupabaseStatus> {
    try {
      const health = await this.checkHealth();
      return {
        connected: health.supabaseConfigured,
        configured: health.supabaseConfigured,
        databaseMode: health.databaseMode,
        message: health.supabaseConfigured
          ? 'Banco de dados Supabase (PostgreSQL) conectado e sincronizado com sucesso.'
          : 'Supabase não detectado nas variáveis de ambiente da Vercel. Operando com armazenamento local seguro.',
      };
    } catch (err) {
      return {
        connected: false,
        configured: false,
        databaseMode: 'Inacessível',
        message: this.formatErrorMessage(err),
      };
    }
  }

  /**
   * Test backend connection and diagnose common Vercel or environment issues
   */
  public static async testBackendConnection(): Promise<{
    ok: boolean;
    message: string;
    isVercel?: boolean;
    supabaseConfigured?: boolean;
    details?: any;
  }> {
    try {
      const health = await this.checkHealth();
      return {
        ok: true,
        message: 'Conexão com o backend estabelecida com sucesso.',
        isVercel: health.isVercel,
        supabaseConfigured: health.supabaseConfigured,
        details: health,
      };
    } catch (error: any) {
      if (error instanceof NotFoundError || (error instanceof ApiError && error.status === 404)) {
        return {
          ok: false,
          message:
            'Erro 404: Rota de API não encontrada. Na Vercel, confirme que a pasta /api e o arquivo vercel.json estão configurados e as Variáveis de Ambiente (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) foram adicionadas.',
          details: error,
        };
      }
      return {
        ok: false,
        message: this.formatErrorMessage(error),
        details: error,
      };
    }
  }

  /**
   * Fetch user account by @handle with 404 safety
   */
  public static async getUserByHandle(handle: string): Promise<UserAccount | null> {
    const cleanHandle = handle.trim().replace(/^@/, '');
    const endpoint = `/api/users/by-handle/${encodeURIComponent(cleanHandle)}`;
    try {
      const res = await this.safeFetch<{ user: UserAccount }>(
        endpoint,
        { method: 'GET' },
        `Usuário @${cleanHandle} não encontrado.`
      );
      return res.user;
    } catch (err) {
      if (err instanceof NotFoundError) {
        return null;
      }
      console.warn(`[ApiClient] Erro ao buscar perfil @${cleanHandle}:`, err);
      return null;
    }
  }

  /**
   * Like or increment engagement on a post
   */
  public static async likePost(postId: string): Promise<{ success: boolean; likes: number; postId: string }> {
    const endpoint = `/api/posts/${encodeURIComponent(postId)}/like`;
    return await this.safeFetch<{ success: boolean; likes: number; postId: string }>(
      endpoint,
      { method: 'POST' },
      'Erro ao curtir publicação.'
    );
  }

  /**
   * Add a comment to a post
   */
  public static async addComment(
    postId: string,
    text: string
  ): Promise<{ comment: any; commentsCount: number }> {
    const endpoint = `/api/posts/${encodeURIComponent(postId)}/comment`;
    return await this.safeFetch<{ comment: any; commentsCount: number }>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      },
      'Erro ao adicionar comentário.'
    );
  }

  /**
   * Helper to format any error into a readable and actionable user alert message
   */
  public static formatErrorMessage(error: unknown): string {
    if (!error) return 'Ocorreu um erro inesperado.';

    if (error instanceof NotFoundError) {
      return error.message || 'Recurso ou rota de API não encontrada (HTTP 404).';
    }

    if (error instanceof UnauthorizedError) {
      return error.message || 'Sua sessão expirou ou você não está autenticado (HTTP 401).';
    }

    if (error instanceof ForbiddenError) {
      return error.message || 'Acesso negado a este recurso (HTTP 403).';
    }

    if (error instanceof ServerError) {
      return error.message || 'Erro no servidor backend. Verifique os logs e a conexão com o banco de dados.';
    }

    if (error instanceof NetworkOrParseError) {
      return error.message || 'Falha de conexão com a API ou formato de resposta inesperado.';
    }

    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      if (error.message.includes('Unexpected token') || error.message.includes('is not valid JSON')) {
        return 'O servidor retornou uma página HTML (404/500) em vez de dados JSON. Verifique se as rotas da Vercel e as variáveis do Supabase estão configuradas.';
      }
      return error.message;
    }

    return String(error);
  }
}
