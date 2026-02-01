import { supabase } from './supabase';

// Chiavi localStorage
const STORAGE_KEYS = {
  GROUP_ID: 'milionario_group_id',
  FINGERPRINT: 'milionario_fingerprint'
};

/**
 * Genera un fingerprint semplice per il dispositivo
 * @returns {string}
 */
export function generateFingerprint() {
  // Check se esiste già
  const existing = localStorage.getItem(STORAGE_KEYS.FINGERPRINT);
  if (existing) return existing;

  // Genera nuovo fingerprint basato su caratteristiche del browser
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    Math.random().toString(36).substring(2, 15)
  ];

  const fingerprint = btoa(components.join('|')).substring(0, 32);
  localStorage.setItem(STORAGE_KEYS.FINGERPRINT, fingerprint);

  return fingerprint;
}

/**
 * Ottiene l'ID del gruppo corrente
 * @returns {string | null}
 */
export function getCurrentGroupId() {
  return localStorage.getItem(STORAGE_KEYS.GROUP_ID);
}

/**
 * Imposta il gruppo corrente
 * @param {string} groupId
 */
export function setCurrentGroupId(groupId) {
  localStorage.setItem(STORAGE_KEYS.GROUP_ID, groupId);
}

/**
 * Rimuove il gruppo corrente
 */
export function clearCurrentGroup() {
  localStorage.removeItem(STORAGE_KEYS.GROUP_ID);
}

/**
 * Crea un nuovo gruppo
 * @param {string} [name] - Nome opzionale del gruppo
 * @returns {Promise<import('./stories/types').GameGroup>}
 */
export async function createGroup(name = null) {
  const { data, error } = await supabase
    .from('game_groups')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  // Salva in localStorage
  setCurrentGroupId(data.id);

  // Aggiungi questo dispositivo come membro
  await addCurrentDeviceToGroup(data.id);

  return data;
}

/**
 * Carica un gruppo per ID
 * @param {string} groupId
 * @returns {Promise<import('./stories/types').GameGroup | null>}
 */
export async function loadGroup(groupId) {
  const { data, error } = await supabase
    .from('game_groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Non trovato
      return null;
    }
    console.error('Error loading group:', error);
    throw error;
  }

  return data;
}

/**
 * Aggiunge il dispositivo corrente a un gruppo
 * @param {string} groupId
 * @param {string} [nickname]
 * @returns {Promise<import('./stories/types').GroupMember>}
 */
export async function addCurrentDeviceToGroup(groupId, nickname = null) {
  const fingerprint = generateFingerprint();

  const { data, error } = await supabase
    .from('group_members')
    .upsert({
      group_id: groupId,
      player_fingerprint: fingerprint,
      nickname
    }, {
      onConflict: 'group_id,player_fingerprint'
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding device to group:', error);
    throw error;
  }

  return data;
}

/**
 * Verifica se il dispositivo corrente è membro di un gruppo
 * @param {string} groupId
 * @returns {Promise<boolean>}
 */
export async function isCurrentDeviceInGroup(groupId) {
  const fingerprint = generateFingerprint();

  const { data, error } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('player_fingerprint', fingerprint)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking group membership:', error);
  }

  return !!data;
}

/**
 * Carica i membri di un gruppo
 * @param {string} groupId
 * @returns {Promise<import('./stories/types').GroupMember[]>}
 */
export async function loadGroupMembers(groupId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error loading group members:', error);
    return [];
  }

  return data || [];
}

/**
 * Carica la storia delle partite di un gruppo
 * @param {string} groupId
 * @returns {Promise<import('./stories/types').GroupStoryHistory[]>}
 */
export async function loadGroupHistory(groupId) {
  const { data, error } = await supabase
    .from('group_story_history')
    .select(`
      *,
      story:stories(id, slug, title, emoji)
    `)
    .eq('group_id', groupId)
    .order('played_at', { ascending: false });

  if (error) {
    console.error('Error loading group history:', error);
    return [];
  }

  return data || [];
}

