import { supabase } from '../supabase';
import { ROLES, ROLE_PAIRS, assignRoles as legacyAssignRoles, calculateScores as legacyCalculateScores } from '../roles';

/**
 * Carica tutte le storie attive
 * @returns {Promise<import('./types').Story[]>}
 */
export async function loadStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error loading stories:', error);
    return [];
  }

  return data || [];
}

/**
 * Carica una storia per slug
 * @param {string} slug
 * @returns {Promise<import('./types').Story | null>}
 */
export async function loadStoryBySlug(slug) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error loading story by slug:', error);
    return null;
  }

  return data;
}

/**
 * Carica una storia per ID
 * @param {string} storyId
 * @returns {Promise<import('./types').Story | null>}
 */
export async function loadStoryById(storyId) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (error) {
    console.error('Error loading story by id:', error);
    return null;
  }

  return data;
}

/**
 * Carica i ruoli di una storia con i loro obiettivi
 * @param {string} storyId
 * @returns {Promise<import('./types').StoryRole[]>}
 */
export async function loadStoryRoles(storyId) {
  const { data: roles, error: rolesError } = await supabase
    .from('story_roles')
    .select('*')
    .eq('story_id', storyId)
    .order('sort_order', { ascending: true });

  if (rolesError) {
    console.error('Error loading story roles:', rolesError);
    return [];
  }

  if (!roles || roles.length === 0) {
    return [];
  }

  // Carica tutti gli obiettivi per questi ruoli
  const roleIds = roles.map(r => r.id);
  const { data: objectives, error: objError } = await supabase
    .from('story_objectives')
    .select('*')
    .in('role_id', roleIds)
    .order('sort_order', { ascending: true });

  if (objError) {
    console.error('Error loading objectives:', objError);
  }

  // Associa obiettivi ai ruoli
  const objectivesByRole = {};
  for (const obj of (objectives || [])) {
    if (!objectivesByRole[obj.role_id]) {
      objectivesByRole[obj.role_id] = [];
    }
    objectivesByRole[obj.role_id].push(obj);
  }

  return roles.map(role => ({
    ...role,
    objectives: objectivesByRole[role.id] || []
  }));
}

/**
 * Carica le coppie di ruoli per una storia
 * @param {string} storyId
 * @returns {Promise<import('./types').StoryRolePair[]>}
 */
export async function loadStoryRolePairs(storyId) {
  const { data, error } = await supabase
    .from('story_role_pairs')
    .select('*')
    .eq('story_id', storyId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error loading role pairs:', error);
    return [];
  }

  return data || [];
}

/**
 * Carica una storia completa con ruoli e coppie
 * @param {string} storyId
 * @returns {Promise<import('./types').StoryWithRoles | null>}
 */
export async function loadFullStory(storyId) {
  const [story, roles, pairs] = await Promise.all([
    loadStoryById(storyId),
    loadStoryRoles(storyId),
    loadStoryRolePairs(storyId)
  ]);

  if (!story) {
    return null;
  }

  return { story, roles, pairs };
}

/**
 * Converte ruoli dal database al formato legacy per compatibilità
 * @param {import('./types').StoryRole[]} storyRoles
 * @returns {Object<string, import('./types').LegacyRole>}
 */
export function convertToLegacyFormat(storyRoles) {
  const legacyRoles = {};

  for (const role of storyRoles) {
    const objectives = {
      personal: [],
      discovery: [],
      interaction: []
    };

    // Raggruppa obiettivi per tipo
    for (const obj of (role.objectives || [])) {
      const legacyObj = {
        id: obj.objective_key,
        text: obj.text,
        points: obj.points,
        hint: obj.hint,
        risk: obj.risk
      };

      if (obj.type === 'discovery') {
        legacyObj.targetRole = obj.target_role;
        legacyObj.fallbackText = obj.fallback_text;
      }

      if (obj.type === 'interaction') {
        legacyObj.requiresDiscovery = obj.requires_discovery;
      }

      objectives[obj.type]?.push(legacyObj);
    }

    // Parse scoring rules
    let scoring = null;
    if (role.scoring_rules) {
      scoring = typeof role.scoring_rules === 'string'
        ? JSON.parse(role.scoring_rules)
        : role.scoring_rules;
    }

    legacyRoles[role.role_key] = {
      id: role.role_key,
      type: role.role_type,
      name: role.name,
      emoji: role.emoji || '',
      color: role.color_class || '',
      description: role.description,
      pairWith: role.pair_with,
      objectives,
      ...(scoring && { scoring })
    };
  }

  return legacyRoles;
}

