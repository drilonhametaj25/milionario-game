// Migration script runner
// Run with: node run-migration.js

import { createClient } from '@supabase/supabase-js';
import { ROLES, ROLE_PAIRS } from './src/lib/roles.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateRolesToDatabase() {
  console.log('Starting migration of roles to database...');

  // Check if already migrated
  const { data: existing } = await supabase
    .from('stories')
    .select('slug')
    .eq('slug', 'milionario')
    .single();

  if (existing) {
    console.log('Story "milionario" already exists. Skipping migration.');
    return null;
  }

  // 1. Create the main story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      slug: 'milionario',
      title: 'Chi è il Milionario?',
      tagline: 'Qualcuno ha vinto alla lotteria...',
      description: `Uno di voi ha appena vinto 10 MILIONI DI EURO alla lotteria!
Il problema? Non riesce proprio a comportarsi da persona normale...

Riuscirete a scoprire chi è il milionario prima che finisca il pranzo?

Ogni giocatore ha un ruolo segreto con obiettivi da completare. Alcuni ruoli funzionano in coppia: scoprite il vostro partner e collaborate!`,
      setting: 'Cena tra amici',
      emoji: '💰',
      min_players: 6,
      max_players: 20,
      has_accomplice: true,
      accomplice_threshold: 12,
      second_accomplice_threshold: 16,
      is_active: true,
      sort_order: 0
    })
    .select()
    .single();

  if (storyError) {
    console.error('Error creating story:', storyError);
    throw storyError;
  }

  console.log('Created story:', story.title, '(', story.id, ')');

  // 2. Create roles
  const roleInserts = [];
  let sortOrder = 0;

  for (const [roleKey, role] of Object.entries(ROLES)) {
    roleInserts.push({
      story_id: story.id,
      role_key: roleKey,
      name: role.name,
      emoji: role.emoji,
      color_class: role.color,
      description: role.description,
      role_type: role.type,
      pair_with: role.pairWith || null,
      scoring_rules: role.scoring ? JSON.stringify(role.scoring) : null,
      sort_order: sortOrder++
    });
  }

  const { data: roles, error: rolesError } = await supabase
    .from('story_roles')
    .insert(roleInserts)
    .select();

  if (rolesError) {
    console.error('Error creating roles:', rolesError);
    throw rolesError;
  }

  console.log(`Created ${roles.length} roles`);

  // Map role_key -> role_id
  const roleIdMap = {};
  for (const role of roles) {
    roleIdMap[role.role_key] = role.id;
  }

  // 3. Create objectives
  const objectiveInserts = [];

  for (const [roleKey, role] of Object.entries(ROLES)) {
    const roleId = roleIdMap[roleKey];
    if (!roleId) continue;

    let objSortOrder = 0;

    // Personal objectives
    for (const obj of (role.objectives.personal || [])) {
      objectiveInserts.push({
        role_id: roleId,
        objective_key: obj.id,
        type: 'personal',
        text: obj.text,
        hint: obj.hint || null,
        points: obj.points,
        risk: obj.risk || 'low',
        target_role: null,
        fallback_text: null,
        requires_discovery: null,
        sort_order: objSortOrder++
      });
    }

    // Discovery objectives
    for (const obj of (role.objectives.discovery || [])) {
      objectiveInserts.push({
        role_id: roleId,
        objective_key: obj.id,
        type: 'discovery',
        text: obj.text,
        hint: obj.hint || null,
        points: obj.points,
        risk: obj.risk || 'low',
        target_role: obj.targetRole || null,
        fallback_text: obj.fallbackText || null,
        requires_discovery: null,
        sort_order: objSortOrder++
      });
    }

    // Interaction objectives
    for (const obj of (role.objectives.interaction || [])) {
      objectiveInserts.push({
        role_id: roleId,
        objective_key: obj.id,
        type: 'interaction',
        text: obj.text,
        hint: obj.hint || null,
        points: obj.points,
        risk: obj.risk || 'low',
        target_role: null,
        fallback_text: null,
        requires_discovery: obj.requiresDiscovery || null,
        sort_order: objSortOrder++
      });
    }
  }

  const { data: objectives, error: objError } = await supabase
    .from('story_objectives')
    .insert(objectiveInserts)
    .select();

  if (objError) {
    console.error('Error creating objectives:', objError);
    throw objError;
  }

  console.log(`Created ${objectives.length} objectives`);

  // 4. Create role pairs
  const pairInserts = [];
  let pairSortOrder = 0;

  for (const [role1, role2] of ROLE_PAIRS) {
    pairInserts.push({
      story_id: story.id,
      role_key_1: role1,
      role_key_2: role2,
      sort_order: pairSortOrder++
    });
  }

  const { data: pairs, error: pairsError } = await supabase
    .from('story_role_pairs')
    .insert(pairInserts)
    .select();

  if (pairsError) {
    console.error('Error creating role pairs:', pairsError);
    throw pairsError;
  }

  console.log(`Created ${pairs.length} role pairs`);

  console.log('Migration completed successfully!');

  return {
    story,
    roles,
    objectives,
    pairs
  };
}

