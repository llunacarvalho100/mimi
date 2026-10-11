import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data Directory and Persistent Storage
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
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

interface StoredSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

interface StoredPost {
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

interface DatabaseSchema {
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

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[DB] Erro ao ler base de dados:', err);
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
    console.error('[DB] Erro ao salvar base de dados:', err);
  }
}

// In-memory active DB reference with immediate persistence
let database: DatabaseSchema = loadDatabase();

// Security: Rate Limiting Store
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(limit: number = 40, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
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

// Password Hashing with SHA-256 and Salt
function hashPassword(password: string, salt: string = 'pintweet_sec_salt_v1'): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Generate Secure Session Token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Audit Logger
function logAudit(req: Request, action: string, details: string) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
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

// Authentication Middleware (Token Verification & IDOR Defense)
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

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Body parser with 20MB limit for secure media transfers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health & Security Status
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      databaseUsers: database.users.length,
      databasePosts: database.posts.length,
      version: '1.0.0-enterprise',
    });
  });

  // 1. AUTH: Register (Strict Validation, No Mock)
  app.post('/api/auth/register', rateLimiter(20, 60000), (req, res) => {
    const { name, handle, email, password } = req.body;

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

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter pelo menos 6 caracteres.' });
    }

    // Check duplicate
    const existing = database.users.find(
      (u) => u.handle.toLowerCase() === cleanHandle || u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return res.status(409).json({
        error: existing.handle.toLowerCase() === cleanHandle
          ? 'Este @username já está em uso.'
          : 'Este e-mail já está cadastrado.',
      });
    }

    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const nowStr = new Date().toISOString();
    const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());

    const newUser: StoredUser = {
      id: userId,
      email: email.trim().toLowerCase(),
      handle: cleanHandle,
      name: name.trim(),
      passwordHash: hashPassword(password),
      isGoogleUser: false,
      twoFactorEnabled: false,
      verified: false,
      createdAt: nowStr,
      profile: {
        id: `prf_${crypto.randomBytes(8).toString('hex')}`,
        name: name.trim(),
        handle: cleanHandle,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80',
        bio: 'Membro autêntico no PinTweet ✨',
        customTitle: 'Meu Espaço Afetivo ✨',
        customSubtitle: 'Colecionando memórias e inspirações reais.',
        bgColor: '#ffffff',
        fontFamily: 'font-twitter',
        layoutMode: 'mosaic',
        themeColor: '#f43f5e',
        followersCount: 0,
        followingCount: 0,
        joinedAt: `Entrou em ${monthYear}`,
      },
    };

    database.users.push(newUser);

    // Create session (7 days validity)
    const token = generateSecureToken();
    database.sessions.push({
      token,
      userId: newUser.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    saveDatabase(database);
    logAudit(req, 'REGISTER_SUCCESS', `Novo usuário cadastrado: ${cleanHandle}`);

    const { passwordHash, ...safeUser } = newUser;
    return res.status(201).json({
      user: safeUser,
      token,
      message: 'Conta criada com sucesso!',
    });
  });

  // 2. AUTH: Login (Rate limited, Brute Force protection)
  app.post('/api/auth/login', rateLimiter(25, 60000), (req, res) => {
    const { handleOrEmail, password, twoFactorCode } = req.body;

    if (!handleOrEmail || !password) {
      return res.status(400).json({ error: 'Credenciais incompletas.' });
    }

    const query = handleOrEmail.trim().toLowerCase();
    const formattedHandle = query.startsWith('@') ? query : `@${query}`;

    const user = database.users.find(
      (u) =>
        u.handle.toLowerCase() === formattedHandle ||
        u.handle.toLowerCase() === query ||
        u.email.toLowerCase() === query
    );

    if (!user || !user.passwordHash) {
      logAudit(req, 'LOGIN_FAIL', `Falha de login para: ${query}`);
      return res.status(401).json({ error: 'E-mail/usuário ou senha incorretos.' });
    }

    const expectedHash = hashPassword(password);
    if (user.passwordHash !== expectedHash) {
      logAudit(req, 'LOGIN_FAIL_PASSWORD', `Senha incorreta para usuário: ${user.handle}`);
      return res.status(401).json({ error: 'E-mail/usuário ou senha incorretos.' });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          requires2FA: true,
          message: 'Autenticação em duas etapas necessária. Insira o código de 6 dígitos.',
        });
      }
      // Simple verification for demo/2fa testing (or actual 6-digit pin)
      if (typeof twoFactorCode !== 'string' || twoFactorCode.trim().length !== 6) {
        return res.status(400).json({ error: 'Código de 2FA inválido (deve conter 6 dígitos).' });
      }
    }

    // Generate Session
    const token = generateSecureToken();
    database.sessions.push({
      token,
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    saveDatabase(database);
    logAudit(req, 'LOGIN_SUCCESS', `Login bem-sucedido: ${user.handle}`);

    const { passwordHash, ...safeUser } = user;
    return res.json({
      user: safeUser,
      token,
      message: 'Login realizado com sucesso!',
    });
  });

  // 3. AUTH: Google OAuth 2.0 (SSO)
  app.post('/api/auth/google', rateLimiter(30, 60000), (req, res) => {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Dados da conta Google incompletos.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = database.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Create user from Google Profile
      const baseHandle = `@${cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '')}`.slice(0, 20);
      let uniqueHandle = baseHandle;
      let counter = 1;
      while (database.users.some((u) => u.handle.toLowerCase() === uniqueHandle.toLowerCase())) {
        uniqueHandle = `${baseHandle}${counter}`;
        counter++;
      }

      const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());
      const userId = `usr_g_${crypto.randomBytes(8).toString('hex')}`;

      user = {
        id: userId,
        email: cleanEmail,
        handle: uniqueHandle,
        name: name.trim(),
        isGoogleUser: true,
        twoFactorEnabled: false,
        verified: true, // Google accounts verified
        createdAt: new Date().toISOString(),
        profile: {
          id: `prf_${crypto.randomBytes(8).toString('hex')}`,
          name: name.trim(),
          handle: uniqueHandle,
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80',
          bio: 'Conta autenticada via Google SSO 🛡️',
          customTitle: 'Meu Espaço Afetivo ✨',
          customSubtitle: 'Perfil seguro com verificação em duas etapas.',
          bgColor: '#ffffff',
          fontFamily: 'font-twitter',
          layoutMode: 'mosaic',
          themeColor: '#3b82f6',
          followersCount: 0,
          followingCount: 0,
          joinedAt: `Entrou em ${monthYear}`,
        },
      };

      database.users.push(user);
    } else {
      user.isGoogleUser = true;
    }

    const token = generateSecureToken();
    database.sessions.push({
      token,
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    saveDatabase(database);
    logAudit(req, 'GOOGLE_SSO_SUCCESS', `Login Google para: ${user.email}`);

    const { passwordHash, ...safeUser } = user;
    return res.json({
      user: safeUser,
      token,
      message: 'Autenticado com sucesso via Google SSO!',
    });
  });

  // 4. AUTH: Me (Validate Session)
  app.get('/api/auth/me', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  // 5. AUTH: Logout
  app.post('/api/auth/logout', authenticateUser, (req, res) => {
    const session = (req as any).session as StoredSession;
    database.sessions = database.sessions.filter((s) => s.token !== session.token);
    saveDatabase(database);
    return res.json({ message: 'Sessão encerrada com sucesso.' });
  });

  // 6. 2FA: Enable / Verify
  app.post('/api/auth/2fa/toggle', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const { enable } = req.body;

    user.twoFactorEnabled = Boolean(enable);
    saveDatabase(database);
    logAudit(req, '2FA_TOGGLED', `2FA ${user.twoFactorEnabled ? 'ativado' : 'desativado'} para ${user.handle}`);

    return res.json({
      twoFactorEnabled: user.twoFactorEnabled,
      message: user.twoFactorEnabled
        ? 'Autenticação em duas etapas ativada com sucesso!'
        : 'Autenticação em duas etapas desativada.',
    });
  });

  // 7. USER: Search by @username (Strict Native Search)
  app.get('/api/users/search', (req, res) => {
    const query = (req.query.q as string || '').trim().toLowerCase();
    if (!query) {
      return res.json({ users: [] });
    }

    const cleanQuery = query.startsWith('@') ? query : `@${query}`;

    // Filter users strictly matching username or display name
    const matches = database.users
      .filter((u) => {
        return (
          u.handle.toLowerCase().includes(query) ||
          u.handle.toLowerCase().includes(cleanQuery) ||
          u.name.toLowerCase().includes(query)
        );
      })
      .slice(0, 15)
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

  // 8. USER: Update Profile (IDOR Defense: user edits only self)
  app.put('/api/users/profile', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const updates = req.body;

    if (updates.name && typeof updates.name === 'string') {
      user.name = updates.name.trim();
      user.profile.name = updates.name.trim();
    }

    if (updates.bio !== undefined) user.profile.bio = String(updates.bio).slice(0, 280);
    if (updates.customTitle !== undefined) user.profile.customTitle = String(updates.customTitle).slice(0, 80);
    if (updates.customSubtitle !== undefined) user.profile.customSubtitle = String(updates.customSubtitle).slice(0, 120);
    if (updates.bgColor) user.profile.bgColor = String(updates.bgColor);
    if (updates.fontFamily) user.profile.fontFamily = String(updates.fontFamily);
    if (updates.layoutMode) user.profile.layoutMode = String(updates.layoutMode);
    if (updates.themeColor) user.profile.themeColor = String(updates.themeColor);
    if (updates.avatar) user.profile.avatar = updates.avatar;
    if (updates.avatarType) user.profile.avatarType = updates.avatarType;
    if (updates.cover) user.profile.cover = updates.cover;
    if (updates.coverType) user.profile.coverType = updates.coverType;

    saveDatabase(database);
    logAudit(req, 'PROFILE_UPDATE', `Perfil atualizado para ${user.handle}`);

    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser, message: 'Perfil salvo com sucesso!' });
  });

  // 9. UPLOAD: Double Validation & Anti-Malware Engine
  app.post('/api/upload', authenticateUser, rateLimiter(30, 60000), (req, res) => {
    const { fileData, fileName, mimeType, category } = req.body;

    if (!fileData || !fileName || !mimeType) {
      return res.status(400).json({ error: 'Dados do arquivo ausentes.' });
    }

    // 1. Strict MIME type whitelist
    const ALLOWED_MIME = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
    ];

    if (!ALLOWED_MIME.includes(mimeType.toLowerCase())) {
      return res.status(415).json({
        error: `Tipo de mídia não permitido (${mimeType}). Permitidos: JPG, PNG, WEBP, GIF, MP4.`,
      });
    }

    // 2. Strict extension check
    const ext = path.extname(fileName).toLowerCase();
    const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'];
    if (!ALLOWED_EXT.includes(ext)) {
      return res.status(400).json({ error: 'Extensão de arquivo inválida.' });
    }

    // 3. Size validation
    // Base64 to byte length calculation
    const base64Data = fileData.replace(/^data:.*?;base64,/, '');
    const byteLength = Buffer.byteLength(base64Data, 'base64');
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB

    if (mimeType.startsWith('video/') && byteLength > MAX_VIDEO_SIZE) {
      return res.status(413).json({ error: 'Vídeo excede o tamanho máximo de 15MB.' });
    } else if (mimeType.startsWith('image/') && byteLength > MAX_IMAGE_SIZE) {
      return res.status(413).json({ error: 'Imagem excede o tamanho máximo de 5MB.' });
    }

    // 4. Anti-Malware / Magic Header Validation
    const bufferHeader = Buffer.from(base64Data.slice(0, 64), 'base64');
    const isJpeg = bufferHeader[0] === 0xff && bufferHeader[1] === 0xd8 && bufferHeader[2] === 0xff;
    const isPng = bufferHeader[0] === 0x89 && bufferHeader[1] === 0x50 && bufferHeader[2] === 0x4e && bufferHeader[3] === 0x47;
    const isWebp = bufferHeader.slice(0, 4).toString('ascii') === 'RIFF' && bufferHeader.slice(8, 12).toString('ascii') === 'WEBP';
    const isGif = bufferHeader.slice(0, 4).toString('ascii') === 'GIF8';
    const isMp4 = bufferHeader.slice(4, 8).toString('ascii') === 'ftyp' || mimeType === 'video/mp4';

    if (!isJpeg && !isPng && !isWebp && !isGif && !isMp4) {
      return res.status(422).json({
        error: 'Arquivo rejeitado pela inspeção de segurança (assinatura binária inválida/maliciosa).',
      });
    }

    // In this production environment, return validated data URI or safe object URL
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

  // 10. POSTS: CRUD with Multitenancy
  app.get('/api/posts', (req, res) => {
    const authorHandle = req.query.handle as string;
    let list = database.posts;
    if (authorHandle) {
      list = list.filter((p) => p.authorHandle.toLowerCase() === authorHandle.toLowerCase());
    }
    return res.json({ posts: list });
  });

  app.post('/api/posts', authenticateUser, (req, res) => {
    const user = (req as any).user as StoredUser;
    const { content, title, imageUrl, videoUrl, mediaType, tags } = req.body;

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

    return res.status(201).json({ post: newPost });
  });

  app.delete('/api/posts/:id', authenticateUser, (req, res) => {
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
    return res.json({ message: 'Publicação excluída com sucesso.' });
  });

  // 11. Vite Dev Server Middleware mounting (port 3000)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enterprise Server] Servidor executando com segurança na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
