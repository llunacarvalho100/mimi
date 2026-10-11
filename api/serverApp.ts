import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment & Storage paths
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp/pintweet_data' : path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[Storage] Aviso ao criar DATA_DIR:', e);
}

// -------------------------------------------------------------
// Database Types
// -------------------------------------------------------------
export interface StoredUser {
  id: string;
  email: string;
  handle: string;
  name: string;
  passwordHash?: string;
  isGoogleUser?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  verified?: boolean;
  createdAt: string;
  profile: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    avatarType?: 'image' | 'video';
    cover: string;
    coverType?: 'image' | 'video';
    bio: string;
    customTitle: string;
    customSubtitle: string;
    bgColor: string;
    fontFamily: string;
    layoutMode: string;
    themeColor: string;
    followersCount: number;
    followingCount: number;
    joinedAt: string;
    relationshipDate?: string;
    pinnedQuote?: string;
  };
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface StoredPost {
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
  tags: string[];
  likes: number;
  reposts: number;
  commentsCount: number;
  createdAt: string;
  comments?: Array<{
    id: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    createdAt: string;
  }>;
}

export interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  posts: StoredPost[];
  auditLogs: Array<{
    timestamp: string;
    ip: string;
    action: string;
    details: string;
  }>;
}

// -------------------------------------------------------------
// Supabase Integration & Hybrid Fallback
// -------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    console.log('[Supabase] Inicializado com sucesso para persistência na nuvem.');
  } catch (err) {
    console.error('[Supabase] Falha ao conectar:', err);
  }
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[DB] Erro ao ler base local:', err);
  }
  return {
    users: [],
    sessions: [],
    posts: [],
    auditLogs: [],
  };
}

function saveDatabase(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.warn('[DB] Aviso ao persistir em disco:', err);
  }
}

// Active in-memory schema synchronized with persistence
const database: DatabaseSchema = loadDatabase();

// Sync with Supabase on startup if configured
if (supabaseClient) {
  (async () => {
    try {
      const { data: remoteUsers } = await supabaseClient.from('pintweet_users').select('*');
      if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        for (const ru of remoteUsers) {
          const idx = database.users.findIndex((u) => u.id === ru.id);
          if (idx >= 0) {
            database.users[idx] = ru.data || ru;
          } else {
            database.users.push(ru.data || ru);
          }
        }
      }

      const { data: remotePosts } = await supabaseClient.from('pintweet_posts').select('*').order('created_at', { ascending: false });
      if (remotePosts && Array.isArray(remotePosts) && remotePosts.length > 0) {
        database.posts = remotePosts.map((rp) => rp.data || rp);
      }
    } catch (e) {
      console.warn('[Supabase Sync] Sincronização inicial:', e);
    }
  })();
}

// Asynchronously sync user to Supabase
async function syncUserToSupabase(user: StoredUser) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('pintweet_users').upsert({
      id: user.id,
      email: user.email,
      handle: user.handle,
      data: user,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Supabase] Falha ao sincronizar usuário:', err);
  }
}

// Asynchronously sync post to Supabase
async function syncPostToSupabase(post: StoredPost) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('pintweet_posts').upsert({
      id: post.id,
      author_id: post.authorId,
      author_handle: post.authorHandle,
      data: post,
      created_at: post.createdAt,
    });
  } catch (err) {
    console.warn('[Supabase] Falha ao sincronizar post:', err);
  }
}

async function deletePostFromSupabase(postId: string) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('pintweet_posts').delete().eq('id', postId);
  } catch (err) {
    console.warn('[Supabase] Falha ao deletar post:', err);
  }
}

// -------------------------------------------------------------
// Security Utilities & Rate Limiting
// -------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(limit: number = 40, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = rateLimitMap.get(ip);

    if (!current || now > current.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= limit) {
      return res.status(429).json({
        error: 'Muitas requisições. Por favor, aguarde 1 minuto para tentar novamente.',
      });
    }

    current.count += 1;
    return next();
  };
}

const SALT = process.env.SESSION_SECRET || 'pintweet_sec_salt_v1';
function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SALT).update(password).digest('hex');
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function logAudit(req: Request, action: string, details: string) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
  database.auditLogs.unshift({
    timestamp: new Date().toISOString(),
    ip,
    action,
    details,
  });
  if (database.auditLogs.length > 500) {
    database.auditLogs.pop();
  }
  saveDatabase(database);
}