/**
 * Converte coppie dal database al formato array
 * @param {import('./types').StoryRolePair[]} pairs
 * @returns {Array<[string, string]>}
 */
export function convertPairsToLegacyFormat(pairs) {
  return pairs.map(p => [p.role_key_1, p.role_key_2]);
}

/**
 * Assegna ruoli ai giocatori usando i ruoli dal database
 * @param {string[]} playerIds - Array di UUID giocatori
 * @param {import('./types').StoryRole[]} storyRoles - Ruoli della storia
 * @param {import('./types').StoryRolePair[]} pairs - Coppie di ruoli
 * @param {boolean} useAccomplice - Se usare il complice
 * @param {number} accompliceThreshold - Soglia per primo complice
 * @param {number} secondAccompliceThreshold - Soglia per secondo complice
 * @returns {Object<string, string>} - Mappa playerId -> role_key
 */
export function assignRolesFromStory(
  playerIds,
  storyRoles,
  pairs,
  useAccomplice = true,
  accompliceThreshold = 12,
  secondAccompliceThreshold = 16
) {
  const numPlayers = playerIds.length;
  const shuffledPlayers = [...playerIds].sort(() => Math.random() - 0.5);

  const assignments = {};
  let roleIndex = 0;

  // Trova il ruolo principale (millionaire/target)
  const mainRole = storyRoles.find(r => r.role_type === 'millionaire');
  const accompliceRole = storyRoles.find(r => r.role_type === 'accomplice');
  const regularRoles = storyRoles.filter(r => r.role_type === 'regular');

  // 1. Assegna ruolo principale (sempre)
  if (mainRole) {
    assignments[shuffledPlayers[roleIndex++]] = mainRole.role_key;
  }

  // 2. Assegna complice (se abilitato e abbastanza giocatori)
  const useAccompliceRole = useAccomplice && accompliceRole && numPlayers >= accompliceThreshold;
  if (useAccompliceRole) {
    assignments[shuffledPlayers[roleIndex++]] = accompliceRole.role_key;

    // Secondo complice per partite grandi
    if (numPlayers >= secondAccompliceThreshold) {
      assignments[shuffledPlayers[roleIndex++]] = accompliceRole.role_key;
    }
  }

  // 3. Prepara ruoli regolari (prioritizzando le coppie)
  const regularRoleKeys = [];
  const usedRoles = new Set();

  // Prima aggiungi coppie complete
  const rolePairs = pairs.length > 0
    ? pairs.map(p => [p.role_key_1, p.role_key_2])
    : regularRoles
        .filter(r => r.pair_with)
        .map(r => [r.role_key, r.pair_with])
        .filter((pair, index, self) =>
          self.findIndex(p =>
            (p[0] === pair[0] && p[1] === pair[1]) ||
            (p[0] === pair[1] && p[1] === pair[0])
          ) === index
        );

  for (const [role1, role2] of rolePairs) {
    if (!usedRoles.has(role1) && !usedRoles.has(role2)) {
      // Verifica che entrambi i ruoli esistano
      const hasRole1 = regularRoles.some(r => r.role_key === role1);
      const hasRole2 = regularRoles.some(r => r.role_key === role2);

      if (hasRole1 && hasRole2) {
        regularRoleKeys.push(role1, role2);
        usedRoles.add(role1);
        usedRoles.add(role2);
      }
    }
    if (regularRoleKeys.length >= numPlayers - roleIndex) break;
  }

  // Aggiungi ruoli singoli se necessario
  for (const role of regularRoles) {
    if (!usedRoles.has(role.role_key) && regularRoleKeys.length < numPlayers - roleIndex) {
      regularRoleKeys.push(role.role_key);
      usedRoles.add(role.role_key);
    }
  }

  // Mescola ruoli regolari
  regularRoleKeys.sort(() => Math.random() - 0.5);

  // 4. Assegna ruoli regolari ai giocatori rimanenti
  for (let i = roleIndex; i < numPlayers; i++) {
    const role = regularRoleKeys[i - roleIndex];
    if (role) {
      assignments[shuffledPlayers[i]] = role;
    }
  }

  return assignments;
}

