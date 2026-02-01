-- ===========================================
-- CHI È IL MILIONARIO? - Database Schema
-- Esegui questo su Supabase SQL Editor
-- ===========================================

-- Abilita UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABELLA: rooms
-- ===========================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'voting', 'reveal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  voting_started_at TIMESTAMPTZ,
  player_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{"timer_minutes": null, "use_accomplice": true}'::jsonb
);

-- Index per ricerca veloce per codice
CREATE INDEX idx_rooms_code ON rooms(code);

-- ===========================================
-- TABELLA: players
-- ===========================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(30) NOT NULL,
  avatar_emoji VARCHAR(10) DEFAULT '😀',
  role_id VARCHAR(50), -- null fino a quando il gioco inizia
  is_host BOOLEAN DEFAULT FALSE,
  is_connected BOOLEAN DEFAULT TRUE,

  -- Stato obiettivi (JSONB per flessibilità)
  objectives_status JSONB DEFAULT '{}'::jsonb,
  -- Formato: { "OBJ_ID": { "completed": true/false, "tagged_player_id": "uuid" } }

  -- Votazione
  has_voted BOOLEAN DEFAULT FALSE,
  vote_target_id UUID REFERENCES players(id),

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: nickname unico per room
  UNIQUE(room_id, nickname)
);

-- Index per query frequenti
CREATE INDEX idx_players_room ON players(room_id);

-- ===========================================
-- FUNZIONI HELPER
-- ===========================================

-- Genera codice room casuale di 6 caratteri
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Escludo 0,O,1,I per leggibilità
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Aggiorna player_count quando cambiano i giocatori
CREATE OR REPLACE FUNCTION update_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rooms SET player_count = player_count + 1 WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rooms SET player_count = player_count - 1 WHERE id = OLD.room_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_count
AFTER INSERT OR DELETE ON players
FOR EACH ROW EXECUTE FUNCTION update_player_count();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy permissive per semplicità (gioco pubblico)
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Rooms are insertable by everyone" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Rooms are updatable by everyone" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Rooms are deletable by everyone" ON rooms FOR DELETE USING (true);

CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Players are insertable by everyone" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players are updatable by everyone" ON players FOR UPDATE USING (true);
CREATE POLICY "Players are deletable by everyone" ON players FOR DELETE USING (true);

-- ===========================================
-- ABILITA REALTIME
-- ===========================================
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- ===========================================
-- AGGIORNAMENTI PER VALIDAZIONE OBIETTIVI
-- ===========================================

-- Aggiungere nuovo status 'validating'
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_status_check
  CHECK (status IN ('lobby', 'playing', 'voting', 'validating', 'reveal'));

-- Colonne per tracking validazione
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS validation_player_index INTEGER DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS validation_objective_index INTEGER DEFAULT 0;

-- Tabella per voti validazione obiettivi
CREATE TABLE IF NOT EXISTS objective_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  target_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  objective_id VARCHAR(50) NOT NULL,
  voter_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, target_player_id, objective_id, voter_player_id)
);

-- Index per query frequenti
CREATE INDEX IF NOT EXISTS idx_validations_room ON objective_validations(room_id);
CREATE INDEX IF NOT EXISTS idx_validations_target ON objective_validations(target_player_id);

-- RLS per validazioni
ALTER TABLE objective_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Validations are viewable by everyone" ON objective_validations FOR SELECT USING (true);
CREATE POLICY "Validations are insertable by everyone" ON objective_validations FOR INSERT WITH CHECK (true);
CREATE POLICY "Validations are updatable by everyone" ON objective_validations FOR UPDATE USING (true);
CREATE POLICY "Validations are deletable by everyone" ON objective_validations FOR DELETE USING (true);

-- Abilita realtime per validazioni
ALTER PUBLICATION supabase_realtime ADD TABLE objective_validations;

-- ===========================================
-- SISTEMA MULTI-STORIA CON TRACKING
-- ===========================================