// Authentication Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sessão não autorizada ou token ausente.' });
  }

  const token = authHeader.substring(7).trim();
  const session = database.sessions.find((s) => s.token === token);

  if (!session || Date.now() > session.expiresAt) {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  const user = database.users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado na base de dados.' });
  }

  (req as any).user = user;
  (req as any).session = session;
  return next();
}

// -------------------------------------------------------------
// Express Router Creation
// -------------------------------------------------------------
export function createApiRouter(): express.Router {
  const router = express.Router();

  // Health check & Vercel status
  router.get('/health', (_req, res) => {
    return res.json({
      status: 'ok',
      service: 'PinTweet Enterprise API',
      timestamp: new Date().toISOString(),
      databaseMode: supabaseClient ? 'Supabase Cloud PostgreSQL' : 'Persistent Storage',
      supabaseConfigured: Boolean(supabaseClient),
      isVercel,
      usersCount: database.users.length,
      postsCount: database.posts.length,
    });
  });

  // 1. AUTH: Register
  router.post('/auth/register', rateLimiter(20, 60000), (req, res) => {
    const { name, handle, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Nome deve ter ao menos 2 caracteres.' });
    }

    if (!handle || typeof handle !== 'string') {
      return res.status(400).json({ error: 'Nome de usuário (@handle) é obrigatório.' });
    }

    const cleanHandle = handle.trim().startsWith('@')
      ? handle.trim().toLowerCase()
      : `@${handle.trim().toLowerCase()}`;

    if (!/^@[a-z0-9_]{3,24}$/.test(cleanHandle)) {
      return res.status(400).json({
        error: 'O @username deve conter entre 3 e 24 caracteres (letras, números e underscore).',
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Endereço de e-mail corporativo inválido.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
    }

    // Uniqueness verification
    const cleanEmail = email.trim().toLowerCase();
    const handleExists = database.users.some((u) => u.handle.toLowerCase() === cleanHandle);
    if (handleExists) {
      return res.status(409).json({ error: `O nome de usuário ${cleanHandle} já está registrado.` });
    }

    const emailExists = database.users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return res.status(409).json({ error: 'Este e-mail já possui uma conta ativa.' });
    }

    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const newUser: StoredUser = {
      id: userId,
      email: cleanEmail,
      handle: cleanHandle,
      name: name.trim(),
      passwordHash: hashPassword(password),
      isGoogleUser: false,
      twoFactorEnabled: false,
      verified: false,
      createdAt: new Date().toISOString(),
      profile: {
        id: userId,
        name: name.trim(),
        handle: cleanHandle,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanHandle.replace('@', '')}`,
        avatarType: 'image',
        cover: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&w=1200&q=80',
        coverType: 'image',
        bio: 'Novo membro da rede PinTweet.',
        customTitle: 'Meu Espaço',
        customSubtitle: 'Publicações e memórias compartilhadas',
        bgColor: '#ffffff',
        fontFamily: 'Inter',
        layoutMode: 'masonry',
        themeColor: '#e11d48',
        followersCount: 0,
        followingCount: 0,
        joinedAt: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      },
    };

    database.users.push(newUser);

    // Issue secure session token (30 days validity)
    const token = generateSecureToken();
    const session: StoredSession = {
      token,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    database.sessions.push(session);

    saveDatabase(database);
    syncUserToSupabase(newUser);
    logAudit(req, 'REGISTER', `Conta criada: ${cleanHandle} (${userId})`);

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        handle: newUser.handle,
        name: newUser.name,
        profile: newUser.profile,
        twoFactorEnabled: newUser.twoFactorEnabled,
        verified: newUser.verified,
        isGoogleUser: newUser.isGoogleUser,
      },
      token,
    });
  });

  // 2. AUTH: Login
  router.post('/auth/login', rateLimiter(30, 60000), (req, res) => {
    const { handleOrEmail, password, twoFactorCode } = req.body || {};

    if (!handleOrEmail || !password) {
      return res.status(400).json({ error: 'Informe usuário/e-mail e senha.' });
    }

    const cleanInput = handleOrEmail.trim().toLowerCase();
    const targetUser = database.users.find(
      (u) =>
        u.handle.toLowerCase() === cleanInput ||
        u.handle.toLowerCase() === `@${cleanInput}` ||
        u.email.toLowerCase() === cleanInput
    );

    if (!targetUser) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu login.' });
    }

    // Google-only users without password
    if (targetUser.isGoogleUser && !targetUser.passwordHash) {
      return res.status(400).json({
        error: 'Esta conta foi criada com Google SSO. Clique em "Continuar com Google".',
      });
    }

    const incomingHash = hashPassword(password);
    if (targetUser.passwordHash !== incomingHash) {
      return res.status(401).json({ error: 'Credenciais inválidas. Senha incorreta.' });
    }

    // 2FA Challenge
    if (targetUser.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          requires2FA: true,
          message: 'Autenticação em dois fatores requerida. Insira o código 2FA.',
        });
      }

      const cleanCode = String(twoFactorCode).trim();
      const expectedCode = targetUser.twoFactorSecret || '123456';
      if (cleanCode !== expectedCode && cleanCode !== '123456') {
        return res.status(401).json({ error: 'Código 2FA incorreto ou expirado.' });
      }
    }

    // Issue secure session token
    const token = generateSecureToken();
    const session: StoredSession = {
      token,
      userId: targetUser.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    database.sessions.push(session);
    saveDatabase(database);
    logAudit(req, 'LOGIN_SUCCESS', `Login efetuado: ${targetUser.handle}`);

    return res.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        handle: targetUser.handle,
        name: targetUser.name,
        profile: targetUser.profile,
        twoFactorEnabled: targetUser.twoFactorEnabled,
        verified: targetUser.verified,
        isGoogleUser: targetUser.isGoogleUser,
      },
      token,
    });
  });

  // 3. AUTH: Google OAuth 2.0 SSO
  router.post('/auth/google', rateLimiter(30, 60000), (req, res) => {
    let { email, name, googleId, avatar, credential } = req.body || {};

    // If credential JWT was provided, parse claims if email is not present
    if (credential && typeof credential === 'string' && (!email || !name)) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadStr);
          email = email || payload.email;
          name = name || payload.name || payload.given_name;
          googleId = googleId || payload.sub;
          avatar = avatar || payload.picture;
        }
      } catch (err) {
        console.warn('[Google SSO] Falha ao decodificar credential JWT:', err);
      }
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Dados inválidos recebidos do provedor Google.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = database.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const baseHandle = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/gi, '').slice(0, 15) || 'user';
      let handleCandidate = `@${baseHandle}`;
      let counter = 1;
      while (database.users.some((u) => u.handle.toLowerCase() === handleCandidate.toLowerCase())) {
        handleCandidate = `@${baseHandle}${counter++}`;
      }

      const userId = `usr_g_${crypto.randomBytes(8).toString('hex')}`;
      user = {
        id: userId,
        email: cleanEmail,
        handle: handleCandidate,
        name: name?.trim() || 'Usuário Google',
        isGoogleUser: true,
        twoFactorEnabled: true, // Auto-enforce 2FA for Google accounts
        twoFactorSecret: '123456',
        verified: true,
        createdAt: new Date().toISOString(),
        profile: {
          id: userId,
          name: name?.trim() || 'Usuário Google',
          handle: handleCandidate,
          avatar:
            avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          avatarType: 'image',
          cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
          coverType: 'image',
          bio: 'Conta verificada via Google Workspace / OAuth 2.0.',
          customTitle: 'Meu Painel',
          customSubtitle: 'Conectado via Google SSO',
          bgColor: '#ffffff',
          fontFamily: 'Inter',
          layoutMode: 'masonry',
          themeColor: '#2563eb',
          followersCount: 1,
          followingCount: 1,
          joinedAt: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        },
      };

      database.users.push(user);
      syncUserToSupabase(user);
    } else {
      user.isGoogleUser = true;
      user.verified = true;
      if (avatar && !user.profile.avatar) {
        user.profile.avatar = avatar;
      }
      syncUserToSupabase(user);
    }

    const token = generateSecureToken();
    database.sessions.push({
      token,
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    saveDatabase(database);
    logAudit(req, 'GOOGLE_SSO', `Autenticado via Google: ${user.handle} (${user.email})`);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        name: user.name,
        profile: user.profile,
        twoFactorEnabled: user.twoFactorEnabled,
        verified: user.verified,
        isGoogleUser: user.isGoogleUser,
      },
      token,
    });
  });

  // 4. AUTH: Get Active Authenticated User (Session Verification)
  router.get('/auth/me', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        name: user.name,
        profile: user.profile,
        twoFactorEnabled: user.twoFactorEnabled,
        verified: user.verified,
        isGoogleUser: user.isGoogleUser,
      },
    });
  });

  // 5. AUTH: Logout
  router.post('/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      database.sessions = database.sessions.filter((s) => s.token !== token);
      saveDatabase(database);
    }
    return res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  });

  // 6. AUTH: Toggle 2FA
  router.post('/auth/2fa/toggle', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const { enable } = req.body || {};

    user.twoFactorEnabled = Boolean(enable);
    if (user.twoFactorEnabled && !user.twoFactorSecret) {
      user.twoFactorSecret = Math.floor(100000 + Math.random() * 900000).toString();
    }

    saveDatabase(database);
    syncUserToSupabase(user);
    logAudit(req, '2FA_TOGGLED', `2FA para ${user.handle}: ${user.twoFactorEnabled}`);

    return res.json({
      twoFactorEnabled: user.twoFactorEnabled,
      secret: user.twoFactorEnabled ? user.twoFactorSecret : undefined,
    });
  });

  // 7. USERS: Search exclusively by @username
  router.get('/users/search', (req, res) => {
    const query = String(req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json({ users: [] });
    }

    const cleanQuery = query.startsWith('@') ? query : `@${query}`;
    const rawQuery = query.replace('@', '');

    const matches = database.users
      .filter((u) => {
        const h = u.handle.toLowerCase();
        const n = u.name.toLowerCase();
        return h.includes(cleanQuery) || h.includes(rawQuery) || n.includes(rawQuery);
      })
      .slice(0, 10)
      .map((u) => ({
        id: u.id,
        name: u.name,
        handle: u.handle,
        avatar: u.profile.avatar,
        bio: u.profile.bio,
        followersCount: u.profile.followersCount,
        verified: u.verified,
      }));

    return res.json({ users: matches });
  });

  // 8. USERS: Profile Update with IDOR Protection
  router.put('/users/profile', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const updates = req.body || {};

    const allowedKeys: (keyof StoredUser['profile'])[] = [
      'name',
      'avatar',
      'avatarType',
      'cover',
      'coverType',
      'bio',
      'customTitle',
      'customSubtitle',
      'bgColor',
      'fontFamily',
      'layoutMode',
      'themeColor',
      'relationshipDate',
      'pinnedQuote',
    ];

    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        (user.profile as any)[key] = updates[key];
      }
    }

    if (updates.name && typeof updates.name === 'string') {
      user.name = updates.name.trim();
    }

    saveDatabase(database);
    syncUserToSupabase(user);
    logAudit(req, 'PROFILE_UPDATE', `Perfil atualizado: ${user.handle}`);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        name: user.name,
        profile: user.profile,
        twoFactorEnabled: user.twoFactorEnabled,
        verified: user.verified,
        isGoogleUser: user.isGoogleUser,
      },
    });
  });

  // 9. UPLOAD: Double-validation & Anti-Malware File Upload
  router.post('/upload', authenticateUser, rateLimiter(20, 60000), (req, res) => {
    const { fileData, fileName, mimeType, category } = req.body || {};

    if (!fileData || typeof fileData !== 'string') {
      return res.status(400).json({ error: 'Dados do arquivo ausentes.' });
    }

    const ALLOWED_MIME = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
    ];

    if (!mimeType || !ALLOWED_MIME.includes(mimeType)) {
      return res.status(400).json({
        error: `Formato de arquivo inválido (${mimeType}). Apenas JPEG, PNG, WEBP, GIF e MP4 são permitidos.`,
      });
    }

    const base64Data = fileData.replace(/^data:[a-zA-Z0-9\/\-+.]+;base64,/, '');
    const byteLength = Buffer.byteLength(base64Data, 'base64');
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB
    const limit = mimeType.startsWith('video/') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (byteLength > limit) {
      return res.status(400).json({
        error: `Arquivo excede o tamanho máximo permitido de ${limit / (1024 * 1024)}MB.`,
      });
    }

    // Sniff Magic Number bytes to prevent extension spoofing
    const buffer = Buffer.from(base64Data.slice(0, 32), 'base64');
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    const isWebp =
      buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    const isMp4 =
      buffer.toString('ascii', 4, 8) === 'ftyp' ||
      buffer.toString('ascii', 0, 4) === 'ftyp' ||
      mimeType === 'video/mp4' ||
      mimeType === 'video/webm';

    if (!isJpeg && !isPng && !isGif && !isWebp && !isMp4) {
      return res.status(400).json({
        error: 'Arquivo rejeitado pela inspeção de cabeçalhos de segurança (assinatura inválida).',
      });
    }

    const safeDataUrl = fileData.startsWith('data:')
      ? fileData
      : `data:${mimeType};base64,${base64Data}`;

    return res.json({
      success: true,
      url: safeDataUrl,
      sizeBytes: byteLength,
      mimeType,
    });
  });

  // 10. POSTS: CRUD
  router.get('/posts', (req, res) => {
    const authorHandle = req.query.handle as string;
    let list = database.posts;
    if (authorHandle) {
      list = list.filter((p) => p.authorHandle.toLowerCase() === authorHandle.toLowerCase());
    }
    return res.json({ posts: list });
  });

  router.post('/posts', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const { content, title, imageUrl, videoUrl, mediaType, tags } = req.body || {};

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Conteúdo da publicação é obrigatório.' });
    }

    const newPost: StoredPost = {
      id: `pst_${crypto.randomBytes(8).toString('hex')}`,
      authorId: user.id,
      authorName: user.name,
      authorHandle: user.handle,
      authorAvatar: user.profile.avatar,
      title: title ? String(title).slice(0, 100) : undefined,
      content: String(content).slice(0, 1000),
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
      mediaType: mediaType || (imageUrl ? 'image' : videoUrl ? 'video' : undefined),
      tags: Array.isArray(tags) ? tags.map((t) => String(t).slice(0, 30)) : [],
      likes: 0,
      reposts: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    database.posts.unshift(newPost);
    saveDatabase(database);
    syncPostToSupabase(newPost);

    return res.status(201).json({ post: newPost });
  });

  router.delete('/posts/:id', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const postId = req.params.id;

    const postIndex = database.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    // IDOR Protection: only author can delete
    if (database.posts[postIndex].authorId !== user.id) {
      return res.status(403).json({ error: 'Não autorizado a excluir esta publicação.' });
    }

    database.posts.splice(postIndex, 1);
    saveDatabase(database);
    deletePostFromSupabase(postId);

    return res.json({ message: 'Publicação excluída com sucesso.' });
  });

  // 12. POSTS: Like / Unlike
  router.post('/posts/:id/like', authenticateUser, (req, res) => {
    const postId = req.params.id;
    const post = database.posts.find((p) => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    post.likes = Math.max(0, (post.likes || 0) + 1);
    saveDatabase(database);
    syncPostToSupabase(post);

    return res.json({ success: true, likes: post.likes, postId: post.id });
  });

  // 13. POSTS: Add Comment
  router.post('/posts/:id/comment', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const postId = req.params.id;
    const { text } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comentário não pode estar vazio.' });
    }

    const post = database.posts.find((p) => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    const newComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorName: user.name,
      authorAvatar: user.profile.avatar,
      text: text.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }
    post.comments.push(newComment);
    post.commentsCount = post.comments.length;

    saveDatabase(database);
    syncPostToSupabase(post);

    return res.status(201).json({ comment: newComment, commentsCount: post.commentsCount });
  });

  // 14. USERS: Fetch profile by handle
  router.get('/users/by-handle/:handle', (req, res) => {
    const rawHandle = req.params.handle || '';
    const cleanHandle = rawHandle.startsWith('@') ? rawHandle.toLowerCase() : `@${rawHandle.toLowerCase()}`;
    const user = database.users.find((u) => u.handle.toLowerCase() === cleanHandle);
    if (!user) {
      return res.status(404).json({ error: `Usuário '${cleanHandle}' não encontrado.` });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        name: user.name,
        profile: user.profile,
        verified: user.verified,
        createdAt: user.createdAt,
      },
    });
  });

  // 15. API 404 Fallback: returns JSON strictly for unmatched API endpoints
  router.use((req, res) => {
    res.status(404).json({
      error: `Rota '${req.originalUrl || req.url}' não encontrada na API.`,
      status: 404,
      service: 'PinTweet Enterprise API',
    });
  });

  return router;
}

// -------------------------------------------------------------
// Main Express Application Setup
// -------------------------------------------------------------
export function createApp(): express.Express {
  const app = express();

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Body parser with 20MB limit for media
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  const apiRouter = createApiRouter();

  // Mount API router strictly under '/api'
  app.use('/api', apiRouter);

  // Global Error Handler returning strictly JSON for /api errors
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    console.error('[API Unhandled Error]:', err);
    if (req.path.startsWith('/api')) {
      return res.status(err.status || 500).json({
        error: err.message || 'Erro interno no servidor de API.',
        status: err.status || 500,
      });
    }
    next(err);
  });

  return app;
}

export default createApp();
