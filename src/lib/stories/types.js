/**
 * @typedef {Object} Story
 * @property {string} id - UUID della storia
 * @property {string} slug - Identificatore univoco (es: 'milionario')
 * @property {string} title - Titolo della storia
 * @property {string} [tagline] - Sottotitolo breve
 * @property {string} [description] - Descrizione estesa
 * @property {string} [setting] - Ambientazione (es: "Cena tra amici")
 * @property {string} [emoji] - Emoji rappresentativa
 * @property {string} [cover_image_url] - URL immagine copertina
 * @property {number} min_players - Minimo giocatori
 * @property {number} max_players - Massimo giocatori
 * @property {boolean} has_accomplice - Se ha il ruolo complice
 * @property {number} accomplice_threshold - Giocatori minimi per complice
 * @property {number} second_accomplice_threshold - Giocatori minimi per secondo complice
 * @property {boolean} is_active - Se la storia è attiva
 * @property {number} sort_order - Ordine di visualizzazione
 * @property {string} created_at - Data creazione
 */

/**
 * @typedef {'millionaire' | 'accomplice' | 'regular'} RoleType
 */

/**
 * @typedef {Object} StoryRole
 * @property {string} id - UUID del ruolo
 * @property {string} story_id - UUID della storia
 * @property {string} role_key - Chiave identificativa (es: 'detective')
 * @property {string} name - Nome visualizzato
 * @property {string} [emoji] - Emoji del ruolo
 * @property {string} [color_class] - Classe CSS per il gradiente
 * @property {string} description - Descrizione del ruolo
 * @property {RoleType} role_type - Tipo di ruolo
 * @property {string} [pair_with] - role_key del ruolo accoppiato
 * @property {Object} [scoring_rules] - Regole di punteggio custom
 * @property {number} sort_order - Ordine di visualizzazione
 * @property {StoryObjective[]} [objectives] - Obiettivi (caricati separatamente)
 */

/**
 * @typedef {'personal' | 'discovery' | 'interaction'} ObjectiveType
 */

/**
 * @typedef {'low' | 'medium' | 'high'} RiskLevel
 */

/**
 * @typedef {Object} StoryObjective
 * @property {string} id - UUID dell'obiettivo
 * @property {string} role_id - UUID del ruolo
 * @property {string} objective_key - Chiave identificativa (es: 'M_P1')
 * @property {ObjectiveType} type - Tipo di obiettivo
 * @property {string} text - Testo dell'obiettivo
 * @property {string} [hint] - Suggerimento
 * @property {number} points - Punti assegnati
 * @property {RiskLevel} [risk] - Livello di rischio
 * @property {string} [target_role] - Per discovery: role_key da scoprire
 * @property {string} [fallback_text] - Testo alternativo
 * @property {string} [requires_discovery] - objective_key di discovery richiesta
 * @property {number} sort_order - Ordine di visualizzazione
 */

/**
 * @typedef {Object} StoryRolePair
 * @property {string} id - UUID
 * @property {string} story_id - UUID della storia
 * @property {string} role_key_1 - Prima chiave ruolo
 * @property {string} role_key_2 - Seconda chiave ruolo
 * @property {number} sort_order - Ordine di priorità
 */

/**
 * @typedef {Object} GameGroup
 * @property {string} id - UUID del gruppo
 * @property {string} [name] - Nome del gruppo
 * @property {string} created_at - Data creazione
 */

/**
 * @typedef {Object} GroupMember
 * @property {string} id - UUID
 * @property {string} group_id - UUID del gruppo
 * @property {string} player_fingerprint - Hash del dispositivo
 * @property {string} [nickname] - Nickname nel gruppo
 * @property {string} joined_at - Data di ingresso
 */

/**
 * @typedef {Object} GroupStoryHistory
 * @property {string} id - UUID
 * @property {string} group_id - UUID del gruppo
 * @property {string} story_id - UUID della storia
 * @property {string} [room_id] - UUID della stanza
 * @property {string} played_at - Data della partita
 */

/**
 * @typedef {Object} StoryWithProgress
 * @property {Story} story - La storia
 * @property {boolean} played - Se il gruppo l'ha già giocata
 * @property {string} [played_at] - Quando è stata giocata
 */

/**
 * @typedef {Object} StoryWithRoles
 * @property {Story} story - La storia
 * @property {StoryRole[]} roles - Tutti i ruoli con obiettivi
 * @property {StoryRolePair[]} pairs - Coppie di ruoli
 */

/**
 * Formato ruolo per compatibilità con il sistema esistente
 * @typedef {Object} LegacyRole
 * @property {string} id - role_key
 * @property {RoleType} type - Tipo di ruolo
 * @property {string} name - Nome visualizzato
 * @property {string} emoji - Emoji
 * @property {string} color - Classe CSS colore
 * @property {string} description - Descrizione
 * @property {string} [pairWith] - role_key del partner
 * @property {Object} objectives - Obiettivi per tipo
 * @property {Array} objectives.personal - Obiettivi personali
 * @property {Array} objectives.discovery - Obiettivi di scoperta
 * @property {Array} objectives.interaction - Obiettivi di interazione
 * @property {Object} [scoring] - Regole punteggio speciali
 */

export {};
