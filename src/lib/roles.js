export const ROLE_TYPES = {
  MILLIONAIRE: 'millionaire',
  ACCOMPLICE: 'accomplice',
  REGULAR: 'regular'
};

export const ROLE_PAIRS = [
  ['detective', 'complottista'],
  ['karaoke', 'dramatico'],
  ['paparazzo', 'abbracciatore'],
  ['megafono', 'sussurratore'],
  ['bugiardo', 'factchecker'],
  ['competitivo', 'pacifista'],
  ['mistico', 'scettico'],
  ['critico', 'chef_mancato'],
  ['social_media', 'boomer'],
  ['random', 'ordinato']
];

export const ROLES = {
  millionaire: {
    id: 'millionaire',
    type: ROLE_TYPES.MILLIONAIRE,
    name: 'Il Milionario',
    emoji: '💰',
    color: 'from-yellow-400 to-amber-500',
    description: `Hai appena vinto 10 MILIONI DI EURO alla lotteria, ma NESSUNO deve saperlo!

Il problema? Non riesci proprio a comportarti da persona normale...

⚠️ ATTENZIONE: Tutti ti stanno cercando! Ogni obiettivo che completi ti espone, ma se non li fai perdi punti!`,
    objectives: {
      personal: [
        { id: 'M_P1', text: 'Fai un complimento su qualcosa di COSTOSO (orologio, telefono, macchina, casa, vestito firmato)', points: 15, risk: 'high', hint: '💡 "Che bell\'orologio! È un Rolex?"' },
        { id: 'M_P2', text: 'Pronuncia "costa", "prezzo", "economico" o "caro" almeno 3 VOLTE', points: 15, risk: 'high', hint: '💡 Tieni il conto mentalmente!' },
        { id: 'M_P3', text: 'OFFRI di pagare qualcosa per qualcuno (caffè, dolce, conto, Uber)', points: 20, risk: 'high', hint: '💡 "Dai lascia, offro io!"' },
        { id: 'M_P4', text: 'Parla di "investimenti", "azioni", "crypto", "immobili" o "rendite"', points: 15, risk: 'high', hint: '💡 "Ho letto che le crypto stanno risalendo..."' },
        { id: 'M_P5', text: 'Di\' la frase "quando sarò ricco..." oppure "se vincessi alla lotteria..."', points: 10, risk: 'medium', hint: '💡 Ironia livello 1000' },
        { id: 'M_P6', text: 'Chiedi a qualcuno quanto GUADAGNA o quanto ha PAGATO qualcosa', points: 10, risk: 'medium', hint: '💡 "Ma tu quanto prendi di stipendio?"' },
        { id: 'M_P7', text: 'Lascia il telefono a faccia in GIÙ tutto il pranzo (paranoia!)', points: 5, risk: 'low', hint: '💡 Non si sa mai chi potrebbe vedere...' },
        { id: 'M_P8', text: 'Cambia discorso BRUSCAMENTE quando si parla di soldi o fortuna', points: 10, risk: 'medium', hint: '💡 "Eh sì i soldi... MA AVETE VISTO LA PARTITA?!"' }
      ],
      discovery: [],
      interaction: []
    },
    scoring: { notCaught: 40, partiallyCaught: 20, caught: 0 }
  },

  accomplice: {
    id: 'accomplice',
    type: ROLE_TYPES.ACCOMPLICE,
    name: 'Il Complice',
    emoji: '🤝',
    color: 'from-purple-400 to-purple-600',
    description: `Conosci l'identità del MILIONARIO e devi PROTEGGERLO!

Il tuo compito è:
- Depistare chi lo cerca
- Attirare i sospetti su altri
- Non farti scoprire come complice!

⚠️ Se il milionario viene scoperto, perdi anche tu!`,
    objectives: {
      personal: [
        { id: 'C_P1', text: 'Difendi qualcuno (non il milionario!) quando viene "accusato" di qualcosa', points: 10, hint: '💡 Crea confusione sui sospetti' },
        { id: 'C_P2', text: 'Lancia un SOSPETTO falso su qualcuno: "Secondo me [nome] nasconde qualcosa..."', points: 15, hint: '💡 Depista il Detective!' },
        { id: 'C_P3', text: 'Di\' "No ma lui/lei è normalissimo" riferito al VERO milionario almeno una volta', points: 15, hint: '💡 Difendilo senza essere ovvio' },
        { id: 'C_P4', text: 'Cambia argomento quando la conversazione diventa "pericolosa" per il milionario', points: 10, hint: '💡 Intervieni se stanno per sgamarlo' }
      ],
      discovery: [
        { id: 'C_D1', text: 'Scopri chi è il DETECTIVE (è il più pericoloso!)', points: 15, targetRole: 'detective', fallbackText: 'Scopri chi fa più domande su soldi/lavoro' }
      ],
      interaction: [
        { id: 'C_I1', text: 'Distrailo! Parlagli di qualcosa per almeno 2 minuti', points: 20, requiresDiscovery: 'C_D1', hint: '💡 Tienilo occupato mentre il milionario agisce' }
      ]
    },
    scoring: { millionaireSafe: 30, millionairePartial: 15, millionaireCaught: 0 }
  },

  detective: {
    id: 'detective',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Detective',
    emoji: '🕵️',
    color: 'from-blue-400 to-blue-600',
    pairWith: 'complottista',
    description: `Sei CONVINTO che qualcuno nasconda qualcosa di grosso.

Il tuo istinto non sbaglia mai... o quasi.
Osserva, indaga, interroga. La verità verrà a galla!`,
    objectives: {
      personal: [
        { id: 'DET_P1', text: 'Fai almeno 5 DOMANDE "indagatorie" durante il pranzo', points: 10, hint: '💡 "E tu come lo sai?", "Dove eri ieri sera?", "Interessante..."' },
        { id: 'DET_P2', text: 'Guarda qualcuno FISSO negli occhi per 5 secondi, poi di\' "Interessante..."', points: 15, hint: '💡 Fallo sentire sotto interrogatorio' },
        { id: 'DET_P3', text: 'Chiedi a qualcuno "Ma tu come fai a permettertelo?" riferito a qualsiasi cosa', points: 15, hint: '💡 Telefono, vacanza, macchina, cena fuori...' }
      ],
      discovery: [
        { id: 'DET_D1', text: 'Scopri chi è il COMPLOTTISTA', points: 15, targetRole: 'complottista', hint: '💡 Chi parla di teorie strane? Chi dice "coincidenza? io non credo"?' }
      ],
      interaction: [
        { id: 'DET_I1', text: 'Fai ammettere al Complottista una teoria ASSURDA davanti a tutti', points: 25, requiresDiscovery: 'DET_D1', hint: '💡 "Dai racconta quella cosa che mi hai detto prima!"' }
      ]
    }
  },

  complottista: {
    id: 'complottista',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Complottista',
    emoji: '🤫',
    color: 'from-green-700 to-green-900',
    pairWith: 'detective',
    description: `Tu SAI cose che gli altri non sanno. O almeno, così credi.

Dietro ogni coincidenza c'è un piano. Dietro ogni piano c'è qualcuno.
E tu li smaschererai tutti.`,
    objectives: {
      personal: [
        { id: 'COM_P1', text: 'Di\' "Coincidenza? Io non credo." almeno UNA volta', points: 15, hint: '💡 Qualsiasi cosa può essere una coincidenza sospetta' },
        { id: 'COM_P2', text: 'Abbassa la voce e di\' "Non dovrei dirtelo, ma..." a qualcuno', points: 15, hint: '💡 Poi inventa qualcosa di assurdo' },
        { id: 'COM_P3', text: 'Collega DUE cose completamente scollegate dicendo "Vedi? È tutto collegato."', points: 15, hint: '💡 "Il cane del vicino e la crisi del gas? È tutto collegato."' }
      ],
      discovery: [
        { id: 'COM_D1', text: 'Scopri chi è il DETECTIVE', points: 15, targetRole: 'detective', hint: '💡 Chi fa troppe domande? Chi ti osserva?' }
      ],
      interaction: [
        { id: 'COM_I1', text: 'CONVERTI il Detective: fagli dire "effettivamente è strano" su una tua teoria', points: 25, requiresDiscovery: 'COM_D1', hint: '💡 Presentagli una teoria abbastanza credibile da farlo dubitare' }
      ]
    }
  },

  karaoke: {
    id: 'karaoke',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Karaoke Vivente',
    emoji: '🎤',
    color: 'from-pink-400 to-pink-600',
    pairWith: 'dramatico',
    description: `La musica scorre nelle tue vene. Non puoi trattenerti.

Ogni momento è buono per un ritornello, ogni frase può diventare una canzone.
Oggi il pranzo sarà... MUSICALE! 🎵`,
    objectives: {
      personal: [
        { id: 'KAR_P1', text: 'CANTA un ritornello intero di una canzone A VOCE ALTA', points: 20, hint: '💡 Niente timidezza! Vai di classico italiano!' },
        { id: 'KAR_P2', text: 'Rispondi a una domanda CANTANDO invece che parlando', points: 20, hint: '💡 "Come stai?" → "🎵 Io vagabondo che son io... 🎵"' },
        { id: 'KAR_P3', text: 'Canticchia per almeno 30 SECONDI di fila', points: 10, hint: '💡 Fai il sottofondo musicale del pranzo' }
      ],
      discovery: [
        { id: 'KAR_D1', text: 'Scopri chi è il DRAMATICO', points: 15, targetRole: 'dramatico', hint: '💡 Chi reagisce in modo esagerato? Chi fa pause drammatiche?' }
      ],
      interaction: [
        { id: 'KAR_I1', text: 'Fai una SCENA EPICA insieme: tu canti, lui reagisce drammaticamente!', points: 30, requiresDiscovery: 'KAR_D1', hint: '💡 Tu canti qualcosa di emotivo, lui finge commozione/shock!' }
      ]
    }
  },

  dramatico: {
    id: 'dramatico',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Dramatico',
    emoji: '🎭',
    color: 'from-red-400 to-red-600',
    pairWith: 'karaoke',
    description: `Per te OGNI COSA è epica. Monumentale. STORICA.

Una forchetta che cade? Tragedia greca.
Un complimento? Il momento più bello della tua INTERA ESISTENZA.`,
    objectives: {
      personal: [
        { id: 'DRA_P1', text: 'Reagisci a qualcosa di BANALE come se fosse SCONVOLGENTE', points: 15, hint: '💡 "Hai preso il sale? OH MIO DIO. QUESTO CAMBIA TUTTO."' },
        { id: 'DRA_P2', text: 'Fai una pausa drammatica di 5 SECONDI prima di rispondere a una domanda', points: 15, hint: '💡 Guarda nel vuoto... poi rispondi lentamente' },
        { id: 'DRA_P3', text: 'FINGI di commuoverti per qualcosa (occhi lucidi, voce rotta)', points: 15, hint: '💡 "Scusate... è che... questo sugo mi ricorda mia nonna..."' },
        { id: 'DRA_P4', text: 'Di\' "Questo potrebbe CAMBIARE TUTTO" riferito a qualcosa di insignificante', points: 15, hint: '💡 Il wifi che va lento, il sale che manca...' }
      ],
      discovery: [
        { id: 'DRA_D1', text: 'Scopri chi è il KARAOKE VIVENTE', points: 15, targetRole: 'karaoke', hint: '💡 Chi canticchia? Chi risponde cantando?' }
      ],
      interaction: [
        { id: 'DRA_I1', text: 'Reagisci alla sua canzone come se fosse l\'OPERA più bella mai scritta', points: 25, requiresDiscovery: 'DRA_D1', hint: '💡 Standing ovation, lacrime di gioia, "BRAVO! BIS!"' }
      ]
    }
  },

  paparazzo: {
    id: 'paparazzo',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Paparazzo',
    emoji: '📸',
    color: 'from-gray-400 to-gray-600',
    pairWith: 'abbracciatore',
    description: `Documenti TUTTO. Sei il fotografo ufficiale non richiesto del gruppo.

Ogni momento va immortalato. Ogni espressione catturata.
Il tuo rullino sarà LEGGENDARIO.`,
    objectives: {
      personal: [
        { id: 'PAP_P1', text: 'Fai almeno 5 foto "spontanee" (gente che NON posa)', points: 10, hint: '💡 Cattura momenti autentici!' },
        { id: 'PAP_P2', text: 'Fotografa qualcuno mentre MANGIA con la bocca piena', points: 15, hint: '💡 Lo scatto perfetto per i ricatti futuri' },
        { id: 'PAP_P3', text: 'Fai un SELFIE di gruppo inventando una scusa', points: 10, hint: '💡 "Facciamo una foto per [motivo inventato]!"' }
      ],
      discovery: [
        { id: 'PAP_D1', text: 'Scopri chi è l\'ABBRACCIATORE SERIALE', points: 15, targetRole: 'abbracciatore', hint: '💡 Chi tocca sempre tutti? Chi propone abbracci?' }
      ],
      interaction: [
        { id: 'PAP_I1', text: 'Fotografalo mentre abbraccia qualcuno SENZA che ti veda', points: 25, requiresDiscovery: 'PAP_D1', hint: '💡 Lo scatto paparazzo perfetto!' }
      ]
    }
  },

  abbracciatore: {
    id: 'abbracciatore',
    type: ROLE_TYPES.REGULAR,
    name: 'L\'Abbracciatore Seriale',
    emoji: '🤗',
    color: 'from-orange-400 to-orange-600',
    pairWith: 'paparazzo',
    description: `Sei una persona MOLTO affettuosa. Forse troppo.

Il contatto fisico è il tuo linguaggio d'amore.
Oggi tutti riceveranno calore umano, che lo vogliano o no!`,
    objectives: {
      personal: [
        { id: 'ABB_P1', text: 'ABBRACCIA almeno 4 persone diverse durante il pranzo', points: 15, hint: '💡 Trova scuse: "Mi sei mancato!", "Che bello vederti!"' },
        { id: 'ABB_P2', text: 'Tieni la mano sulla SPALLA di qualcuno per almeno 30 secondi', points: 15, hint: '💡 Durante una conversazione, casualmente...' },
        { id: 'ABB_P3', text: 'Proponi un "ABBRACCIO DI GRUPPO"', points: 20, hint: '💡 "Dai facciamo un abbraccione tutti insieme!"' }
      ],
      discovery: [
        { id: 'ABB_D1', text: 'Scopri chi è il PAPARAZZO', points: 15, targetRole: 'paparazzo', hint: '💡 Chi fa troppe foto? Chi ha sempre il telefono pronto?' }
      ],
      interaction: [
        { id: 'ABB_I1', text: 'ABBRACCIALO proprio mentre sta scattando una foto (rovinagliela!)', points: 25, requiresDiscovery: 'ABB_D1', hint: '💡 Photobomb con abbraccio!' }
      ]
    }
  },

  megafono: {
    id: 'megafono',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Megafono Umano',
    emoji: '📢',
    color: 'from-red-500 to-red-700',
    pairWith: 'sussurratore',
    description: `Hai un piccolo problema: NON controlli il volume della tua voce.

Ogni tanto... ESPLODI. Non è colpa tua. È più forte di te.
Oggi il pranzo sarà RUMOROSO!`,
    objectives: {
      personal: [
        { id: 'MEG_P1', text: 'Grida "COSA?!" almeno 2 volte come se non avessi sentito', points: 10, hint: '💡 Anche se hai sentito benissimo' },
        { id: 'MEG_P2', text: 'Racconta una storia ALZANDO progressivamente il volume fino a URLARE la fine', points: 20, hint: '💡 Inizia piano e finisci FORTISSIMO' },
        { id: 'MEG_P3', text: 'Di\' una cosa normalissima ma URLANDO (es: "MI PASSI L\'ACQUA?!")', points: 15, hint: '💡 Volume sproporzionato al contenuto' }
      ],
      discovery: [
        { id: 'MEG_D1', text: 'Scopri chi è il SUSSURRATORE', points: 15, targetRole: 'sussurratore', hint: '💡 Chi parla sempre piano? Chi si avvicina per parlare?' }
      ],
      interaction: [
        { id: 'MEG_I1', text: 'Fai una CONVERSAZIONE dove tu URLI e lui sussurra. Ridicola per tutti!', points: 30, requiresDiscovery: 'MEG_D1', hint: '💡 Il contrasto sarà ESILARANTE' }
      ]
    }
  },

  sussurratore: {
    id: 'sussurratore',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Sussurratore',
    emoji: '🤫',
    color: 'from-indigo-400 to-indigo-600',
    pairWith: 'megafono',
    description: `Parli sempre a bassa voce. Bassissima.

Le persone devono avvicinarsi per sentirti.
Questo ti dà un'aria... misteriosa. O forse fastidiosa. Chissà.`,
    objectives: {
      personal: [
        { id: 'SUS_P1', text: 'Parla SOTTOVOCE per almeno 3 frasi consecutive costringendo tutti ad avvicinarsi', points: 15, hint: '💡 Così piano che devono dire "eh? cosa?"' },
        { id: 'SUS_P2', text: 'Di\' qualcosa di normalissimo come se fosse un SEGRETO (avvicinati all\'orecchio)', points: 15, hint: '💡 "Psst... il bagno è in fondo al corridoio..."' },
        { id: 'SUS_P3', text: 'Fai uno "SHHHH" esagerato a qualcuno che parla normalmente', points: 15, hint: '💡 Come se stesse urlando (anche se non lo sta facendo)' }
      ],
      discovery: [
        { id: 'SUS_D1', text: 'Scopri chi è il MEGAFONO UMANO', points: 15, targetRole: 'megafono', hint: '💡 Chi parla troppo forte? Chi urla cose normali?' }
      ],
      interaction: [
        { id: 'SUS_I1', text: 'Chiedigli di parlare più piano... mentre LUI ti chiede di parlare più forte!', points: 30, requiresDiscovery: 'SUS_D1', hint: '💡 Un dialogo assurdo che non va da nessuna parte' }
      ]
    }
  },

  bugiardo: {
    id: 'bugiardo',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Bugiardo Compulsivo',
    emoji: '🤥',
    color: 'from-emerald-400 to-emerald-600',
    pairWith: 'factchecker',
    description: `Non riesci a dire la verità. È più forte di te.

Anche quando non serve, inventi. Abbellisci. MENTI.
La realtà è così... noiosa.`,
    objectives: {
      personal: [
        { id: 'BUG_P1', text: 'Racconta un aneddoto completamente INVENTATO su di te', points: 15, hint: '💡 "Quella volta che ho incontrato [celebrity]..."' },
        { id: 'BUG_P2', text: 'Inventa un FATTO STORICO falso e dillo con convinzione', points: 15, hint: '💡 "Lo sapevi che Napoleone era alto 2 metri?"' },
        { id: 'BUG_P3', text: 'Di\' "L\'ho letto su uno studio scientifico" su qualcosa di INVENTATO', points: 15, hint: '💡 Statistiche false, studi inesistenti...' },
        { id: 'BUG_P4', text: 'Se qualcuno ti smaschera, RADDOPPIA: "No no è VERO! Giuro!"', points: 10, hint: '💡 Mai ammettere, sempre rilanciare!' }
      ],
      discovery: [
        { id: 'BUG_D1', text: 'Scopri chi è il FACT CHECKER', points: 15, targetRole: 'factchecker', hint: '💡 Chi corregge sempre? Chi verifica le cose?' }
      ],
      interaction: [
        { id: 'BUG_I1', text: 'SFIDALO! Racconta una bugia così grossa che DEVE verificarla. Se ci casca, punti bonus!', points: 25, requiresDiscovery: 'BUG_D1', hint: '💡 Fallo cercare su Google qualcosa che non esiste' }
      ]
    }
  },

  factchecker: {
    id: 'factchecker',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Fact Checker',
    emoji: '🔍',
    color: 'from-cyan-400 to-cyan-600',
    pairWith: 'bugiardo',
    description: `Niente ti sfugge. Ogni affermazione va VERIFICATA.

Wikipedia, Google, studi scientifici... hai tutto a portata di mano.
E quando qualcuno sbaglia? Glielo fai notare. SEMPRE.`,
    objectives: {
      personal: [
        { id: 'FAC_P1', text: 'Correggi qualcuno su un FATTO, verificandolo col telefono', points: 15, hint: '💡 "Aspetta, fammi verificare... ECCO! Avevo ragione io!"' },
        { id: 'FAC_P2', text: 'Di\' "Fonte?" quando qualcuno afferma qualcosa', points: 10, hint: '💡 Anche per cose ovvie' },
        { id: 'FAC_P3', text: 'Cerca qualcosa su WIKIPEDIA e leggi ad alta voce', points: 15, hint: '💡 "Wikipedia dice che..."' }
      ],
      discovery: [
        { id: 'FAC_D1', text: 'Scopri chi è il BUGIARDO COMPULSIVO', points: 15, targetRole: 'bugiardo', hint: '💡 Chi racconta storie incredibili? Chi esagera sempre?' }
      ],
      interaction: [
        { id: 'FAC_I1', text: 'SMASCHERALO pubblicamente: "Ho verificato e NON È VERO!"', points: 25, requiresDiscovery: 'FAC_D1', hint: '💡 La soddisfazione del fact-checking!' }
      ]
    }
  },

  competitivo: {
    id: 'competitivo',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Competitivo',
    emoji: '💪',
    color: 'from-yellow-500 to-yellow-700',
    pairWith: 'pacifista',
    description: `TUTTO è una gara. Anche mangiare. SOPRATTUTTO mangiare.

Chi finisce prima? Chi beve di più? Chi racconta la storia migliore?
La vita è una competizione e tu vuoi VINCERE.`,
    objectives: {
      personal: [
        { id: 'CMP_P1', text: 'SFIDA qualcuno in qualcosa (braccio di ferro, bere, finire il piatto...)', points: 20, hint: '💡 "Scommetto che ti batto a..."' },
        { id: 'CMP_P2', text: 'Di\' "Io l\'avrei fatto MEGLIO" almeno una volta', points: 10, hint: '💡 Qualsiasi cosa, dal cucinare al parcheggiare' },
        { id: 'CMP_P3', text: 'VINCI una sfida qualsiasi (inventala tu se serve!)', points: 20, hint: '💡 Vinci a tutti i costi!' }
      ],
      discovery: [
        { id: 'CMP_D1', text: 'Scopri chi è il PACIFISTA', points: 15, targetRole: 'pacifista', hint: '💡 Chi evita i conflitti? Chi dice sempre "va bene tutto"?' }
      ],
      interaction: [
        { id: 'CMP_I1', text: 'SFIDALO a qualcosa finché non accetta (deve cedere!)', points: 25, requiresDiscovery: 'CMP_D1', hint: '💡 Insisti finché non cede per farti contento' }
      ]
    }
  },

  pacifista: {
    id: 'pacifista',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Pacifista',
    emoji: '☮️',
    color: 'from-lime-400 to-lime-600',
    pairWith: 'competitivo',
    description: `Tu vuoi solo pace e armonia. Niente conflitti. Niente gare.

"Va bene tutto" è il tuo motto. "Come preferisci tu" la tua risposta preferita.
Perché litigare quando possiamo andare tutti d'accordo?`,
    objectives: {
      personal: [
        { id: 'PAC_P1', text: 'Di\' "Va bene tutto" o "Come preferisci" almeno 3 VOLTE', points: 10, hint: '💡 La risposta a tutto' },
        { id: 'PAC_P2', text: 'MEDIA un "conflitto" tra due persone (anche inventato)', points: 15, hint: '💡 "Dai ragazzi, avete ragione entrambi..."' },
        { id: 'PAC_P3', text: 'RIFIUTA una sfida o competizione dicendo "Non mi interessa vincere"', points: 15, hint: '💡 L\'anti-competitivo per eccellenza' }
      ],
      discovery: [
        { id: 'PAC_D1', text: 'Scopri chi è il COMPETITIVO', points: 15, targetRole: 'competitivo', hint: '💡 Chi vuole sempre vincere? Chi sfida tutti?' }
      ],
      interaction: [
        { id: 'PAC_I1', text: 'CALMALO dopo una sfida: "L\'importante è partecipare, dai..."', points: 20, requiresDiscovery: 'PAC_D1', hint: '💡 Sarà frustratissimo, ma tu resta zen' }
      ]
    }
  },

  mistico: {
    id: 'mistico',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Mistico',
    emoji: '🔮',
    color: 'from-violet-400 to-violet-600',
    pairWith: 'scettico',
    description: `Tu SENTI cose che gli altri non sentono. Vedi aure. Percepisci energie.

I segni zodiacali spiegano TUTTO. Mercurio retrogrado è sempre colpa sua.
Oggi le stelle dicono che... sarà un pranzo interessante.`,
    objectives: {
      personal: [
        { id: 'MIS_P1', text: 'Chiedi il SEGNO ZODIACALE a qualcuno e commenta ("Ah! Tipico Scorpione...")', points: 10, hint: '💡 Ogni comportamento è spiegabile con il segno' },
        { id: 'MIS_P2', text: 'Di\' "Lo sapevo, sentivo una STRANA ENERGIA oggi"', points: 15, hint: '💡 Dopo qualsiasi evento, grande o piccolo' },
        { id: 'MIS_P3', text: 'Fai una PREVISIONE su qualcosa che succederà durante il pranzo', points: 15, hint: '💡 "Sento che qualcuno rovescerà qualcosa..."' }
      ],
      discovery: [
        { id: 'MIS_D1', text: 'Scopri chi è lo SCETTICO', points: 15, targetRole: 'scettico', hint: '💡 Chi alza gli occhi al cielo? Chi dice "ma dai..."?' }
      ],
      interaction: [
        { id: 'MIS_I1', text: 'LEGGIGLI la mano o fagli una previsione personale finché non reagisce!', points: 25, requiresDiscovery: 'MIS_D1', hint: '💡 Insisti anche se sbuffa!' }
      ]
    }
  },

  scettico: {
    id: 'scettico',
    type: ROLE_TYPES.REGULAR,
    name: 'Lo Scettico',
    emoji: '🧪',
    color: 'from-slate-400 to-slate-600',
    pairWith: 'mistico',
    description: `Tu credi solo nella SCIENZA. Nei FATTI. Nelle PROVE.

Oroscopi? Superstizioni. Energia? Pseudoscienza.
Qualcuno deve pur portare razionalità in questo mondo!`,
    objectives: {
      personal: [
        { id: 'SCE_P1', text: 'Di\' "Non ci sono prove scientifiche" su qualcosa', points: 15, hint: '💡 Qualsiasi affermazione vagamente mistica' },
        { id: 'SCE_P2', text: 'SBUFFA o alza gli occhi al cielo visibilmente quando qualcuno dice qualcosa di "mistico"', points: 10, hint: '💡 Fatti vedere!' },
        { id: 'SCE_P3', text: 'Inizia una frase con "In realtà, razionalmente parlando..."', points: 15, hint: '💡 Il razionalista del gruppo' }
      ],
      discovery: [
        { id: 'SCE_D1', text: 'Scopri chi è il MISTICO', points: 15, targetRole: 'mistico', hint: '💡 Chi parla di segni zodiacali? Chi "sente energie"?' }
      ],
      interaction: [
        { id: 'SCE_I1', text: 'CONTRADDICILO pubblicamente su qualcosa di mistico: "Questo non ha senso!"', points: 25, requiresDiscovery: 'SCE_D1', hint: '💡 Scienza vs Misticismo: FIGHT!' }
      ]
    }
  },

  critico: {
    id: 'critico',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Critico Gastronomico',
    emoji: '🍝',
    color: 'from-amber-400 to-amber-600',
    pairWith: 'chef_mancato',
    description: `Ogni boccone merita una RECENSIONE. Sei il Gordon Ramsay del gruppo.

Cottura, presentazione, equilibrio dei sapori... niente ti sfugge.
Oggi il pranzo sarà... GIUDICATO.`,
    objectives: {
      personal: [
        { id: 'CRI_P1', text: 'Commenta il cibo in modo "professionale" almeno 3 VOLTE', points: 10, hint: '💡 "Buona texture, forse manca un po\' di acidità..."' },
        { id: 'CRI_P2', text: 'Chiedi un INGREDIENTE specifico di qualcosa', points: 10, hint: '💡 "C\'è rosmarino qui? Lo sento ma non ne sono sicuro..."' },
        { id: 'CRI_P3', text: 'Di\' "Nel ristorante dove vado io..." almeno una volta', points: 15, hint: '💡 Il paragone snob' },
        { id: 'CRI_P4', text: 'Fai un "MMMH" esageratissimo assaggiando qualcosa', points: 15, hint: '💡 Come nelle pubblicità del cibo' }
      ],
      discovery: [
        { id: 'CRI_D1', text: 'Scopri chi è lo CHEF MANCATO', points: 15, targetRole: 'chef_mancato', hint: '💡 Chi dice "io l\'avrei fatto diverso"? Chi dà consigli non richiesti?' }
      ],
      interaction: [
        { id: 'CRI_I1', text: 'DIBATTITO CULINARIO: criticate insieme un piatto (uno troppo, uno troppo poco)!', points: 25, requiresDiscovery: 'CRI_D1', hint: '💡 "Troppo salato!" - "Ma no, è perfetto! Anzi poco!"' }
      ]
    }
  },

  chef_mancato: {
    id: 'chef_mancato',
    type: ROLE_TYPES.REGULAR,
    name: 'Lo Chef Mancato',
    emoji: '👨‍🍳',
    color: 'from-white to-gray-200',
    pairWith: 'critico',
    description: `Saresti dovuto diventare chef. Il mondo ha perso un TALENTO.

Ogni piatto che vedi, l'avresti fatto MEGLIO.
Ogni ricetta, avresti aggiunto quel qualcosa in più.`,
    objectives: {
      personal: [
        { id: 'CHE_P1', text: 'Di\' "Io l\'avrei fatto con..." dando un suggerimento non richiesto', points: 15, hint: '💡 Un pizzico di pepe, più aglio, meno sale...' },
        { id: 'CHE_P2', text: 'Racconta di quella volta che hai cucinato qualcosa di INCREDIBILE', points: 15, hint: '💡 La carbonara leggendaria, il tiramisù perfetto...' },
        { id: 'CHE_P3', text: 'Offri di INSEGNARE una ricetta a qualcuno', points: 10, hint: '💡 "Guarda ti faccio vedere come si fa..."' }
      ],
      discovery: [
        { id: 'CHE_D1', text: 'Scopri chi è il CRITICO GASTRONOMICO', points: 15, targetRole: 'critico', hint: '💡 Chi giudica tutto? Chi fa "mmmh" quando assaggia?' }
      ],
      interaction: [
        { id: 'CHE_I1', text: 'CHIEDI IL SUO PARERE da "esperto" su una tua ricetta (inventata o vera)', points: 20, requiresDiscovery: 'CHE_D1', hint: '💡 "Tu che te ne intendi, secondo te..."' }
      ]
    }
  },

  social_media: {
    id: 'social_media',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Social Media Manager',
    emoji: '📱',
    color: 'from-pink-500 to-rose-500',
    pairWith: 'boomer',
    description: `Se non è su Instagram, NON È SUCCESSO.

Ogni momento deve essere "content". Ogni foto deve essere "postabile".
Sei il documentarista ufficiale dell'era digitale.`,
    objectives: {
      personal: [
        { id: 'SOC_P1', text: 'Di\' "Aspetta devo fare una STORIA" almeno 2 volte', points: 10, hint: '💡 Documenta tutto!' },
        { id: 'SOC_P2', text: 'Suggerisci una POSA o inquadratura migliore per una foto', points: 15, hint: '💡 "No aspetta, mettiti più così, gira la luce..."' },
        { id: 'SOC_P3', text: 'Chiedi la PASSWORD del wifi appena arrivi (se non l\'hai già fatto)', points: 10, hint: '💡 Priorità assoluta' },
        { id: 'SOC_P4', text: 'Mostra un REEL o TIKTOK a qualcuno', points: 10, hint: '💡 "Guarda questo è geniale!"' }
      ],
      discovery: [
        { id: 'SOC_D1', text: 'Scopri chi è il BOOMER TECNOLOGICO', points: 15, targetRole: 'boomer', hint: '💡 Chi non capisce le stories? Chi dice "ai miei tempi"?' }
      ],
      interaction: [
        { id: 'SOC_I1', text: 'INSEGNAGLI qualcosa di tecnologico (anche inutile) finché non sbuffa!', points: 25, requiresDiscovery: 'SOC_D1', hint: '💡 "Dai ti faccio vedere come si fa il boomerang..."' }
      ]
    }
  },

  boomer: {
    id: 'boomer',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Boomer Tecnologico',
    emoji: '📠',
    color: 'from-stone-400 to-stone-600',
    pairWith: 'social_media',
    description: `"Ai miei tempi era tutto più semplice."

Instagram, TikTok, stories... Che ci sarà mai da postare?
Tu preferisci le cose VERE. Le telefonate. Le foto stampate.`,
    objectives: {
      personal: [
        { id: 'BOO_P1', text: 'Di\' "Ai miei tempi..." almeno UNA volta', points: 10, hint: '💡 Qualsiasi argomento va bene' },
        { id: 'BOO_P2', text: 'LAMENTATI dei social media o della tecnologia', points: 15, hint: '💡 "Sempre con quel telefono in mano..."' },
        { id: 'BOO_P3', text: 'Chiedi AIUTO per qualcosa di tecnologico (anche se lo sai fare)', points: 15, hint: '💡 "Come si manda la foto su WhatsApp?"' },
        { id: 'BOO_P4', text: 'Di\' "Non capisco cosa ci trovate in [app/trend]"', points: 10, hint: '💡 TikTok, Instagram, qualsiasi cosa' }
      ],
      discovery: [
        { id: 'BOO_D1', text: 'Scopri chi è il SOCIAL MEDIA MANAGER', points: 15, targetRole: 'social_media', hint: '💡 Chi fa sempre stories? Chi ha sempre il telefono in mano?' }
      ],
      interaction: [
        { id: 'BOO_I1', text: 'RIFIUTA di farti fare una foto/storia da lui: "Eh no, a me non mi postate!"', points: 20, requiresDiscovery: 'BOO_D1', hint: '💡 Resisti alla documentazione digitale!' }
      ]
    }
  },

  random: {
    id: 'random',
    type: ROLE_TYPES.REGULAR,
    name: 'Il Random',
    emoji: '🎲',
    color: 'from-fuchsia-400 to-fuchsia-600',
    pairWith: 'ordinato',
    description: `Fai cose a caso. Dici cose a caso. SEI il caos incarnato.

Nessuno sa cosa farai. Nemmeno tu.
Il pranzo sarà... imprevedibile!`,
    objectives: {
      personal: [
        { id: 'RAN_P1', text: 'Cambia ARGOMENTO bruscamente con qualcosa di completamente SCOLLEGATO', points: 15, hint: '💡 "Parlando di pasta... voi ci credete agli alieni?"' },
        { id: 'RAN_P2', text: 'Fai un VERSO di animale random durante una conversazione', points: 20, hint: '💡 Muuu, bau, coccodè... a caso!' },
        { id: 'RAN_P3', text: 'ALZATI e siediti in un posto DIVERSO senza spiegare perché', points: 15, hint: '💡 Semplicemente spostati. Zero spiegazioni.' },
        { id: 'RAN_P4', text: 'Di\' una parola INVENTATA e usala come se esistesse', points: 15, hint: '💡 "Questa pasta è molto scrumbulosa!"' }
      ],
      discovery: [
        { id: 'RAN_D1', text: 'Scopri chi è l\'ORDINATO', points: 15, targetRole: 'ordinato', hint: '💡 Chi sistema tutto? Chi si stressa per il disordine?' }
      ],
      interaction: [
        { id: 'RAN_I1', text: 'SPOSTALAGLI qualcosa dalla sua posizione ordinata e guarda la reazione!', points: 25, requiresDiscovery: 'RAN_D1', hint: '💡 Metti il bicchiere storto, sposta la forchetta...' }
      ]
    }
  },

  ordinato: {
    id: 'ordinato',
    type: ROLE_TYPES.REGULAR,
    name: 'L\'Ordinato',
    emoji: '📐',
    color: 'from-blue-300 to-blue-500',
    pairWith: 'random',
    description: `Tutto deve essere al suo POSTO. Sempre. SEMPRE.

Posate allineate. Bicchieri paralleli. Tovaglioli piegati.
Il caos ti fa star male.`,
    objectives: {
      personal: [
        { id: 'ORD_P1', text: 'SISTEMA qualcosa sul tavolo (posate, bicchieri, tovaglioli)', points: 10, hint: '💡 Anche cose non tue' },
        { id: 'ORD_P2', text: 'Fai notare che qualcosa è STORTO o fuori posto', points: 15, hint: '💡 "Scusa ma quel quadro è storto..."' },
        { id: 'ORD_P3', text: 'Offri di AIUTARE a riordinare o sparecchiare', points: 10, hint: '💡 Prima che qualcuno te lo chieda' },
        { id: 'ORD_P4', text: 'Di\' "Ma come fate a vivere così?" riferito a qualcosa di disordinato', points: 15, hint: '💡 Giudizio silenzioso diventato vocale' }
      ],
      discovery: [
        { id: 'ORD_D1', text: 'Scopri chi è il RANDOM', points: 15, targetRole: 'random', hint: '💡 Chi fa cose senza senso? Chi cambia argomento a caso?' }
      ],
      interaction: [
        { id: 'ORD_I1', text: 'RIMETTI IN ORDINE qualcosa che lui ha spostato/disordinato, commentando!', points: 20, requiresDiscovery: 'ORD_D1', hint: '💡 "Scusa ma questo non può stare così..."' }
      ]
    }
  }
};

