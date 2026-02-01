-- ===========================================
-- SISTEMA MULTI-STORIA CON TRACKING
-- Esegui questo SQL nel Supabase SQL Editor
-- ===========================================

-- Tabella storie
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  tagline VARCHAR(200),
  description TEXT,
  setting VARCHAR(200),
  emoji VARCHAR(10),
  cover_image_url TEXT,
  min_players INTEGER DEFAULT 6,
  max_players INTEGER DEFAULT 20,
  has_accomplice BOOLEAN DEFAULT true,
  accomplice_threshold INTEGER DEFAULT 12,
  second_accomplice_threshold INTEGER DEFAULT 16,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active, sort_order);

-- Ruoli per ogni storia
CREATE TABLE IF NOT EXISTS story_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  role_key VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  emoji VARCHAR(10),
  color_class VARCHAR(50),
  description TEXT NOT NULL,
  role_type VARCHAR(20) DEFAULT 'regular',
  pair_with VARCHAR(50),
  scoring_rules JSONB,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(story_id, role_key)
);

CREATE INDEX IF NOT EXISTS idx_story_roles_story ON story_roles(story_id);
CREATE INDEX IF NOT EXISTS idx_story_roles_key ON story_roles(story_id, role_key);

-- Obiettivi per ogni ruolo
CREATE TABLE IF NOT EXISTS story_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES story_roles(id) ON DELETE CASCADE,
  objective_key VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  text TEXT NOT NULL,
  hint TEXT,
  points INTEGER DEFAULT 10,
  risk VARCHAR(20) DEFAULT 'low',
  target_role VARCHAR(50),
  fallback_text TEXT,
  requires_discovery VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  UNIQUE(role_id, objective_key)
);

CREATE INDEX IF NOT EXISTS idx_story_objectives_role ON story_objectives(role_id);
CREATE INDEX IF NOT EXISTS idx_story_objectives_type ON story_objectives(role_id, type);

-- Coppie di ruoli
CREATE TABLE IF NOT EXISTS story_role_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  role_key_1 VARCHAR(50) NOT NULL,
  role_key_2 VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(story_id, role_key_1, role_key_2)
);

CREATE INDEX IF NOT EXISTS idx_story_role_pairs_story ON story_role_pairs(story_id);

-- Gruppi di gioco
CREATE TABLE IF NOT EXISTS game_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membri dei gruppi
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES game_groups(id) ON DELETE CASCADE,
  player_fingerprint VARCHAR(100),
  nickname VARCHAR(30),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, player_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_fingerprint ON group_members(player_fingerprint);

-- Storico storie giocate
CREATE TABLE IF NOT EXISTS group_story_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES game_groups(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id),
  played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, story_id, room_id)
);

CREATE INDEX IF NOT EXISTS idx_group_history_group ON group_story_history(group_id);
CREATE INDEX IF NOT EXISTS idx_group_history_story ON group_story_history(story_id);

-- Aggiungere colonne a rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES stories(id);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES game_groups(id);

CREATE INDEX IF NOT EXISTS idx_rooms_story ON rooms(story_id);
CREATE INDEX IF NOT EXISTS idx_rooms_group ON rooms(group_id);

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON stories;
DROP POLICY IF EXISTS "Stories are insertable by everyone" ON stories;
DROP POLICY IF EXISTS "Stories are updatable by everyone" ON stories;
DROP POLICY IF EXISTS "Stories are deletable by everyone" ON stories;
CREATE POLICY "Stories are viewable by everyone" ON stories FOR SELECT USING (true);
CREATE POLICY "Stories are insertable by everyone" ON stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Stories are updatable by everyone" ON stories FOR UPDATE USING (true);
CREATE POLICY "Stories are deletable by everyone" ON stories FOR DELETE USING (true);

ALTER TABLE story_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Story roles are viewable by everyone" ON story_roles;
DROP POLICY IF EXISTS "Story roles are insertable by everyone" ON story_roles;
DROP POLICY IF EXISTS "Story roles are updatable by everyone" ON story_roles;
DROP POLICY IF EXISTS "Story roles are deletable by everyone" ON story_roles;
CREATE POLICY "Story roles are viewable by everyone" ON story_roles FOR SELECT USING (true);
CREATE POLICY "Story roles are insertable by everyone" ON story_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Story roles are updatable by everyone" ON story_roles FOR UPDATE USING (true);
CREATE POLICY "Story roles are deletable by everyone" ON story_roles FOR DELETE USING (true);