/**
 * Carica gli ID delle storie giocate da un gruppo
 * @param {string} groupId
 * @returns {Promise<string[]>}
 */
export async function loadPlayedStoryIds(groupId) {
  const { data, error } = await supabase
    .from('group_story_history')
    .select('story_id')
    .eq('group_id', groupId);

  if (error) {
    console.error('Error loading played stories:', error);
    return [];
  }

  // Ritorna ID unici
  const uniqueIds = [...new Set(data.map(d => d.story_id))];
  return uniqueIds;
}

/**
 * Registra che un gruppo ha giocato una storia
 * @param {string} groupId
 * @param {string} storyId
 * @param {string} [roomId]
 * @returns {Promise<import('./stories/types').GroupStoryHistory>}
 */
export async function recordStoryPlayed(groupId, storyId, roomId = null) {
  const { data, error } = await supabase
    .from('group_story_history')
    .insert({
      group_id: groupId,
      story_id: storyId,
      room_id: roomId
    })
    .select()
    .single();

  if (error) {
    // Ignora errori di duplicato
    if (error.code === '23505') {
      console.log('Story already recorded for this group/room');
      return null;
    }
    console.error('Error recording story played:', error);
    throw error;
  }

  return data;
}

/**
 * Verifica se un gruppo ha giocato una storia
 * @param {string} groupId
 * @param {string} storyId
 * @returns {Promise<boolean>}
 */
export async function hasGroupPlayedStory(groupId, storyId) {
  const { data, error } = await supabase
    .from('group_story_history')
    .select('id')
    .eq('group_id', groupId)
    .eq('story_id', storyId)
    .limit(1);

  if (error) {
    console.error('Error checking story history:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Aggiorna il nome del gruppo
 * @param {string} groupId
 * @param {string} name
 * @returns {Promise<import('./stories/types').GameGroup>}
 */
export async function updateGroupName(groupId, name) {
  const { data, error } = await supabase
    .from('game_groups')
    .update({ name })
    .eq('id', groupId)
    .select()
    .single();

  if (error) {
    console.error('Error updating group name:', error);
    throw error;
  }

  return data;
}

/**
 * Conta le storie disponibili e giocate per un gruppo
 * @param {string} groupId
 * @returns {Promise<{total: number, played: number}>}
 */
export async function getGroupProgress(groupId) {
  const [storiesResult, playedResult] = await Promise.all([
    supabase.from('stories').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('group_story_history').select('story_id').eq('group_id', groupId)
  ]);

  const total = storiesResult.count || 0;
  const playedIds = [...new Set((playedResult.data || []).map(d => d.story_id))];

  return {
    total,
    played: playedIds.length
  };
}

/**
 * Inizializza o recupera il gruppo corrente
 * @returns {Promise<{group: import('./stories/types').GameGroup | null, isNew: boolean}>}
 */
export async function initializeGroup() {
  const existingGroupId = getCurrentGroupId();

  if (existingGroupId) {
    const group = await loadGroup(existingGroupId);

    if (group) {
      // Verifica che il dispositivo sia membro
      const isMember = await isCurrentDeviceInGroup(existingGroupId);
      if (!isMember) {
        await addCurrentDeviceToGroup(existingGroupId);
      }
      return { group, isNew: false };
    }

    // Gruppo non esiste più, pulisci
    clearCurrentGroup();
  }

  return { group: null, isNew: true };
}

/**
 * Unisciti a un gruppo esistente tramite ID
 * @param {string} groupId
 * @returns {Promise<import('./stories/types').GameGroup | null>}
 */
export async function joinGroup(groupId) {
  const group = await loadGroup(groupId);

  if (!group) {
    return null;
  }

  setCurrentGroupId(groupId);
  await addCurrentDeviceToGroup(groupId);

  return group;
}