export function assignRoles(playerIds, useAccomplice = true) {
  const numPlayers = playerIds.length;
  const shuffledPlayers = [...playerIds].sort(() => Math.random() - 0.5);

  const assignments = {};
  let roleIndex = 0;

  // 1. Assign Millionaire (always)
  assignments[shuffledPlayers[roleIndex++]] = 'millionaire';

  // 2. Assign Accomplice (only for 12+ players AND if enabled)
  const useAccompliceRole = useAccomplice && numPlayers >= 12;
  if (useAccompliceRole) {
    assignments[shuffledPlayers[roleIndex++]] = 'accomplice';
    // Second accomplice for 16+ players
    if (numPlayers >= 16) {
      assignments[shuffledPlayers[roleIndex++]] = 'accomplice';
    }
  }

  // 3. Prepare regular roles (prioritizing pairs)
  const regularRoles = [];
  const usedRoles = new Set();

  // First add complete pairs
  for (const [role1, role2] of ROLE_PAIRS) {
    if (!usedRoles.has(role1) && !usedRoles.has(role2)) {
      regularRoles.push(role1, role2);
      usedRoles.add(role1);
      usedRoles.add(role2);
    }
    if (regularRoles.length >= numPlayers - roleIndex) break;
  }

  // Shuffle regular roles
  regularRoles.sort(() => Math.random() - 0.5);

  // 4. Assign regular roles to remaining players
  for (let i = roleIndex; i < numPlayers; i++) {
    const role = regularRoles[i - roleIndex];
    if (role) {
      assignments[shuffledPlayers[i]] = role;
    }
  }

  return assignments;
}