-- Tabella storie
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,              -- 'milionario', 'spia-russa'
  title VARCHAR(100) NOT NULL,                   -- "Chi è il Milionario?"
  tagline VARCHAR(200),                          -- "Qualcuno ha vinto alla lotteria..."
  description TEXT,                              -- Descrizione lunga per la selezione
  setting VARCHAR(200),                          -- "Cena tra amici"
  emoji VARCHAR(10),                             -- 💰
  cover_image_url TEXT,                          -- Immagine copertina (opzionale)
  min_players INTEGER DEFAULT 6,
  max_players INTEGER DEFAULT 20,
  has_accomplice BOOLEAN DEFAULT true,           -- Ha ruolo accolito?
  accomplice_threshold INTEGER DEFAULT 12,       -- Giocatori minimi per accolito
  second_accomplice_threshold INTEGER DEFAULT 16,-- Giocatori minimi per secondo accolito
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per ordinamento e ricerca
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active, sort_order);

-- Ruoli per ogni storia
CREATE TABLE IF NOT EXISTS story_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  role_key VARCHAR(50) NOT NULL,                 -- 'millionaire', 'detective'
  name VARCHAR(50) NOT NULL,                     -- "Il Milionario"
  emoji VARCHAR(10),
  color_class VARCHAR(50),                       -- 'from-yellow-400 to-amber-500'
  description TEXT NOT NULL,                     -- Testo narrativo
  role_type VARCHAR(20) DEFAULT 'regular',       -- 'millionaire', 'accomplice', 'regular'
  pair_with VARCHAR(50),                         -- role_key del ruolo accoppiato
  scoring_rules JSONB,                           -- Regole punteggio custom
  sort_order INTEGER DEFAULT 0,
  UNIQUE(story_id, role_key)
);

-- Indici per ruoli
CREATE INDEX IF NOT EXISTS idx_story_roles_story ON story_roles(story_id);
CREATE INDEX IF NOT EXISTS idx_story_roles_key ON story_roles(story_id, role_key);

-- Obiettivi per ogni ruolo
CREATE TABLE IF NOT EXISTS story_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES story_roles(id) ON DELETE CASCADE,
  objective_key VARCHAR(50) NOT NULL,            -- 'M_P1', 'DET_D1'
  type VARCHAR(20) NOT NULL,                     -- 'personal', 'discovery', 'interaction'
  text TEXT NOT NULL,
  hint TEXT,
  points INTEGER DEFAULT 10,
  risk VARCHAR(20) DEFAULT 'low',                -- 'low', 'medium', 'high'
  target_role VARCHAR(50),                       -- Per discovery: role_key da scoprire
  fallback_text TEXT,                            -- Testo alternativo se ruolo non presente
  requires_discovery VARCHAR(50),                -- objective_key di discovery richiesta
  sort_order INTEGER DEFAULT 0,
  UNIQUE(role_id, objective_key)
);

-- Indici per obiettivi
CREATE INDEX IF NOT EXISTS idx_story_objectives_role ON story_objectives(role_id);
CREATE INDEX IF NOT EXISTS idx_story_objectives_type ON story_objectives(role_id, type);

-- Coppie di ruoli (per mantenere le coppie in ordine)
CREATE TABLE IF NOT EXISTS story_role_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  role_key_1 VARCHAR(50) NOT NULL,
  role_key_2 VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(story_id, role_key_1, role_key_2)
);

CREATE INDEX IF NOT EXISTS idx_story_role_pairs_story ON story_role_pairs(story_id);

-- ===========================================
-- GRUPPI DI GIOCO E TRACKING
-- ===========================================

-- Gruppi di gioco (per tracking)
CREATE TABLE IF NOT EXISTS game_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),                             -- "Gruppo Pizza Venerdì"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Associazione giocatori a gruppi
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES game_groups(id) ON DELETE CASCADE,
  player_fingerprint VARCHAR(100),               -- Hash browser/device per identificare
  nickname VARCHAR(30),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, player_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_fingerprint ON group_members(player_fingerprint);