ALTER TABLE story_objectives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Story objectives are viewable by everyone" ON story_objectives;
DROP POLICY IF EXISTS "Story objectives are insertable by everyone" ON story_objectives;
DROP POLICY IF EXISTS "Story objectives are updatable by everyone" ON story_objectives;
DROP POLICY IF EXISTS "Story objectives are deletable by everyone" ON story_objectives;
CREATE POLICY "Story objectives are viewable by everyone" ON story_objectives FOR SELECT USING (true);
CREATE POLICY "Story objectives are insertable by everyone" ON story_objectives FOR INSERT WITH CHECK (true);
CREATE POLICY "Story objectives are updatable by everyone" ON story_objectives FOR UPDATE USING (true);
CREATE POLICY "Story objectives are deletable by everyone" ON story_objectives FOR DELETE USING (true);

ALTER TABLE story_role_pairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Story role pairs are viewable by everyone" ON story_role_pairs;
DROP POLICY IF EXISTS "Story role pairs are insertable by everyone" ON story_role_pairs;
DROP POLICY IF EXISTS "Story role pairs are updatable by everyone" ON story_role_pairs;
DROP POLICY IF EXISTS "Story role pairs are deletable by everyone" ON story_role_pairs;
CREATE POLICY "Story role pairs are viewable by everyone" ON story_role_pairs FOR SELECT USING (true);
CREATE POLICY "Story role pairs are insertable by everyone" ON story_role_pairs FOR INSERT WITH CHECK (true);
CREATE POLICY "Story role pairs are updatable by everyone" ON story_role_pairs FOR UPDATE USING (true);
CREATE POLICY "Story role pairs are deletable by everyone" ON story_role_pairs FOR DELETE USING (true);

ALTER TABLE game_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON game_groups;
DROP POLICY IF EXISTS "Groups are insertable by everyone" ON game_groups;
DROP POLICY IF EXISTS "Groups are updatable by everyone" ON game_groups;
DROP POLICY IF EXISTS "Groups are deletable by everyone" ON game_groups;
CREATE POLICY "Groups are viewable by everyone" ON game_groups FOR SELECT USING (true);
CREATE POLICY "Groups are insertable by everyone" ON game_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Groups are updatable by everyone" ON game_groups FOR UPDATE USING (true);
CREATE POLICY "Groups are deletable by everyone" ON game_groups FOR DELETE USING (true);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON group_members;
DROP POLICY IF EXISTS "Group members are insertable by everyone" ON group_members;
DROP POLICY IF EXISTS "Group members are updatable by everyone" ON group_members;
DROP POLICY IF EXISTS "Group members are deletable by everyone" ON group_members;
CREATE POLICY "Group members are viewable by everyone" ON group_members FOR SELECT USING (true);
CREATE POLICY "Group members are insertable by everyone" ON group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Group members are updatable by everyone" ON group_members FOR UPDATE USING (true);
CREATE POLICY "Group members are deletable by everyone" ON group_members FOR DELETE USING (true);

ALTER TABLE group_story_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "History is viewable by everyone" ON group_story_history;
DROP POLICY IF EXISTS "History is insertable by everyone" ON group_story_history;
DROP POLICY IF EXISTS "History is updatable by everyone" ON group_story_history;
DROP POLICY IF EXISTS "History is deletable by everyone" ON group_story_history;
CREATE POLICY "History is viewable by everyone" ON group_story_history FOR SELECT USING (true);
CREATE POLICY "History is insertable by everyone" ON group_story_history FOR INSERT WITH CHECK (true);
CREATE POLICY "History is updatable by everyone" ON group_story_history FOR UPDATE USING (true);
CREATE POLICY "History is deletable by everyone" ON group_story_history FOR DELETE USING (true);

-- ===========================================
-- REALTIME
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'stories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE stories;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'story_roles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE story_roles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'story_objectives'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE story_objectives;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'game_groups'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE game_groups;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'group_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'group_story_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE group_story_history;
  END IF;
END $$;

-- Verifica che tutto sia stato creato
SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('stories', 'story_roles', 'story_objectives', 'story_role_pairs', 'game_groups', 'group_members', 'group_story_history');