export function calculateScores(players, votes) {
  const scores = {};

  // Find millionaire
  const millionaire = players.find(p => p.role_id === 'millionaire');
  const accomplices = players.filter(p => p.role_id === 'accomplice');

  // Count votes for millionaire
  const votesForMillionaire = votes.filter(v => v.vote_target_id === millionaire?.id).length;
  const totalVoters = votes.length;
  const votePercentage = totalVoters > 0 ? (votesForMillionaire / totalVoters) * 100 : 0;

  // Calculate scores for each player
  for (const player of players) {
    let score = 0;
    const role = ROLES[player.role_id];

    if (!role) continue;

    // 1. Points for completed objectives
    const objectives = [
      ...(role.objectives.personal || []),
      ...(role.objectives.discovery || []),
      ...(role.objectives.interaction || [])
    ];

    for (const obj of objectives) {
      const status = player.objectives_status?.[obj.id];
      if (status?.completed) {
        score += obj.points;

        // Bonus for correct discovery
        if (obj.targetRole && status.tagged_player_id) {
          const taggedPlayer = players.find(p => p.id === status.tagged_player_id);
          if (taggedPlayer?.role_id === obj.targetRole) {
            score += 10; // Bonus for correct discovery
          }
        }
      }
    }

    // 2. Special scoring for roles
    if (player.role_id === 'millionaire') {
      // Millionaire: bonus if not caught
      if (votePercentage < 40) {
        score += role.scoring.notCaught;
      } else if (votePercentage <= 60) {
        score += role.scoring.partiallyCaught;
      }
      // If caught (>60%): no bonus
    } else if (player.role_id === 'accomplice') {
      // Accomplice: bonus based on millionaire
      if (votePercentage < 40) {
        score += role.scoring.millionaireSafe;
      } else if (votePercentage <= 60) {
        score += role.scoring.millionairePartial;
      }
    } else {
      // Other players: bonus if they voted for millionaire
      const playerVote = votes.find(v => v.player_id === player.id);
      if (playerVote?.vote_target_id === millionaire?.id) {
        score += 25; // Bonus for guessing millionaire
      }
    }

    scores[player.id] = score;
  }

  return scores;
}

export function canCompleteObjective(objective, objectivesStatus) {
  // If requires discovery, verify it was done
  if (objective.requiresDiscovery) {
    const discoveryStatus = objectivesStatus?.[objective.requiresDiscovery];
    if (!discoveryStatus?.tagged_player_id) {
      return false;
    }
  }
  return true;
}

export function getRoleById(roleId) {
  return ROLES[roleId] || null;
}

export function getAllObjectives(role) {
  if (!role) return [];
  return [
    ...(role.objectives.personal || []),
    ...(role.objectives.discovery || []),
    ...(role.objectives.interaction || [])
  ];
}

export function getObjectivesByType(role, type) {
  if (!role || !role.objectives) return [];
  return role.objectives[type] || [];
}