async function createSpyStory() {
  console.log('\nCreating spy story...');

  // Check if already exists
  const { data: existing } = await supabase
    .from('stories')
    .select('slug')
    .eq('slug', 'spia-russa')
    .single();

  if (existing) {
    console.log('Story "spia-russa" already exists. Skipping.');
    return null;
  }

  // 1. Create the story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      slug: 'spia-russa',
      title: 'La Spia Russa',
      tagline: "C'è una talpa tra di noi...",
      description: `Siete tutti agenti segreti in una missione top secret.
Ma attenzione: uno di voi lavora per il nemico!

La spia deve completare i suoi obiettivi senza farsi scoprire.
Gli altri agenti devono smascherarla prima che sia troppo tardi.

Fiducia, tradimento e sotterfugi: chi vincerà?`,
      setting: 'Riunione segreta',
      emoji: '🕵️',
      min_players: 6,
      max_players: 16,
      has_accomplice: true,
      accomplice_threshold: 10,
      second_accomplice_threshold: 14,
      is_active: true,
      sort_order: 1
    })
    .select()
    .single();

  if (storyError) {
    console.error('Error creating spy story:', storyError);
    throw storyError;
  }

  console.log('Created story:', story.title);

  // 2. Create spy-specific roles
  const spyRoles = [
    {
      story_id: story.id,
      role_key: 'spy',
      name: 'La Spia',
      emoji: '🕵️',
      color_class: 'from-red-600 to-red-800',
      description: `Lavori per il nemico. La tua missione: sabotare la squadra dall'interno.

Devi sembrare un leale agente mentre raccogli informazioni sensibili.
Se vieni scoperto, la missione è fallita!`,
      role_type: 'millionaire',
      scoring_rules: JSON.stringify({ notCaught: 50, partiallyCaught: 25, caught: 0 }),
      sort_order: 0
    },
    {
      story_id: story.id,
      role_key: 'handler',
      name: "L'Handler",
      emoji: '📞',
      color_class: 'from-gray-600 to-gray-800',
      description: `Sei il contatto della spia. Devi proteggerla e aiutarla a passare informazioni.

Non farti scoprire mentre la copri!`,
      role_type: 'accomplice',
      scoring_rules: JSON.stringify({ millionaireSafe: 40, millionairePartial: 20, millionaireCaught: 0 }),
      sort_order: 1
    },
    {
      story_id: story.id,
      role_key: 'analyst',
      name: "L'Analista",
      emoji: '🔍',
      color_class: 'from-blue-500 to-blue-700',
      description: `Analizzi tutto. Ogni dettaglio. Ogni comportamento sospetto.

La verità è nei dati.`,
      role_type: 'regular',
      pair_with: 'field_agent',
      sort_order: 2
    },
    {
      story_id: story.id,
      role_key: 'field_agent',
      name: "L'Agente di Campo",
      emoji: '🎯',
      color_class: 'from-green-500 to-green-700',
      description: `Azione, non parole. Sei pronto a tutto per la missione.

Fidati del tuo istinto.`,
      role_type: 'regular',
      pair_with: 'analyst',
      sort_order: 3
    },
    {
      story_id: story.id,
      role_key: 'tech_expert',
      name: "L'Esperto Tech",
      emoji: '💻',
      color_class: 'from-cyan-500 to-cyan-700',
      description: `Nessun sistema è sicuro. Nessun codice è inviolabile.

Per te la tecnologia non ha segreti.`,
      role_type: 'regular',
      pair_with: 'old_school',
      sort_order: 4
    },
    {
      story_id: story.id,
      role_key: 'old_school',
      name: 'Il Veterano',
      emoji: '🎖️',
      color_class: 'from-amber-600 to-amber-800',
      description: `Ai tuoi tempi si faceva sul serio. Niente computer, solo istinto.

La nuova generazione ha molto da imparare.`,
      role_type: 'regular',
      pair_with: 'tech_expert',
      sort_order: 5
    }
  ];

  const { data: roles, error: rolesError } = await supabase
    .from('story_roles')
    .insert(spyRoles)
    .select();

  if (rolesError) {
    console.error('Error creating spy roles:', rolesError);
    throw rolesError;
  }

  console.log(`Created ${roles.length} spy roles`);

  // Map role_key -> role_id
  const roleIdMap = {};
  for (const role of roles) {
    roleIdMap[role.role_key] = role.id;
  }

  // 3. Create objectives
  const objectives = [
    // Spy
    { role_id: roleIdMap['spy'], objective_key: 'SPY_P1', type: 'personal', text: 'Chiedi informazioni "classificate" a qualcuno in modo naturale', points: 15, risk: 'high', sort_order: 0 },
    { role_id: roleIdMap['spy'], objective_key: 'SPY_P2', type: 'personal', text: 'Fai una "chiamata" segreta (esci per 1 minuto)', points: 10, risk: 'medium', sort_order: 1 },
    { role_id: roleIdMap['spy'], objective_key: 'SPY_P3', type: 'personal', text: 'Lancia un sospetto falso su un altro agente', points: 15, risk: 'high', sort_order: 2 },

    // Handler
    { role_id: roleIdMap['handler'], objective_key: 'HAN_P1', type: 'personal', text: "Difendi qualcuno (non la spia) quando viene accusato", points: 10, sort_order: 0 },
    { role_id: roleIdMap['handler'], objective_key: 'HAN_D1', type: 'discovery', text: "Scopri chi è l'Analista", points: 15, target_role: 'analyst', sort_order: 1 },
    { role_id: roleIdMap['handler'], objective_key: 'HAN_I1', type: 'interaction', text: "Distrailo con una conversazione di almeno 2 minuti", points: 20, requires_discovery: 'HAN_D1', sort_order: 2 },

    // Analyst
    { role_id: roleIdMap['analyst'], objective_key: 'ANA_P1', type: 'personal', text: 'Fai almeno 5 domande "indagatorie"', points: 10, sort_order: 0 },
    { role_id: roleIdMap['analyst'], objective_key: 'ANA_P2', type: 'personal', text: 'Di\' "I dati non mentono" almeno una volta', points: 10, sort_order: 1 },
    { role_id: roleIdMap['analyst'], objective_key: 'ANA_D1', type: 'discovery', text: "Scopri chi è l'Agente di Campo", points: 15, target_role: 'field_agent', sort_order: 2 },
    { role_id: roleIdMap['analyst'], objective_key: 'ANA_I1', type: 'interaction', text: 'Pianifica un\'azione insieme a lui', points: 20, requires_discovery: 'ANA_D1', sort_order: 3 },

    // Field Agent
    { role_id: roleIdMap['field_agent'], objective_key: 'FLD_P1', type: 'personal', text: 'Di\' "Meno parole, più azione" almeno una volta', points: 10, sort_order: 0 },
    { role_id: roleIdMap['field_agent'], objective_key: 'FLD_P2', type: 'personal', text: 'Alza la voce per "impartire ordini"', points: 15, sort_order: 1 },
    { role_id: roleIdMap['field_agent'], objective_key: 'FLD_D1', type: 'discovery', text: "Scopri chi è l'Analista", points: 15, target_role: 'analyst', sort_order: 2 },
    { role_id: roleIdMap['field_agent'], objective_key: 'FLD_I1', type: 'interaction', text: 'Fagli ammettere che il tuo piano è migliore', points: 20, requires_discovery: 'FLD_D1', sort_order: 3 },

    // Tech Expert
    { role_id: roleIdMap['tech_expert'], objective_key: 'TEC_P1', type: 'personal', text: 'Usa gergo tecnico incomprensibile', points: 10, sort_order: 0 },
    { role_id: roleIdMap['tech_expert'], objective_key: 'TEC_P2', type: 'personal', text: 'Di\' "Posso hackarlo" riferito a qualcosa', points: 15, sort_order: 1 },
    { role_id: roleIdMap['tech_expert'], objective_key: 'TEC_D1', type: 'discovery', text: 'Scopri chi è il Veterano', points: 15, target_role: 'old_school', sort_order: 2 },
    { role_id: roleIdMap['tech_expert'], objective_key: 'TEC_I1', type: 'interaction', text: 'Spiegagli qualcosa di tecnologico finché non sbuffa', points: 25, requires_discovery: 'TEC_D1', sort_order: 3 },

    // Old School
    { role_id: roleIdMap['old_school'], objective_key: 'OLD_P1', type: 'personal', text: 'Di\' "Ai miei tempi..." almeno una volta', points: 10, sort_order: 0 },
    { role_id: roleIdMap['old_school'], objective_key: 'OLD_P2', type: 'personal', text: 'Critica la "nuova generazione"', points: 15, sort_order: 1 },
    { role_id: roleIdMap['old_school'], objective_key: 'OLD_D1', type: 'discovery', text: "Scopri chi è l'Esperto Tech", points: 15, target_role: 'tech_expert', sort_order: 2 },
    { role_id: roleIdMap['old_school'], objective_key: 'OLD_I1', type: 'interaction', text: 'Fagli ammettere che "una volta era meglio"', points: 25, requires_discovery: 'OLD_D1', sort_order: 3 }
  ];

  const { error: objError } = await supabase
    .from('story_objectives')
    .insert(objectives);

  if (objError) {
    console.error('Error creating spy objectives:', objError);
    throw objError;
  }

  console.log(`Created ${objectives.length} spy objectives`);

  // 4. Create pairs
  const pairs = [
    { story_id: story.id, role_key_1: 'analyst', role_key_2: 'field_agent', sort_order: 0 },
    { story_id: story.id, role_key_1: 'tech_expert', role_key_2: 'old_school', sort_order: 1 }
  ];

  const { error: pairsError } = await supabase
    .from('story_role_pairs')
    .insert(pairs);

  if (pairsError) {
    console.error('Error creating spy role pairs:', pairsError);
    throw pairsError;
  }

  console.log('Created spy role pairs');

  console.log('Spy story created successfully!');
  return story;
}

// Run migrations
async function main() {
  try {
    console.log('='.repeat(50));
    console.log('MILIONARIO GAME - Database Migration');
    console.log('='.repeat(50));
    console.log();

    await migrateRolesToDatabase();
    await createSpyStory();

    console.log();
    console.log('='.repeat(50));
    console.log('All migrations completed successfully!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
