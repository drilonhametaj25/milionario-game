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