/**
 * Calcola punteggi usando ruoli dal database
 * @param {Array} players - Giocatori con role_id e objectives_status
 * @param {Array} votes - Voti espressi
 * @param {Object} rolesMap - Mappa role_key -> LegacyRole
 * @param {Array} validations - Validazioni obiettivi (opzionale)
 * @returns {Object<string, number>} - Mappa playerId -> punteggio
 */
export function calculateScoresFromStory(players, votes, rolesMap, validations = null) {
  const scores = {};

  // Trova millionaire
  const millionaire = players.find(p => rolesMap[p.role_id]?.type === 'millionaire');
  const accomplices = players.filter(p => rolesMap[p.role_id]?.type === 'accomplice');

  // Conta voti per millionaire
  const votesForMillionaire = votes.filter(v => v.vote_target_id === millionaire?.id).length;
  const totalVoters = votes.length;
  const votePercentage = totalVoters > 0 ? (votesForMillionaire / totalVoters) * 100 : 0;

  for (const player of players) {
    let score = 0;
    const role = rolesMap[player.role_id];

    if (!role) continue;

    // 1. Punti per obiettivi completati
    const objectives = [
      ...(role.objectives.personal || []),
      ...(role.objectives.discovery || []),
      ...(role.objectives.interaction || [])
    ];

    for (const obj of objectives) {
      let isCompleted = false;

      // Usa validazioni se disponibili
      if (validations && validations.length > 0) {
        const objValidations = validations.filter(
          v => v.target_player_id === player.id && v.objective_id === obj.id
        );

        if (objValidations.length > 0) {
          const approvals = objValidations.filter(v => v.approved).length;
          isCompleted = approvals > objValidations.length / 2;
        }
      } else {
        const status = player.objectives_status?.[obj.id];
        isCompleted = status?.completed || false;
      }

      if (isCompleted) {
        score += obj.points;

        // Bonus per discovery corretta
        const status = player.objectives_status?.[obj.id];
        if (obj.targetRole && status?.tagged_player_id) {
          const taggedPlayer = players.find(p => p.id === status.tagged_player_id);
          if (taggedPlayer?.role_id === obj.targetRole) {
            score += 10;
          }
        }
      }
    }

    // 2. Punteggio speciale per ruoli
    if (role.type === 'millionaire' && role.scoring) {
      if (votePercentage < 40) {
        score += role.scoring.notCaught || 0;
      } else if (votePercentage <= 60) {
        score += role.scoring.partiallyCaught || 0;
      }
    } else if (role.type === 'accomplice' && role.scoring) {
      if (votePercentage < 40) {
        score += role.scoring.millionaireSafe || 0;
      } else if (votePercentage <= 60) {
        score += role.scoring.millionairePartial || 0;
      }
    } else {
      // Altri giocatori: bonus se hanno votato millionaire
      const playerVote = votes.find(v => v.player_id === player.id);
      if (playerVote?.vote_target_id === millionaire?.id) {
        score += 25;
      }
    }

    scores[player.id] = score;
  }

  return scores;
}

/**
 * Ottiene un ruolo dal database o dal fallback
 * @param {string} roleKey - Chiave del ruolo
 * @param {Object} rolesMap - Mappa ruoli (opzionale)
 * @returns {import('./types').LegacyRole | null}
 */
export function getRoleFromStory(roleKey, rolesMap = null) {
  if (rolesMap && rolesMap[roleKey]) {
    return rolesMap[roleKey];
  }
  // Fallback ai ruoli hardcoded
  return ROLES[roleKey] || null;
}

/**
 * Wrapper per usare ruoli hardcoded come fallback
 * @param {string[]} playerIds
 * @param {boolean} useAccomplice
 * @returns {Object<string, string>}
 */
export function assignRolesWithFallback(playerIds, useAccomplice = true) {
  return legacyAssignRoles(playerIds, useAccomplice);
}

/**
 * Wrapper per calcolare punteggi con fallback
 * @param {Array} players
 * @param {Array} votes
 * @param {Array} validations
 * @returns {Object<string, number>}
 */
export function calculateScoresWithFallback(players, votes, validations = null) {
  return legacyCalculateScores(players, votes, validations);
}