-- Storie completate per gruppo
CREATE TABLE IF NOT EXISTS group_story_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES game_groups(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id),             -- Collegamento alla partita
  played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, story_id, room_id)
);

CREATE INDEX IF NOT EXISTS idx_group_history_group ON group_story_history(group_id);
CREATE INDEX IF NOT EXISTS idx_group_history_story ON group_story_history(story_id);

-- ===========================================
-- MODIFICHE TABELLA ROOMS
-- ===========================================

-- Aggiungere colonne per storia e gruppo
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES stories(id);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES game_groups(id);

CREATE INDEX IF NOT EXISTS idx_rooms_story ON rooms(story_id);
CREATE INDEX IF NOT EXISTS idx_rooms_group ON rooms(group_id);

-- ===========================================
-- RLS POLICIES PER NUOVE TABELLE
-- ===========================================

-- Stories: leggibili da tutti
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stories are viewable by everyone" ON stories FOR SELECT USING (true);
CREATE POLICY "Stories are insertable by everyone" ON stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Stories are updatable by everyone" ON stories FOR UPDATE USING (true);
CREATE POLICY "Stories are deletable by everyone" ON stories FOR DELETE USING (true);

-- Story roles: leggibili da tutti
ALTER TABLE story_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Story roles are viewable by everyone" ON story_roles FOR SELECT USING (true);
CREATE POLICY "Story roles are insertable by everyone" ON story_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Story roles are updatable by everyone" ON story_roles FOR UPDATE USING (true);
CREATE POLICY "Story roles are deletable by everyone" ON story_roles FOR DELETE USING (true);

-- Story objectives: leggibili da tutti
ALTER TABLE story_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Story objectives are viewable by everyone" ON story_objectives FOR SELECT USING (true);
CREATE POLICY "Story objectives are insertable by everyone" ON story_objectives FOR INSERT WITH CHECK (true);
CREATE POLICY "Story objectives are updatable by everyone" ON story_objectives FOR UPDATE USING (true);
CREATE POLICY "Story objectives are deletable by everyone" ON story_objectives FOR DELETE USING (true);

-- Story role pairs: leggibili da tutti
ALTER TABLE story_role_pairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Story role pairs are viewable by everyone" ON story_role_pairs FOR SELECT USING (true);
CREATE POLICY "Story role pairs are insertable by everyone" ON story_role_pairs FOR INSERT WITH CHECK (true);
CREATE POLICY "Story role pairs are updatable by everyone" ON story_role_pairs FOR UPDATE USING (true);
CREATE POLICY "Story role pairs are deletable by everyone" ON story_role_pairs FOR DELETE USING (true);

-- Groups: CRUD per tutti
ALTER TABLE game_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are viewable by everyone" ON game_groups FOR SELECT USING (true);
CREATE POLICY "Groups are insertable by everyone" ON game_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Groups are updatable by everyone" ON game_groups FOR UPDATE USING (true);
CREATE POLICY "Groups are deletable by everyone" ON game_groups FOR DELETE USING (true);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members are viewable by everyone" ON group_members FOR SELECT USING (true);
CREATE POLICY "Group members are insertable by everyone" ON group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Group members are updatable by everyone" ON group_members FOR UPDATE USING (true);
CREATE POLICY "Group members are deletable by everyone" ON group_members FOR DELETE USING (true);

ALTER TABLE group_story_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "History is viewable by everyone" ON group_story_history FOR SELECT USING (true);
CREATE POLICY "History is insertable by everyone" ON group_story_history FOR INSERT WITH CHECK (true);
CREATE POLICY "History is updatable by everyone" ON group_story_history FOR UPDATE USING (true);
CREATE POLICY "History is deletable by everyone" ON group_story_history FOR DELETE USING (true);

-- ===========================================
-- REALTIME PER NUOVE TABELLE
-- ===========================================

ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE story_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE story_objectives;
ALTER PUBLICATION supabase_realtime ADD TABLE game_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE group_story_history;
