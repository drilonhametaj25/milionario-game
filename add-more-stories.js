// Script per aggiungere altre 8 storie
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEW_STORIES = [
  // 3. L'Alieno
  {
    story: {
      slug: 'alieno',
      title: "L'Alieno",
      tagline: 'Qualcuno non è di questo mondo...',
      description: `Uno di voi è un alieno che sta studiando il comportamento umano!

Deve mimetizzarsi ma ogni tanto sbaglia qualche convenzione sociale...

Gli altri devono scoprire chi è il visitatore extraterrestre!`,
      setting: 'Festa di compleanno',
      emoji: '👽',
      min_players: 6,
      max_players: 16,
      accomplice_threshold: 10,
    },
    mainRole: {
      role_key: 'alien',
      name: "L'Alieno",
      emoji: '👽',
      color_class: 'from-green-400 to-teal-600',
      description: `Vieni da un altro pianeta e stai studiando gli umani.

Il problema? Non conosci bene le loro usanze...

Cerca di sembrare normale mentre completi la tua missione di ricerca!`,
      objectives: [
        { key: 'ALN_P1', type: 'personal', text: 'Chiedi spiegazioni su qualcosa di ovvio ("Perché mangiate con le forchette?")', points: 15, risk: 'high' },
        { key: 'ALN_P2', type: 'personal', text: 'Usa una parola inventata come se fosse normale', points: 15, risk: 'medium' },
        { key: 'ALN_P3', type: 'personal', text: 'Annusa il cibo in modo esagerato prima di mangiarlo', points: 10, risk: 'medium' },
        { key: 'ALN_P4', type: 'personal', text: 'Di\' "Sul mio piane... cioè, nel mio paese..."', points: 20, risk: 'high' },
      ]
    },
    accompliceRole: {
      role_key: 'alien_friend',
      name: "L'Amico Alieno",
      emoji: '🛸',
      color_class: 'from-purple-500 to-indigo-700',
      description: `Sai che il tuo amico è un alieno e lo stai aiutando a integrarsi.

Copri i suoi errori e distraili quando sbaglia!`,
      objectives: [
        { key: 'ALF_P1', type: 'personal', text: 'Giustifica un comportamento strano dell\'alieno ("È una cosa del suo paese")', points: 15 },
        { key: 'ALF_D1', type: 'discovery', text: 'Scopri chi è lo Scienziato', points: 15, target_role: 'scientist' },
        { key: 'ALF_I1', type: 'interaction', text: 'Distrailo quando l\'alieno fa qualcosa di strano', points: 20, requires_discovery: 'ALF_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'scientist',
        name: 'Lo Scienziato',
        emoji: '🔬',
        color_class: 'from-blue-400 to-blue-600',
        pair_with: 'conspiracy_guy',
        description: 'Credi che gli alieni esistano e stasera potresti avere ragione!',
        objectives: [
          { key: 'SCI_P1', type: 'personal', text: 'Parla di "fenomeni inspiegabili" o "avvistamenti"', points: 10 },
          { key: 'SCI_P2', type: 'personal', text: 'Osserva qualcuno e prendi appunti (veri o finti)', points: 15 },
          { key: 'SCI_D1', type: 'discovery', text: 'Scopri chi è il Complottista', points: 15, target_role: 'conspiracy_guy' },
          { key: 'SCI_I1', type: 'interaction', text: 'Discuti con lui di teorie aliene', points: 20, requires_discovery: 'SCI_D1' },
        ]
      },
      {
        role_key: 'conspiracy_guy',
        name: 'Il Complottista',
        emoji: '📡',
        color_class: 'from-orange-500 to-red-600',
        pair_with: 'scientist',
        description: 'Gli alieni sono già tra noi! E tu lo sai!',
        objectives: [
          { key: 'CON_P1', type: 'personal', text: 'Di\' "Loro ci osservano" con aria seria', points: 15 },
          { key: 'CON_P2', type: 'personal', text: 'Accusa qualcuno di essere "troppo normale"', points: 15 },
          { key: 'CON_D1', type: 'discovery', text: 'Scopri chi è lo Scienziato', points: 15, target_role: 'scientist' },
          { key: 'CON_I1', type: 'interaction', text: 'Convincilo che hai ragione sugli alieni', points: 20, requires_discovery: 'CON_D1' },
        ]
      },
      {
        role_key: 'skeptic_alien',
        name: 'Lo Scettico',
        emoji: '🙄',
        color_class: 'from-gray-400 to-gray-600',
        pair_with: 'believer',
        description: 'Alieni? Ma per favore. Sei qui per smontare queste teorie assurde.',
        objectives: [
          { key: 'SKE_P1', type: 'personal', text: 'Di\' "Ma dai, non esiste" almeno 2 volte', points: 10 },
          { key: 'SKE_P2', type: 'personal', text: 'Ridi di qualcuno che dice qualcosa di strano', points: 15 },
          { key: 'SKE_D1', type: 'discovery', text: 'Scopri chi è il Credente', points: 15, target_role: 'believer' },
          { key: 'SKE_I1', type: 'interaction', text: 'Fallo dubitare delle sue credenze', points: 20, requires_discovery: 'SKE_D1' },
        ]
      },
      {
        role_key: 'believer',
        name: 'Il Credente',
        emoji: '✨',
        color_class: 'from-yellow-400 to-orange-500',
        pair_with: 'skeptic_alien',
        description: 'Vuoi credere! Sei aperto a tutto e stasera potresti avere la prova!',
        objectives: [
          { key: 'BEL_P1', type: 'personal', text: 'Di\' "Io ci credo" con convinzione', points: 10 },
          { key: 'BEL_P2', type: 'personal', text: 'Interpreta qualcosa di normale come "un segno"', points: 15 },
          { key: 'BEL_D1', type: 'discovery', text: 'Scopri chi è lo Scettico', points: 15, target_role: 'skeptic_alien' },
          { key: 'BEL_I1', type: 'interaction', text: 'Racconta una storia paranormale finché non reagisce', points: 20, requires_discovery: 'BEL_D1' },
        ]
      },
    ]
  },

  // 4. Il Viaggiatore del Tempo
  {
    story: {
      slug: 'viaggiatore-tempo',
      title: 'Il Viaggiatore del Tempo',
      tagline: 'Qualcuno viene dal futuro...',
      description: `Uno di voi viene dall'anno 2124!

È qui per studiare il passato ma ogni tanto si lascia sfuggire dettagli sul futuro...

Riuscirete a capire chi conosce già quello che succederà?`,
      setting: 'Cena di capodanno',
      emoji: '⏰',
      min_players: 6,
      max_players: 16,
      accomplice_threshold: 10,
    },
    mainRole: {
      role_key: 'time_traveler',
      name: 'Il Viaggiatore',
      emoji: '⏰',
      color_class: 'from-blue-500 to-purple-600',
      description: `Vieni dal 2124 e stai osservando il passato.

Il problema? Ogni tanto dimentichi in che anno sei...`,
      objectives: [
        { key: 'TIM_P1', type: 'personal', text: 'Di\' "Ah giusto, questo non esiste ancora... cioè, non è famoso"', points: 20, risk: 'high' },
        { key: 'TIM_P2', type: 'personal', text: 'Fingi di non conoscere qualcosa di attuale ("Cos\'è TikTok?")', points: 15, risk: 'medium' },
        { key: 'TIM_P3', type: 'personal', text: 'Predici qualcosa che "succederà" (inventa)', points: 15, risk: 'medium' },
        { key: 'TIM_P4', type: 'personal', text: 'Usa un\'espressione inventata come slang del futuro', points: 10, risk: 'low' },
      ]
    },
    accompliceRole: {
      role_key: 'time_agent',
      name: "L'Agente Temporale",
      emoji: '🕰️',
      color_class: 'from-indigo-500 to-purple-700',
      description: `Sei stato mandato per proteggere il viaggiatore.

Assicurati che non riveli troppo sul futuro!`,
      objectives: [
        { key: 'TAG_P1', type: 'personal', text: 'Cambia argomento quando il viaggiatore sta per sbagliare', points: 15 },
        { key: 'TAG_D1', type: 'discovery', text: 'Scopri chi è lo Storico', points: 15, target_role: 'historian' },
        { key: 'TAG_I1', type: 'interaction', text: 'Distrailo con domande sul passato', points: 20, requires_discovery: 'TAG_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'historian',
        name: 'Lo Storico',
        emoji: '📚',
        color_class: 'from-amber-600 to-amber-800',
        pair_with: 'futurist',
        description: 'Ami la storia e noti quando qualcuno la racconta male!',
        objectives: [
          { key: 'HIS_P1', type: 'personal', text: 'Correggi qualcuno su un fatto storico', points: 10 },
          { key: 'HIS_P2', type: 'personal', text: 'Di\' "In realtà, storicamente..."', points: 15 },
          { key: 'HIS_D1', type: 'discovery', text: 'Scopri chi è il Futurista', points: 15, target_role: 'futurist' },
          { key: 'HIS_I1', type: 'interaction', text: 'Dibattito: passato vs futuro', points: 20, requires_discovery: 'HIS_D1' },
        ]
      },
      {
        role_key: 'futurist',
        name: 'Il Futurista',
        emoji: '🚀',
        color_class: 'from-cyan-400 to-blue-600',
        pair_with: 'historian',
        description: 'Sei ossessionato dal futuro e dalla tecnologia!',
        objectives: [
          { key: 'FUT_P1', type: 'personal', text: 'Parla di come sarà il mondo tra 100 anni', points: 10 },
          { key: 'FUT_P2', type: 'personal', text: 'Di\' "Nel futuro avremo..."', points: 15 },
          { key: 'FUT_D1', type: 'discovery', text: 'Scopri chi è lo Storico', points: 15, target_role: 'historian' },
          { key: 'FUT_I1', type: 'interaction', text: 'Convincilo che il futuro è meglio del passato', points: 20, requires_discovery: 'FUT_D1' },
        ]
      },
      {
        role_key: 'nostalgic',
        name: 'Il Nostalgico',
        emoji: '📼',
        color_class: 'from-pink-400 to-rose-600',
        pair_with: 'modernist',
        description: 'Tutto era meglio prima! I bei vecchi tempi...',
        objectives: [
          { key: 'NOS_P1', type: 'personal', text: 'Di\' "Una volta era meglio" almeno 2 volte', points: 10 },
          { key: 'NOS_P2', type: 'personal', text: 'Racconta di quando eri giovane (anche se non è vero)', points: 15 },
          { key: 'NOS_D1', type: 'discovery', text: 'Scopri chi è il Modernista', points: 15, target_role: 'modernist' },
          { key: 'NOS_I1', type: 'interaction', text: 'Fagli ammettere che qualcosa del passato era meglio', points: 20, requires_discovery: 'NOS_D1' },
        ]
      },
      {
        role_key: 'modernist',
        name: 'Il Modernista',
        emoji: '💡',
        color_class: 'from-emerald-400 to-teal-600',
        pair_with: 'nostalgic',
        description: 'Il progresso è sempre positivo! Viva il nuovo!',
        objectives: [
          { key: 'MOD_P1', type: 'personal', text: 'Difendi la tecnologia moderna', points: 10 },
          { key: 'MOD_P2', type: 'personal', text: 'Di\' "Il progresso è inevitabile"', points: 15 },
          { key: 'MOD_D1', type: 'discovery', text: 'Scopri chi è il Nostalgico', points: 15, target_role: 'nostalgic' },
          { key: 'MOD_I1', type: 'interaction', text: 'Convincilo a provare qualcosa di nuovo', points: 20, requires_discovery: 'MOD_D1' },
        ]
      },
    ]
  },

  // 5. Il Vampiro
  {
    story: {
      slug: 'vampiro',
      title: 'Il Vampiro',
      tagline: 'Qualcuno ha sete... di sangue!',
      description: `Uno di voi è un vampiro che si nasconde tra i mortali!

Deve sembrare normale ma ha qualche... abitudine particolare.

Riuscirete a scoprire chi è il non-morto tra voi?`,
      setting: 'Cena a lume di candela',
      emoji: '🧛',
      min_players: 6,
      max_players: 18,
      accomplice_threshold: 12,
    },
    mainRole: {
      role_key: 'vampire',
      name: 'Il Vampiro',
      emoji: '🧛',
      color_class: 'from-red-700 to-purple-900',
      description: `Sei un vampiro centenario che cerca di mimetizzarsi.

Il problema? Alcune abitudini sono dure a morire... anche se tu tecnicamente sei già morto.`,
      objectives: [
        { key: 'VAM_P1', type: 'personal', text: 'Evita l\'aglio in modo esagerato ("No grazie, sono... allergico")', points: 15, risk: 'high' },
        { key: 'VAM_P2', type: 'personal', text: 'Fai un commento sulla giovinezza di qualcuno ("Ah, essere giovani...")', points: 15, risk: 'medium' },
        { key: 'VAM_P3', type: 'personal', text: 'Chiedi come è cotta la carne (e ordina "al sangue")', points: 10, risk: 'medium' },
        { key: 'VAM_P4', type: 'personal', text: 'Evita di parlare della tua età o cambia argomento', points: 10, risk: 'low' },
      ]
    },
    accompliceRole: {
      role_key: 'familiar',
      name: 'Il Famiglio',
      emoji: '🦇',
      color_class: 'from-gray-700 to-gray-900',
      description: `Servi il vampiro da anni. Lo proteggi e copri le sue tracce.`,
      objectives: [
        { key: 'FAM_P1', type: 'personal', text: 'Offri di assaggiare il cibo "per sicurezza" al posto del vampiro', points: 15 },
        { key: 'FAM_D1', type: 'discovery', text: 'Scopri chi è il Cacciatore', points: 15, target_role: 'hunter' },
        { key: 'FAM_I1', type: 'interaction', text: 'Depistalo con false informazioni', points: 20, requires_discovery: 'FAM_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'hunter',
        name: 'Il Cacciatore',
        emoji: '🏹',
        color_class: 'from-amber-500 to-orange-700',
        pair_with: 'occultist',
        description: 'Sai che i vampiri esistono. E stasera ne troverai uno.',
        objectives: [
          { key: 'HUN_P1', type: 'personal', text: 'Osserva come mangiano gli altri', points: 10 },
          { key: 'HUN_P2', type: 'personal', text: 'Fai domande sull\'età o sul passato di qualcuno', points: 15 },
          { key: 'HUN_D1', type: 'discovery', text: 'Scopri chi è l\'Occultista', points: 15, target_role: 'occultist' },
          { key: 'HUN_I1', type: 'interaction', text: 'Scambiatevi informazioni sui sospetti', points: 20, requires_discovery: 'HUN_D1' },
        ]
      },
      {
        role_key: 'occultist',
        name: "L'Occultista",
        emoji: '🔮',
        color_class: 'from-violet-500 to-purple-700',
        pair_with: 'hunter',
        description: 'Studi il soprannaturale. Sai riconoscere i segni.',
        objectives: [
          { key: 'OCC_P1', type: 'personal', text: 'Parla di leggende sui vampiri "casualmente"', points: 10 },
          { key: 'OCC_P2', type: 'personal', text: 'Nota qualcosa di "strano" in qualcuno', points: 15 },
          { key: 'OCC_D1', type: 'discovery', text: 'Scopri chi è il Cacciatore', points: 15, target_role: 'hunter' },
          { key: 'OCC_I1', type: 'interaction', text: 'Conferma i suoi sospetti con le tue teorie', points: 20, requires_discovery: 'OCC_D1' },
        ]
      },
      {
        role_key: 'goth',
        name: 'Il Goth',
        emoji: '🖤',
        color_class: 'from-gray-800 to-black',
        pair_with: 'sunny',
        description: 'Ami l\'estetica dark. Saresti FELICE se ci fosse un vampiro!',
        objectives: [
          { key: 'GOT_P1', type: 'personal', text: 'Di\' che i vampiri sono "affascinanti"', points: 10 },
          { key: 'GOT_P2', type: 'personal', text: 'Fai un commento sulla bellezza della notte', points: 15 },
          { key: 'GOT_D1', type: 'discovery', text: 'Scopri chi è il Solare', points: 15, target_role: 'sunny' },
          { key: 'GOT_I1', type: 'interaction', text: 'Convincilo che il dark è bello', points: 20, requires_discovery: 'GOT_D1' },
        ]
      },
      {
        role_key: 'sunny',
        name: 'Il Solare',
        emoji: '☀️',
        color_class: 'from-yellow-300 to-orange-400',
        pair_with: 'goth',
        description: 'Sei positivo e luminoso! Vampiri? Ma figurati!',
        objectives: [
          { key: 'SUN_P1', type: 'personal', text: 'Parla di quanto ami il sole e le giornate luminose', points: 10 },
          { key: 'SUN_P2', type: 'personal', text: 'Ridi delle "superstizioni"', points: 15 },
          { key: 'SUN_D1', type: 'discovery', text: 'Scopri chi è il Goth', points: 15, target_role: 'goth' },
          { key: 'SUN_I1', type: 'interaction', text: 'Fallo sorridere o ridere', points: 20, requires_discovery: 'SUN_D1' },
        ]
      },
    ]
  },

  // 6. La Celebrity
  {
    story: {
      slug: 'celebrity',
      title: 'La Celebrity in Incognito',
      tagline: 'Qualcuno è troppo famoso per essere qui...',
      description: `Una vera celebrity si nasconde tra voi!

È in incognito ma ogni tanto si lascia sfuggire qualcosa...

Chi è la star che cerca di sembrare normale?`,
      setting: 'Bar di quartiere',
      emoji: '⭐',
      min_players: 6,
      max_players: 16,
      accomplice_threshold: 10,
    },
    mainRole: {
      role_key: 'celebrity',
      name: 'La Celebrity',
      emoji: '⭐',
      color_class: 'from-yellow-400 to-amber-500',
      description: `Sei una star mondiale ma stasera vuoi solo una serata normale.

Il problema? Non sei abituato/a a fare cose normali...`,
      objectives: [
        { key: 'CEL_P1', type: 'personal', text: 'Lamentati di qualcosa da ricchi ("Odio quando il mio chef...")', points: 15, risk: 'high' },
        { key: 'CEL_P2', type: 'personal', text: 'Non sapere quanto costa qualcosa di comune', points: 15, risk: 'medium' },
        { key: 'CEL_P3', type: 'personal', text: 'Parla di viaggi o luoghi esclusivi "per sbaglio"', points: 15, risk: 'medium' },
        { key: 'CEL_P4', type: 'personal', text: 'Controlla se qualcuno ti sta fotografando', points: 10, risk: 'low' },
      ]
    },
    accompliceRole: {
      role_key: 'bodyguard',
      name: 'La Guardia del Corpo',
      emoji: '🕴️',
      color_class: 'from-gray-600 to-gray-800',
      description: `Proteggi la celebrity. Nessuno deve scoprire chi è.`,
      objectives: [
        { key: 'BOD_P1', type: 'personal', text: 'Controlla chi entra e esce dalla stanza', points: 10 },
        { key: 'BOD_D1', type: 'discovery', text: 'Scopri chi è il Paparazzo', points: 15, target_role: 'paparazzi' },
        { key: 'BOD_I1', type: 'interaction', text: 'Distrailo o bloccagli la visuale', points: 20, requires_discovery: 'BOD_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'paparazzi',
        name: 'Il Paparazzo',
        emoji: '📸',
        color_class: 'from-red-400 to-red-600',
        pair_with: 'fan',
        description: 'Fiuti le celebrity. C\'è qualcuno di famoso qui, lo senti!',
        objectives: [
          { key: 'PAP_P1', type: 'personal', text: 'Fai foto "casuali" a tutti', points: 10 },
          { key: 'PAP_P2', type: 'personal', text: 'Chiedi a qualcuno "Non ci siamo già visti?"', points: 15 },
          { key: 'PAP_D1', type: 'discovery', text: 'Scopri chi è il Fan', points: 15, target_role: 'fan' },
          { key: 'PAP_I1', type: 'interaction', text: 'Scambiatevi gossip sui presenti', points: 20, requires_discovery: 'PAP_D1' },
        ]
      },
      {
        role_key: 'fan',
        name: 'Il Fan',
        emoji: '🤩',
        color_class: 'from-pink-400 to-pink-600',
        pair_with: 'paparazzi',
        description: 'Ami le celebrity! Se ce ne fosse una qui impazziresti!',
        objectives: [
          { key: 'FAN_P1', type: 'personal', text: 'Parla di quanto ami [celebrity famosa]', points: 10 },
          { key: 'FAN_P2', type: 'personal', text: 'Chiedi a qualcuno se è famoso (scherzando... forse)', points: 15 },
          { key: 'FAN_D1', type: 'discovery', text: 'Scopri chi è il Paparazzo', points: 15, target_role: 'paparazzi' },
          { key: 'FAN_I1', type: 'interaction', text: 'Fate una lista dei "sospetti VIP"', points: 20, requires_discovery: 'FAN_D1' },
        ]
      },
      {
        role_key: 'hipster',
        name: 'L\'Hipster',
        emoji: '🎸',
        color_class: 'from-amber-600 to-amber-800',
        pair_with: 'normie',
        description: 'Le celebrity sono mainstream. Tu le conoscevi PRIMA che fossero famose.',
        objectives: [
          { key: 'HIP_P1', type: 'personal', text: 'Di\' "Io li seguivo prima che diventassero famosi"', points: 15 },
          { key: 'HIP_P2', type: 'personal', text: 'Sminuisci qualcosa di popolare', points: 10 },
          { key: 'HIP_D1', type: 'discovery', text: 'Scopri chi è il Normie', points: 15, target_role: 'normie' },
          { key: 'HIP_I1', type: 'interaction', text: 'Educalo su qualcosa di "underground"', points: 20, requires_discovery: 'HIP_D1' },
        ]
      },
      {
        role_key: 'normie',
        name: 'Il Normale',
        emoji: '😊',
        color_class: 'from-green-400 to-green-600',
        pair_with: 'hipster',
        description: 'Sei una persona normale che ama le cose normali. Che c\'è di male?',
        objectives: [
          { key: 'NOR_P1', type: 'personal', text: 'Difendi qualcosa di mainstream', points: 10 },
          { key: 'NOR_P2', type: 'personal', text: 'Di\' "A me piace!" di qualcosa popolare', points: 15 },
          { key: 'NOR_D1', type: 'discovery', text: 'Scopri chi è l\'Hipster', points: 15, target_role: 'hipster' },
          { key: 'NOR_I1', type: 'interaction', text: 'Fagli ammettere che qualcosa di famoso è bello', points: 20, requires_discovery: 'NOR_D1' },
        ]
      },
    ]
  },

  // 7. Il Ladro d'Arte
  {
    story: {
      slug: 'ladro-arte',
      title: "Il Ladro d'Arte",
      tagline: 'Qualcuno sta pianificando un colpo...',
      description: `Uno di voi è un famoso ladro d'arte in ricognizione!

Sta studiando il museo per il colpo del secolo...

Riuscirete a capire chi sta già pianificando la fuga?`,
      setting: 'Inaugurazione al museo',
      emoji: '🎨',
      min_players: 6,
      max_players: 16,
      accomplice_threshold: 10,
    },
    mainRole: {
      role_key: 'art_thief',
      name: "Il Ladro d'Arte",
      emoji: '🎨',
      color_class: 'from-indigo-500 to-purple-600',
      description: `Sei il più grande ladro d'arte del mondo.

Stasera stai studiando il museo per il prossimo colpo...`,
      objectives: [
        { key: 'ART_P1', type: 'personal', text: 'Studia le uscite di sicurezza ("Che bella porta...")', points: 15, risk: 'high' },
        { key: 'ART_P2', type: 'personal', text: 'Critica la sicurezza del museo', points: 15, risk: 'medium' },
        { key: 'ART_P3', type: 'personal', text: 'Avvicinati troppo a un\'opera d\'arte', points: 10, risk: 'medium' },
        { key: 'ART_P4', type: 'personal', text: 'Chiedi il valore di qualcosa con troppo interesse', points: 15, risk: 'high' },
      ]
    },
    accompliceRole: {
      role_key: 'getaway',
      name: 'L\'Autista',
      emoji: '🚗',
      color_class: 'from-gray-500 to-gray-700',
      description: `Sei l'autista per la fuga. Stai studiando i tempi e le vie di uscita.`,
      objectives: [
        { key: 'GET_P1', type: 'personal', text: 'Controlla l\'orologio spesso', points: 10 },
        { key: 'GET_D1', type: 'discovery', text: 'Scopri chi è la Guardia', points: 15, target_role: 'guard' },
        { key: 'GET_I1', type: 'interaction', text: 'Distraila con una conversazione', points: 20, requires_discovery: 'GET_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'guard',
        name: 'La Guardia',
        emoji: '👮',
        color_class: 'from-blue-600 to-blue-800',
        pair_with: 'curator',
        description: 'Sei responsabile della sicurezza. Qualcosa non ti convince...',
        objectives: [
          { key: 'GUA_P1', type: 'personal', text: 'Osserva chi si avvicina troppo alle opere', points: 10 },
          { key: 'GUA_P2', type: 'personal', text: 'Chiedi documenti o informazioni a qualcuno', points: 15 },
          { key: 'GUA_D1', type: 'discovery', text: 'Scopri chi è il Curatore', points: 15, target_role: 'curator' },
          { key: 'GUA_I1', type: 'interaction', text: 'Discuti di sicurezza con lui', points: 20, requires_discovery: 'GUA_D1' },
        ]
      },
      {
        role_key: 'curator',
        name: 'Il Curatore',
        emoji: '🖼️',
        color_class: 'from-amber-500 to-amber-700',
        pair_with: 'guard',
        description: 'Queste opere sono la tua vita. Guai a chi le tocca!',
        objectives: [
          { key: 'CUR_P1', type: 'personal', text: 'Parla del valore inestimabile delle opere', points: 10 },
          { key: 'CUR_P2', type: 'personal', text: 'Correggi qualcuno sull\'arte', points: 15 },
          { key: 'CUR_D1', type: 'discovery', text: 'Scopri chi è la Guardia', points: 15, target_role: 'guard' },
          { key: 'CUR_I1', type: 'interaction', text: 'Chiedi rinforzi per la sicurezza', points: 20, requires_discovery: 'CUR_D1' },
        ]
      },
      {
        role_key: 'art_critic',
        name: 'Il Critico d\'Arte',
        emoji: '🧐',
        color_class: 'from-purple-400 to-purple-600',
        pair_with: 'art_lover',
        description: 'Giudichi tutto. Nessuna opera è abbastanza buona.',
        objectives: [
          { key: 'CRI_P1', type: 'personal', text: 'Critica un\'opera in modo snob', points: 10 },
          { key: 'CRI_P2', type: 'personal', text: 'Di\' "Questo non è vera arte"', points: 15 },
          { key: 'CRI_D1', type: 'discovery', text: 'Scopri chi è l\'Amante dell\'Arte', points: 15, target_role: 'art_lover' },
          { key: 'CRI_I1', type: 'interaction', text: 'Dibattito: cos\'è la vera arte?', points: 20, requires_discovery: 'CRI_D1' },
        ]
      },
      {
        role_key: 'art_lover',
        name: "L'Amante dell'Arte",
        emoji: '😍',
        color_class: 'from-rose-400 to-rose-600',
        pair_with: 'art_critic',
        description: 'Ami tutta l\'arte! Ogni opera ti emoziona!',
        objectives: [
          { key: 'LOV_P1', type: 'personal', text: 'Emozionati visibilmente davanti a un\'opera', points: 10 },
          { key: 'LOV_P2', type: 'personal', text: 'Difendi un\'opera criticata da altri', points: 15 },
          { key: 'LOV_D1', type: 'discovery', text: 'Scopri chi è il Critico', points: 15, target_role: 'art_critic' },
          { key: 'LOV_I1', type: 'interaction', text: 'Fagli ammettere che qualcosa è bello', points: 20, requires_discovery: 'LOV_D1' },
        ]
      },
    ]
  },

  // 8. Lo Chef Stellato
  {
    story: {
      slug: 'chef-stellato',
      title: 'Lo Chef Stellato',
      tagline: 'Qualcuno cucina meglio di tutti...',
      description: `Uno chef stellato famoso sta cenando in incognito!

Vuole provare un ristorante normale ma non riesce a non giudicare...

Chi è il critico nascosto tra voi?`,
      setting: 'Trattoria di paese',
      emoji: '👨‍🍳',
      min_players: 6,
      max_players: 16,
      accomplice_threshold: 10,
    },
    mainRole: {
      role_key: 'star_chef',
      name: 'Lo Chef Stellato',
      emoji: '👨‍🍳',
      color_class: 'from-amber-400 to-orange-500',
      description: `Hai 3 stelle Michelin ma stasera sei in incognito.

Il problema? Non riesci a smettere di giudicare ogni piatto...`,
      objectives: [
        { key: 'CHF_P1', type: 'personal', text: 'Annusa il piatto in modo professionale', points: 15, risk: 'high' },
        { key: 'CHF_P2', type: 'personal', text: 'Critica (o loda) la cottura con termini tecnici', points: 15, risk: 'medium' },
        { key: 'CHF_P3', type: 'personal', text: 'Chiedi com\'è stata fatta una salsa', points: 10, risk: 'low' },
        { key: 'CHF_P4', type: 'personal', text: 'Di\' "Nel mio ristor... cioè, in un ristorante che conosco..."', points: 20, risk: 'high' },
      ]
    },
    accompliceRole: {
      role_key: 'sous_chef',
      name: 'Il Sous Chef',
      emoji: '🍳',
      color_class: 'from-orange-500 to-red-600',
      description: `Lavori per lo chef e lo stai accompagnando in incognito.`,
      objectives: [
        { key: 'SOU_P1', type: 'personal', text: 'Assaggia prima tu per "testare"', points: 10 },
        { key: 'SOU_D1', type: 'discovery', text: 'Scopri chi è il Food Blogger', points: 15, target_role: 'food_blogger' },
        { key: 'SOU_I1', type: 'interaction', text: 'Depistalo parlando di altri ristoranti', points: 20, requires_discovery: 'SOU_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'food_blogger',
        name: 'Il Food Blogger',
        emoji: '📱',
        color_class: 'from-pink-500 to-rose-600',
        pair_with: 'traditional_eater',
        description: 'Fotografi tutto quello che mangi. TUTTO.',
        objectives: [
          { key: 'FOO_P1', type: 'personal', text: 'Fotografa il cibo prima di mangiarlo', points: 10 },
          { key: 'FOO_P2', type: 'personal', text: 'Parla di "impiattamento" e "presentazione"', points: 15 },
          { key: 'FOO_D1', type: 'discovery', text: 'Scopri chi è il Tradizionalista', points: 15, target_role: 'traditional_eater' },
          { key: 'FOO_I1', type: 'interaction', text: 'Convincilo a fare una foto insieme al cibo', points: 20, requires_discovery: 'FOO_D1' },
        ]
      },
      {
        role_key: 'traditional_eater',
        name: 'Il Tradizionalista',
        emoji: '🍝',
        color_class: 'from-red-600 to-red-800',
        pair_with: 'food_blogger',
        description: 'La cucina della nonna è insuperabile. Punto.',
        objectives: [
          { key: 'TRA_P1', type: 'personal', text: 'Di\' "Mia nonna lo faceva meglio"', points: 15 },
          { key: 'TRA_P2', type: 'personal', text: 'Critica le "mode culinarie moderne"', points: 10 },
          { key: 'TRA_D1', type: 'discovery', text: 'Scopri chi è il Food Blogger', points: 15, target_role: 'food_blogger' },
          { key: 'TRA_I1', type: 'interaction', text: 'Fagli mettere via il telefono', points: 20, requires_discovery: 'TRA_D1' },
        ]
      },
      {
        role_key: 'hungry_person',
        name: "L'Affamato",
        emoji: '🍽️',
        color_class: 'from-yellow-500 to-amber-600',
        pair_with: 'picky_eater',
        description: 'Hai fame. TANTA fame. Mangeresti qualsiasi cosa!',
        objectives: [
          { key: 'HUN_P1', type: 'personal', text: 'Finisci il tuo piatto per primo', points: 10 },
          { key: 'HUN_P2', type: 'personal', text: 'Chiedi "Ma il secondo quando arriva?"', points: 15 },
          { key: 'HUN_D1', type: 'discovery', text: 'Scopri chi è lo Schizzinoso', points: 15, target_role: 'picky_eater' },
          { key: 'HUN_I1', type: 'interaction', text: 'Offrititi di finire il suo piatto', points: 20, requires_discovery: 'HUN_D1' },
        ]
      },
      {
        role_key: 'picky_eater',
        name: 'Lo Schizzinoso',
        emoji: '😒',
        color_class: 'from-green-500 to-teal-600',
        pair_with: 'hungry_person',
        description: 'Sei difficile con il cibo. Molto difficile.',
        objectives: [
          { key: 'PIC_P1', type: 'personal', text: 'Chiedi di modificare un piatto', points: 10 },
          { key: 'PIC_P2', type: 'personal', text: 'Lascia qualcosa nel piatto "perché non ti convince"', points: 15 },
          { key: 'PIC_D1', type: 'discovery', text: 'Scopri chi è l\'Affamato', points: 15, target_role: 'hungry_person' },
          { key: 'PIC_I1', type: 'interaction', text: 'Guardalo con disgusto mentre mangia veloce', points: 15, requires_discovery: 'PIC_D1' },
        ]
      },
    ]
  },

  // 9. Il Fantasma
  {
    story: {
      slug: 'fantasma',
      title: 'Il Fantasma',
      tagline: 'Qualcuno non dovrebbe essere qui...',
      description: `Uno di voi è un fantasma che non sa di essere morto!

Ogni tanto fa cose strane senza rendersene conto...

Chi è lo spirito inconsapevole tra voi?`,
      setting: 'Riunione di famiglia',
      emoji: '👻',
      min_players: 6,
      max_players: 16,
      accomplice_threshold: 10,
    },
    mainRole: {
      role_key: 'ghost',
      name: 'Il Fantasma',
      emoji: '👻',
      color_class: 'from-blue-200 to-blue-400',
      description: `Sei un fantasma ma non lo sai ancora.

Ogni tanto fai cose strane senza rendertene conto...`,
      objectives: [
        { key: 'GHO_P1', type: 'personal', text: 'Parla di eventi del passato come se fossero recenti', points: 15, risk: 'high' },
        { key: 'GHO_P2', type: 'personal', text: 'Ignora qualcuno come se non lo vedessi', points: 15, risk: 'medium' },
        { key: 'GHO_P3', type: 'personal', text: 'Rabbrividisci o di\' "Che freddo qui"', points: 10, risk: 'low' },
        { key: 'GHO_P4', type: 'personal', text: 'Non toccare il cibo o trova scuse per non mangiare', points: 15, risk: 'medium' },
      ]
    },
    accompliceRole: {
      role_key: 'medium',
      name: 'Il Medium',
      emoji: '🔮',
      color_class: 'from-purple-400 to-purple-600',
      description: `Sei l'unico che sa la verità. Aiuta il fantasma a non essere scoperto.`,
      objectives: [
        { key: 'MED_P1', type: 'personal', text: 'Parla AL POSTO del fantasma quando è in difficoltà', points: 15 },
        { key: 'MED_D1', type: 'discovery', text: 'Scopri chi è lo Spiritista', points: 15, target_role: 'spiritualist' },
        { key: 'MED_I1', type: 'interaction', text: 'Depistalo con false visioni', points: 20, requires_discovery: 'MED_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'spiritualist',
        name: 'Lo Spiritista',
        emoji: '✨',
        color_class: 'from-violet-400 to-indigo-600',
        pair_with: 'rationalist',
        description: 'Senti le presenze. Stasera ce n\'è una forte...',
        objectives: [
          { key: 'SPI_P1', type: 'personal', text: 'Di\' "Sento una presenza strana"', points: 15 },
          { key: 'SPI_P2', type: 'personal', text: 'Fissa qualcuno con aria sospetta', points: 10 },
          { key: 'SPI_D1', type: 'discovery', text: 'Scopri chi è il Razionalista', points: 15, target_role: 'rationalist' },
          { key: 'SPI_I1', type: 'interaction', text: 'Fagli ammettere che "qualcosa non torna"', points: 20, requires_discovery: 'SPI_D1' },
        ]
      },
      {
        role_key: 'rationalist',
        name: 'Il Razionalista',
        emoji: '🧠',
        color_class: 'from-gray-400 to-gray-600',
        pair_with: 'spiritualist',
        description: 'I fantasmi non esistono. Tutto ha una spiegazione logica.',
        objectives: [
          { key: 'RAT_P1', type: 'personal', text: 'Spiega razionalmente qualcosa di strano', points: 10 },
          { key: 'RAT_P2', type: 'personal', text: 'Di\' "C\'è sempre una spiegazione logica"', points: 15 },
          { key: 'RAT_D1', type: 'discovery', text: 'Scopri chi è lo Spiritista', points: 15, target_role: 'spiritualist' },
          { key: 'RAT_I1', type: 'interaction', text: 'Smonta una sua teoria paranormale', points: 20, requires_discovery: 'RAT_D1' },
        ]
      },
      {
        role_key: 'scared',
        name: 'Il Fifone',
        emoji: '😱',
        color_class: 'from-yellow-300 to-yellow-500',
        pair_with: 'brave',
        description: 'Hai paura di tutto! Specialmente dei fantasmi!',
        objectives: [
          { key: 'SCA_P1', type: 'personal', text: 'Sobbalza per un rumore qualsiasi', points: 10 },
          { key: 'SCA_P2', type: 'personal', text: 'Chiedi "Avete sentito anche voi?"', points: 15 },
          { key: 'SCA_D1', type: 'discovery', text: 'Scopri chi è il Coraggioso', points: 15, target_role: 'brave' },
          { key: 'SCA_I1', type: 'interaction', text: 'Nasconditi dietro di lui per "protezione"', points: 20, requires_discovery: 'SCA_D1' },
        ]
      },
      {
        role_key: 'brave',
        name: 'Il Coraggioso',
        emoji: '💪',
        color_class: 'from-red-500 to-red-700',
        pair_with: 'scared',
        description: 'Non hai paura di niente! Sfideresti anche un fantasma!',
        objectives: [
          { key: 'BRA_P1', type: 'personal', text: 'Di\' "Non ho paura di niente"', points: 10 },
          { key: 'BRA_P2', type: 'personal', text: 'Provoca scherzosamente i "fantasmi"', points: 15 },
          { key: 'BRA_D1', type: 'discovery', text: 'Scopri chi è il Fifone', points: 15, target_role: 'scared' },
          { key: 'BRA_I1', type: 'interaction', text: 'Spaventalo di proposito', points: 20, requires_discovery: 'BRA_D1' },
        ]
      },
    ]
  },

  // 10. L'Impostore
  {
    story: {
      slug: 'impostore',
      title: "L'Impostore",
      tagline: 'Qualcuno finge di essere chi non è...',
      description: `Uno di voi sta fingendo di conoscere tutti!

In realtà non ha idea di chi siate ma fa finta di sì...

Chi è l'infiltrato che non dovrebbe essere qui?`,
      setting: 'Reunion di classe',
      emoji: '🎭',
      min_players: 6,
      max_players: 20,
      accomplice_threshold: 12,
    },
    mainRole: {
      role_key: 'impostor',
      name: "L'Impostore",
      emoji: '🎭',
      color_class: 'from-gray-600 to-gray-800',
      description: `Sei finito a questa reunion per sbaglio.

Non conosci nessuno ma devi fingere di sì!`,
      objectives: [
        { key: 'IMP_P1', type: 'personal', text: 'Usa frasi vaghe ("Ah sì, quella volta... sai cosa intendo")', points: 15, risk: 'medium' },
        { key: 'IMP_P2', type: 'personal', text: 'Sbaglia il nome di qualcuno e corregiti', points: 15, risk: 'high' },
        { key: 'IMP_P3', type: 'personal', text: 'Inventa un ricordo falso ("Ti ricordi quando...?")', points: 20, risk: 'high' },
        { key: 'IMP_P4', type: 'personal', text: 'Chiedi "Tu eri in che classe?" con disinvoltura', points: 10, risk: 'low' },
      ]
    },
    accompliceRole: {
      role_key: 'accomplice_impostor',
      name: "L'Alleato",
      emoji: '🤝',
      color_class: 'from-blue-500 to-blue-700',
      description: `Hai capito che l'impostore non è della reunion.
Ti sta simpatico e lo vuoi aiutare!`,
      objectives: [
        { key: 'ALL_P1', type: 'personal', text: 'Conferma le storie inventate ("Sì, mi ricordo!")', points: 15 },
        { key: 'ALL_D1', type: 'discovery', text: 'Scopri chi è il Nostalgico', points: 15, target_role: 'reunion_nostalgic' },
        { key: 'ALL_I1', type: 'interaction', text: 'Distrailo con ricordi del passato', points: 20, requires_discovery: 'ALL_D1' },
      ]
    },
    regularRoles: [
      {
        role_key: 'reunion_nostalgic',
        name: 'Il Nostalgico',
        emoji: '📷',
        color_class: 'from-amber-500 to-amber-700',
        pair_with: 'moved_on',
        description: 'La scuola era il periodo più bello! Ricordi tutto!',
        objectives: [
          { key: 'RNO_P1', type: 'personal', text: 'Racconta un aneddoto scolastico dettagliato', points: 10 },
          { key: 'RNO_P2', type: 'personal', text: 'Mostra foto del passato (anche inventate)', points: 15 },
          { key: 'RNO_D1', type: 'discovery', text: 'Scopri chi ha Voltato Pagina', points: 15, target_role: 'moved_on' },
          { key: 'RNO_I1', type: 'interaction', text: 'Fagli ammettere un bel ricordo', points: 20, requires_discovery: 'RNO_D1' },
        ]
      },
      {
        role_key: 'moved_on',
        name: 'Chi Ha Voltato Pagina',
        emoji: '🚀',
        color_class: 'from-teal-400 to-cyan-600',
        pair_with: 'reunion_nostalgic',
        description: 'La scuola? Acqua passata. Ora hai una vita vera.',
        objectives: [
          { key: 'MOV_P1', type: 'personal', text: 'Di\' "Ero così diverso/a allora"', points: 10 },
          { key: 'MOV_P2', type: 'personal', text: 'Parla solo del presente e del futuro', points: 15 },
          { key: 'MOV_D1', type: 'discovery', text: 'Scopri chi è il Nostalgico', points: 15, target_role: 'reunion_nostalgic' },
          { key: 'MOV_I1', type: 'interaction', text: 'Fagli parlare del presente invece del passato', points: 20, requires_discovery: 'MOV_D1' },
        ]
      },
      {
        role_key: 'class_clown',
        name: 'Il Buffone',
        emoji: '🤡',
        color_class: 'from-orange-400 to-red-500',
        pair_with: 'class_nerd',
        description: 'Eri il buffone della classe. Nulla è cambiato!',
        objectives: [
          { key: 'CLO_P1', type: 'personal', text: 'Fai una battuta su un ricordo di classe', points: 10 },
          { key: 'CLO_P2', type: 'personal', text: 'Prendi in giro qualcuno affettuosamente', points: 15 },
          { key: 'CLO_D1', type: 'discovery', text: 'Scopri chi era il Secchione', points: 15, target_role: 'class_nerd' },
          { key: 'CLO_I1', type: 'interaction', text: 'Ricordagli quando lo prendevi in giro', points: 20, requires_discovery: 'CLO_D1' },
        ]
      },
      {
        role_key: 'class_nerd',
        name: 'Il Secchione',
        emoji: '🤓',
        color_class: 'from-blue-400 to-indigo-600',
        pair_with: 'class_clown',
        description: 'Studiavi sempre. Ora mostri a tutti che ce l\'hai fatta!',
        objectives: [
          { key: 'NER_P1', type: 'personal', text: 'Vanta i tuoi successi professionali', points: 10 },
          { key: 'NER_P2', type: 'personal', text: 'Correggi qualcuno su un dettaglio', points: 15 },
          { key: 'NER_D1', type: 'discovery', text: 'Scopri chi era il Buffone', points: 15, target_role: 'class_clown' },
          { key: 'NER_I1', type: 'interaction', text: 'Prendi una piccola rivincita su di lui', points: 20, requires_discovery: 'NER_D1' },
        ]
      },
    ]
  },
];

async function createStory(storyData, sortOrder) {
  console.log(`\nCreating: ${storyData.story.title}...`);

  // Check if exists
  const { data: existing } = await supabase
    .from('stories')
    .select('slug')
    .eq('slug', storyData.story.slug)
    .single();

  if (existing) {
    console.log(`  Story "${storyData.story.slug}" already exists. Skipping.`);
    return null;
  }

  // Create story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      ...storyData.story,
      is_active: true,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (storyError) throw storyError;
  console.log(`  Created story: ${story.title}`);

  // Collect all roles
  const allRoles = [
    { ...storyData.mainRole, role_type: 'millionaire', scoring_rules: JSON.stringify({ notCaught: 40, partiallyCaught: 20, caught: 0 }) },
    { ...storyData.accompliceRole, role_type: 'accomplice', scoring_rules: JSON.stringify({ millionaireSafe: 30, millionairePartial: 15, millionaireCaught: 0 }) },
    ...storyData.regularRoles.map(r => ({ ...r, role_type: 'regular' }))
  ];

  // Create roles
  const roleInserts = allRoles.map((role, idx) => ({
    story_id: story.id,
    role_key: role.role_key,
    name: role.name,
    emoji: role.emoji,
    color_class: role.color_class,
    description: role.description,
    role_type: role.role_type,
    pair_with: role.pair_with || null,
    scoring_rules: role.scoring_rules || null,
    sort_order: idx,
  }));

  const { data: roles, error: rolesError } = await supabase
    .from('story_roles')
    .insert(roleInserts)
    .select();

  if (rolesError) throw rolesError;
  console.log(`  Created ${roles.length} roles`);

  // Map role_key -> role_id
  const roleIdMap = {};
  for (const role of roles) {
    roleIdMap[role.role_key] = role.id;
  }

  // Create objectives
  const objectiveInserts = [];
  for (const role of allRoles) {
    const roleId = roleIdMap[role.role_key];
    if (!roleId || !role.objectives) continue;

    for (const obj of role.objectives) {
      objectiveInserts.push({
        role_id: roleId,
        objective_key: obj.key,
        type: obj.type,
        text: obj.text,
        points: obj.points,
        risk: obj.risk || 'low',
        target_role: obj.target_role || null,
        requires_discovery: obj.requires_discovery || null,
        sort_order: obj.sort_order || 0,
      });
    }
  }

  const { error: objError } = await supabase
    .from('story_objectives')
    .insert(objectiveInserts);

  if (objError) throw objError;
  console.log(`  Created ${objectiveInserts.length} objectives`);

  // Create pairs
  const pairs = storyData.regularRoles
    .filter(r => r.pair_with)
    .reduce((acc, role) => {
      const pairKey = [role.role_key, role.pair_with].sort().join('-');
      if (!acc.seen.has(pairKey)) {
        acc.seen.add(pairKey);
        acc.pairs.push({
          story_id: story.id,
          role_key_1: role.role_key,
          role_key_2: role.pair_with,
          sort_order: acc.pairs.length,
        });
      }
      return acc;
    }, { seen: new Set(), pairs: [] }).pairs;

  if (pairs.length > 0) {
    const { error: pairsError } = await supabase
      .from('story_role_pairs')
      .insert(pairs);

    if (pairsError) throw pairsError;
    console.log(`  Created ${pairs.length} role pairs`);
  }

  return story;
}

async function main() {
  console.log('='.repeat(50));
  console.log('ADDING 8 NEW STORIES');
  console.log('='.repeat(50));

  try {
    for (let i = 0; i < NEW_STORIES.length; i++) {
      await createStory(NEW_STORIES[i], i + 2); // +2 because milionario=0, spia=1
    }

    console.log('\n' + '='.repeat(50));
    console.log('All 8 stories added successfully!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
