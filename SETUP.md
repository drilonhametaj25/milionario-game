# Setup - Chi è il Milionario?

## Quick Start

### 1. Setup Supabase

1. Vai su https://supabase.com e crea un account (gratis)
2. Clicca "New Project" e scegli un nome e password
3. Attendi ~2 minuti per il provisioning
4. Vai su **SQL Editor** ed esegui il contenuto di `supabase-schema.sql`
5. Vai su **Settings → API** e copia:
   - Project URL
   - anon/public key

### 2. Configura le variabili d'ambiente

Modifica il file `.env` con le tue credenziali:

```env
VITE_SUPABASE_URL=https://TUO-PROGETTO.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-chiave-anonima
```

### 3. Avvia in locale

```bash
npm install
npm run dev
```

### 4. Deploy su Vercel

1. Crea un account su https://vercel.com
2. Collega il tuo repository GitHub
3. Nelle impostazioni del progetto, aggiungi le variabili d'ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Come si gioca

1. Un giocatore crea una stanza e condivide il codice/link
2. Gli altri giocatori si uniscono (minimo 6 giocatori)
3. L'host avvia la partita
4. Ogni giocatore riceve un ruolo segreto con obiettivi
5. Durante il pranzo/cena, completate gli obiettivi!
6. Alla fine, l'host avvia la votazione
7. Tutti votano chi pensano sia il Milionario
8. Reveal finale con punteggi!

## Ruoli

- **Milionario (1)**: Deve completare obiettivi "rischiosi" senza farsi scoprire
- **Complice (1-2, solo 12+ giocatori)**: Conosce il Milionario e lo protegge
- **Ruoli regolari (20 diversi)**: Hanno obiettivi interconnessi a coppie

## Troubleshooting

### "Stanza non trovata"
- Verifica che il codice sia corretto (6 caratteri)
- Controlla che la stanza non sia stata eliminata

### Problemi di connessione
- Verifica le credenziali Supabase nel file `.env`
- Controlla che RLS sia configurato correttamente
- Verifica che Realtime sia abilitato per entrambe le tabelle

### I voti non si aggiornano
- Controlla che Realtime sia abilitato in Supabase
- Ricarica la pagina

Buon divertimento! 🎉
