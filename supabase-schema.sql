-- ==============================================================================
-- PinTweet - Esquema SQL para Supabase (PostgreSQL)
-- Copie e cole este código no Supabase: SQL Editor > New query > Run
-- ==============================================================================

-- 1. Tabela de Usuários Enterprise
CREATE TABLE IF NOT EXISTS public.pintweet_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Publicações (Feed & Posts)
CREATE TABLE IF NOT EXISTS public.pintweet_posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Índices para Pesquisa Rápida
CREATE INDEX IF NOT EXISTS idx_pintweet_users_handle ON public.pintweet_users (handle);
CREATE INDEX IF NOT EXISTS idx_pintweet_posts_author ON public.pintweet_posts (author_handle);
CREATE INDEX IF NOT EXISTS idx_pintweet_posts_created ON public.pintweet_posts (created_at DESC);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.pintweet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pintweet_posts ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso
CREATE POLICY "Public read for pintweet_users" ON public.pintweet_users FOR SELECT USING (true);
CREATE POLICY "Public read for pintweet_posts" ON public.pintweet_posts FOR SELECT USING (true);
CREATE POLICY "Service role full access pintweet_users" ON public.pintweet_users FOR ALL USING (true);
CREATE POLICY "Service role full access pintweet_posts" ON public.pintweet_posts FOR ALL USING (true);
