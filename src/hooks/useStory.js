import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  loadStoryById,
  loadStoryBySlug,
  loadFullStory,
  convertToLegacyFormat,
  convertPairsToLegacyFormat
} from '../lib/stories';
import { ROLES, ROLE_PAIRS } from '../lib/roles';

/**
 * Hook per caricare una singola storia con i suoi ruoli e obiettivi
 * @param {string} storyIdOrSlug - ID o slug della storia
 * @returns {{
 *   story: import('../lib/stories/types').Story | null,
 *   roles: import('../lib/stories/types').StoryRole[],
 *   pairs: import('../lib/stories/types').StoryRolePair[],
 *   rolesMap: Object<string, import('../lib/stories/types').LegacyRole>,
 *   pairsArray: Array<[string, string]>,
 *   loading: boolean,
 *   error: Error | null,
 *   refresh: () => Promise<void>,
 *   getRole: (roleKey: string) => import('../lib/stories/types').LegacyRole | null,
 *   useFallback: boolean
 * }}
 */
export function useStory(storyIdOrSlug) {
  const [story, setStory] = useState(null);
  const [roles, setRoles] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  const loadData = useCallback(async () => {
    if (!storyIdOrSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prova a caricare per ID prima, poi per slug
      let storyData = null;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storyIdOrSlug);

      if (isUUID) {
        const fullStory = await loadFullStory(storyIdOrSlug);
        if (fullStory) {
          storyData = fullStory;
        }
      } else {
        const storyBySlug = await loadStoryBySlug(storyIdOrSlug);
        if (storyBySlug) {
          const fullStory = await loadFullStory(storyBySlug.id);
          storyData = fullStory;
        }
      }

      if (storyData) {
        setStory(storyData.story);
        setRoles(storyData.roles);
        setPairs(storyData.pairs);
        setUseFallback(false);
      } else {
        // Fallback ai ruoli hardcoded se non trovata nel database
        // Questo permette al gioco di funzionare anche senza migrazione
        console.warn('Story not found in database, using fallback roles');
        setStory({
          id: 'fallback',
          slug: 'milionario',
          title: 'Chi è il Milionario?',
          emoji: '💰',
          tagline: 'Qualcuno ha vinto alla lotteria...',
          min_players: 6,
          max_players: 20,
          has_accomplice: true,
          accomplice_threshold: 12,
          second_accomplice_threshold: 16
        });
        setRoles([]);
        setPairs([]);
        setUseFallback(true);
      }
    } catch (err) {
      console.error('Error loading story:', err);
      setError(err);
      setUseFallback(true);
    } finally {
      setLoading(false);
    }
  }, [storyIdOrSlug]);

  // Carica dati iniziali
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Converti ruoli in formato legacy per compatibilità
  const rolesMap = useMemo(() => {
    if (useFallback || roles.length === 0) {
      return ROLES;
    }
    return convertToLegacyFormat(roles);
  }, [roles, useFallback]);

  // Converti coppie in formato array
  const pairsArray = useMemo(() => {
    if (useFallback || pairs.length === 0) {
      return ROLE_PAIRS;
    }
    return convertPairsToLegacyFormat(pairs);
  }, [pairs, useFallback]);

  // Helper per ottenere un ruolo
  const getRole = useCallback((roleKey) => {
    return rolesMap[roleKey] || ROLES[roleKey] || null;
  }, [rolesMap]);

  return {
    story,
    roles,
    pairs,
    rolesMap,
    pairsArray,
    loading,
    error,
    refresh: loadData,
    getRole,
    useFallback
  };
}

/**
 * Hook per usare i ruoli con fallback automatico
 * Usa ruoli dal database se disponibili, altrimenti usa roles.js
 * @param {string} [storyId] - ID della storia (opzionale)
 * @returns {{
 *   rolesMap: Object<string, import('../lib/stories/types').LegacyRole>,
 *   pairsArray: Array<[string, string]>,
 *   getRole: (roleKey: string) => import('../lib/stories/types').LegacyRole | null,
 *   loading: boolean
 * }}
 */
export function useRolesWithFallback(storyId = null) {
  const { rolesMap, pairsArray, getRole, loading, useFallback } = useStory(storyId);

  // Se non c'è storyId o stiamo usando fallback, ritorna direttamente ROLES
  if (!storyId || useFallback) {
    return {
      rolesMap: ROLES,
      pairsArray: ROLE_PAIRS,
      getRole: (roleKey) => ROLES[roleKey] || null,
      loading: false
    };
  }

  return {
    rolesMap,
    pairsArray,
    getRole,
    loading
  };
}

/**
 * Hook per ottenere le informazioni della storia corrente dalla room
 * @param {Object} room - Room object con story_id
 * @returns {{
 *   story: import('../lib/stories/types').Story | null,
 *   rolesMap: Object,
 *   loading: boolean
 * }}
 */
export function useRoomStory(room) {
  const storyId = room?.story_id || null;
  const { story, rolesMap, pairsArray, loading, getRole, useFallback } = useStory(storyId);

  return {
    story,
    rolesMap,
    pairsArray,
    loading,
    getRole,
    useFallback,
    // Se non c'è story_id nella room, usa sempre il fallback
    hasStory: !!storyId && !useFallback
  };
}

export default useStory;
