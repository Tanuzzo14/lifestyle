# Configurazione AI con Cloudflare Worker

## Panoramica

Questa applicazione utilizza **Cloudflare Worker** come proxy sicuro per tutte le chiamate AI. Nessuna chiave API è esposta nel codice client, garantendo massima sicurezza.

## Architettura

```
[Frontend (index.html/pro.html)]
          ↓
    [config.js]
          ↓
[Cloudflare Worker]
          ↓
   [Google Gemini API]
```

### Vantaggi

- ✅ **Sicurezza**: Chiavi API mai esposte nel client
- ✅ **Centralizzato**: Configurazione in un unico punto (config.js)
- ✅ **Semplice**: Nessun file config.json necessario
- ✅ **Affidabile**: Gestione errori in italiano

## Configurazione

### File Principali

#### 1. `config.js` - Configurazione Centralizzata

```javascript
const AI_PROVIDER_CONFIG = {
    name: 'cloudflare',
    endpoint: "https://lifestyle-be.gaetanosmario.workers.dev/",
    description: "Cloudflare Worker per proxy API AI sicuro"
};

async function callGemini(prompt) {
    // Chiama il Cloudflare Worker
    // Gestisce errori in italiano
}
```

**Importante**: Questo file contiene TUTTA la configurazione AI. Non serve config.json.

#### 2. Cloudflare Worker (Backend)

Il Cloudflare Worker deve essere configurato con:

**Variabili d'ambiente richieste:**
```
GEMINI_API_KEY = "la-tua-chiave-api-google"
```

**Worker code example:**
```javascript
export default {
    async fetch(request, env) {
        const GEMINI_API_KEY = env.GEMINI_API_KEY;
        
        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({
                error: "GEMINI_API_KEY non configurata nel Worker"
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
        
        // Proxy della richiesta a Google Gemini
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const body = await request.json();
        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        
        return response;
    }
};
```

## Utilizzo nell'Applicazione

### Generazione Piano Allenamento

```javascript
// In index.html o pro.html
async function generateAIWorkoutPlan() {
    try {
        const prompt = `Crea un piano di allenamento...`;
        const data = await callGemini(prompt);
        // Processa la risposta
    } catch (error) {
        console.error('Errore:', error.message);
        // Messaggio già in italiano grazie a config.js
    }
}
```

### Gestione Errori

Il `config.js` traduce automaticamente gli errori in italiano:

| Errore | Messaggio Italiano |
|--------|-------------------|
| 401/403 | Errore di autenticazione: verifica la configurazione del Cloudflare Worker |
| 429 | Troppi richieste: riprova tra qualche minuto |
| 500/502/503 | Servizio temporaneamente non disponibile: riprova più tardi |
| Network | Errore di connessione: verifica la tua connessione internet |

## Test

### File di Test: `test_gemini_direct.html`

Questo file testa la connessione al Cloudflare Worker:

1. Apri `test_gemini_direct.html` nel browser
2. Verifica che la configurazione sia caricata
3. Clicca "Test Connessione AI Worker"
4. Controlla la risposta

**Output atteso:**
```
✓ Connessione Cloudflare AI Worker riuscita!
Il sistema AI è configurato correttamente e funziona.
```

## Risoluzione Problemi

### Errore: "GEMINI_API_KEY is not defined"

**Causa**: La variabile d'ambiente GEMINI_API_KEY non è configurata nel Cloudflare Worker.

**Soluzione**:
1. Vai su Cloudflare Dashboard
2. Seleziona il Worker `lifestyle-be`
3. Vai su "Settings" → "Variables"
4. Aggiungi variabile d'ambiente:
   - Nome: `GEMINI_API_KEY`
   - Valore: La tua chiave API Google Gemini
5. Salva e redeploy il Worker

### Errore: "Errore di connessione"

**Cause possibili**:
- Internet non disponibile
- Cloudflare Worker offline
- URL del Worker errato in config.js

**Soluzione**:
1. Verifica connessione internet
2. Controlla che l'URL in `config.js` sia corretto
3. Testa il Worker direttamente con curl:
   ```bash
   curl -X POST https://lifestyle-be.gaetanosmario.workers.dev/ \
        -H "Content-Type: application/json" \
        -d '{"contents":[{"role":"user","parts":[{"text":"test"}]}]}'
   ```

### Errore: "Troppi richieste"

**Causa**: Quota API Google Gemini esaurita.

**Soluzione**:
- Attendi qualche minuto
- Verifica le quote nel Google Cloud Console
- Aumenta la quota se necessario

## Migrazione da Vecchia Configurazione

Se hai la vecchia configurazione con `config.json`:

### Prima (❌ Deprecato)
```javascript
// config.js caricava config.json
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        GEMINI_API_KEY = config.GEMINI_API_KEY;
        // Chiamata diretta a Google
    });
```

### Ora (✅ Corretto)
```javascript
// config.js usa direttamente Cloudflare
const AI_PROVIDER_CONFIG = {
    name: 'cloudflare',
    endpoint: "https://lifestyle-be.gaetanosmario.workers.dev/"
};

async function callGemini(prompt) {
    // Chiama Cloudflare Worker
}
```

**Azioni necessarie:**
1. ✅ File `config.json` non più necessario (può essere eliminato)
2. ✅ Nessuna chiave API nel frontend
3. ✅ Tutto gestito da config.js

## Sicurezza

### ✅ Cosa È Sicuro

- Chiavi API solo nel Cloudflare Worker (backend)
- Nessuna chiave esposta nel client
- Errori non rivelano informazioni sensibili

### ⚠️ Da Verificare

- Cloudflare Worker deve avere la variabile `GEMINI_API_KEY` configurata
- Limitare le richieste al Worker (rate limiting)
- Monitorare l'uso dell'API Google Gemini

## Riferimenti

- **Cloudflare Workers**: https://workers.cloudflare.com/
- **Google Gemini API**: https://ai.google.dev/
- **Worker URL**: https://lifestyle-be.gaetanosmario.workers.dev/

## Domande Frequenti

**D: Devo creare un file config.json?**  
R: No, non serve più. Tutto è in config.js.

**D: Come aggiungo la chiave API?**  
R: La chiave va nel Cloudflare Worker, NON nel frontend.

**D: Posso usare un altro provider AI?**  
R: Sì, modifica solo `AI_PROVIDER_CONFIG.endpoint` in config.js.

**D: Gli errori sono in italiano?**  
R: Sì, config.js traduce automaticamente tutti gli errori.

---

**Versione**: 2.0 (Cloudflare-only)  
**Data**: 2025-01-19  
**Autore**: Sistema di configurazione AI centralizzato
