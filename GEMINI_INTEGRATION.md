# Gemini Integration per Standardizzazione Formati

## Panoramica

Questa integrazione utilizza l'API di Google Gemini (gemini-2.0-flash) per standardizzare automaticamente tutti i formati di file importati nel sistema Lifestyle Designer, convertendoli nel formato JSON utilizzato dall'applicazione.

## Funzionalità Implementate

### 1. Standardizzazione Piani di Allenamento

**Formato JSON di Output:**
```json
[
  {
    "day": "GIORNO A",
    "exercise": "PANCA PIANA",
    "sets": 3,
    "reps": 10,
    "load": "60KG"
  }
]
```

**Formati di Input Supportati:**
- Testo semplice (riga per riga)
- CSV (Giorno, Esercizio, Serie, Reps, Carico)
- JSON personalizzati
- File PDF, DOC, DOCX, TXT
- Qualsiasi formato testuale contenente informazioni su allenamenti

### 2. Standardizzazione Piani Dieta

**Formato JSON di Output:**
```json
[
  {
    "day": "LUNEDÌ",
    "meals": [
      {
        "category": "COLAZIONE",
        "description": "UOVA E PANE",
        "weight": "200G",
        "type": "RICETTA",
        "calories": 450
      }
    ]
  }
]
```

**Formati di Input Supportati:**
- CSV (Giorno, Tipologia, Descrizione, Grammatura, Altro, KCAL)
- Testo semplice
- JSON personalizzati
- File PDF, DOC, DOCX, TXT, CSV
- Qualsiasi formato testuale contenente informazioni nutrizionali

## Implementazione Tecnica

### Funzioni Principali

#### `standardizeWorkoutWithGemini(textContent)`
Converte qualsiasi formato di piano di allenamento nel formato JSON standardizzato dell'applicazione.

#### `standardizeDietWithGemini(textContent)`
Converte qualsiasi formato di piano dieta nel formato JSON standardizzato dell'applicazione.

### Integrazione nei Punti di Importazione

L'integrazione è stata implementata in tutte le seguenti funzionalità:

#### index.html (Vista Utente)
1. **Upload File Allenamento** (`uploadWorkoutFile`)
   - Carica file e li processa con Gemini
   - Aggiunge automaticamente gli esercizi al piano

2. **Importa Testo Allenamento** (`importWorkoutPlan`)
   - Usa Gemini per standardizzare il testo incollato
   - Fallback su parser manuale se Gemini non disponibile

3. **Upload File Dieta** (`uploadDietFile`)
   - Carica file dieta e li processa con Gemini
   - Aggiorna automaticamente il piano settimanale

4. **Importa Testo Dieta** (`importDietPlan`)
   - Usa Gemini per standardizzare il piano dieta
   - Fallback su parser manuale se Gemini non disponibile

#### pro.html (Vista Professionista)
1. **Upload File per Clienti** (`uploadFile`)
   - Supporta upload di file workout e diet per clienti
   - Processa con Gemini e salva automaticamente

2. **Importa Testo Allenamento Cliente** (`importWorkoutPlan`)
   - Standardizza e salva piani per clienti specifici

3. **Importa Testo Dieta Cliente** (`importDietPlan`)
   - Standardizza e salva piani dieta per clienti specifici

### Meccanismo di Fallback

Tutte le funzioni implementano un meccanismo di fallback robusto:

```javascript
try {
  // Tenta standardizzazione con Gemini
  const standardizedData = await standardizeWorkoutWithGemini(content);
  // Usa i dati standardizzati
} catch (geminiError) {
  console.log('Gemini standardization failed, falling back to manual parsing');
  // Fallback su parser manuale originale
  // ... logica di parsing manuale ...
}
```

Questo garantisce che l'applicazione continui a funzionare anche se:
- L'API Gemini è temporaneamente non disponibile
- Il token API è invalido o scaduto
- Ci sono problemi di rete
- Il formato del file non è supportato da Gemini

## Configurazione API

**IMPORTANTE: Configurazione Sicura Implementata**

La chiave API Gemini è ora gestita in modo sicuro lato server. La configurazione è stata completamente ristrutturata per proteggere la chiave API.

### File di Configurazione

1. **config.php** - Contiene la chiave API (NON committato in Git)
2. **config.php.example** - Template per la configurazione
3. **gemini_proxy.php** - Proxy PHP per le chiamate API sicure
4. **config.js** - Configurazione client (contiene solo URL del proxy)

### Setup

```bash
# Copia il template di configurazione
cp config.php.example config.php

# Modifica config.php e inserisci la tua chiave API
# define('GEMINI_API_KEY', 'la-tua-chiave-api-qui');
```

### Architettura Sicura

```
Client (Browser) → gemini_proxy.php (Server) → Google Gemini API
                      ↑
                      Legge la chiave da config.php
```

### Vantaggi

1. **Chiave API Protetta**: Mai esposta al client
2. **Centralizzata**: Facile da gestire e ruotare
3. **Sicura in Git**: config.php è escluso dal version control
4. **Validazione Server-Side**: Possibilità di aggiungere autenticazione e rate limiting

### Modello Utilizzato
- **Modello**: `gemini-2.0-flash`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Proxy Locale**: `gemini_proxy.php`
- **Prompt**: Ottimizzati per ogni tipo di conversione

## Vantaggi dell'Integrazione

1. **Flessibilità**: Accetta praticamente qualsiasi formato di input
2. **Intelligenza**: Comprende contesto e strutture complesse
3. **Robustezza**: Meccanismo di fallback garantisce sempre funzionalità
4. **Standardizzazione**: Output sempre nel formato atteso
5. **Multi-lingua**: Gestisce testi in diverse lingue
6. **Conversione Automatica**: Tutto in UPPERCASE come richiesto dall'app

## Esempi di Utilizzo

### Importare un Piano di Allenamento

1. Navigare alla sezione "ALLENAMENTO"
2. Cliccare su "INCOLLA TESTO / IMPORTA"
3. Incollare il piano in qualsiasi formato (es. da Word, Excel, PDF copiato)
4. Cliccare "IMPORTA PIANO"
5. Il sistema userà Gemini per standardizzare e importare automaticamente

### Caricare un File Dieta

1. Navigare alla sezione "DIETA"
2. Cliccare su "Choose File" in "CARICA PIANO / FILE"
3. Selezionare un file (PDF, DOC, CSV, TXT, etc.)
4. Il sistema processerà il file con Gemini e importerà il piano

## Note di Sicurezza

✅ **IMPLEMENTATO - Sicurezza Migliorata**: La chiave API è ora gestita in modo sicuro lato server!

### Implementazione Corrente

La soluzione sicura è stata implementata con i seguenti componenti:

1. **config.php**: File di configurazione server-side (escluso da Git)
   - Contiene la chiave API Gemini
   - Mai esposto al client
   - Protetto tramite .gitignore

2. **gemini_proxy.php**: Proxy server-side per le chiamate API
   - Riceve richieste dal client
   - Aggiunge la chiave API in modo sicuro
   - Inoltra la richiesta a Google Gemini
   - Restituisce la risposta al client

3. **config.js**: Configurazione client-side (aggiornata)
   - Contiene solo l'URL del proxy locale
   - Nessuna chiave API esposta

### Vantaggi della Soluzione

✓ **Sicurezza**: La chiave API non è mai visibile nel browser  
✓ **Centralizzazione**: Facile gestione e rotazione delle chiavi  
✓ **Version Control**: config.php escluso automaticamente da Git  
✓ **Scalabilità**: Possibilità di aggiungere autenticazione e rate limiting  
✓ **Compatibilità**: Nessun cambiamento necessario nel codice client esistente

### Setup per Deployment

```bash
# 1. Copia il template di configurazione
cp config.php.example config.php

# 2. Modifica config.php con la tua chiave API
nano config.php

# 3. Imposta i permessi corretti (opzionale, consigliato su Linux)
chmod 600 config.php

# 4. Testa la configurazione
./test_gemini_setup.sh
```

### File di Test

È disponibile uno script di test per verificare la configurazione:

```bash
chmod +x test_gemini_setup.sh
./test_gemini_setup.sh
```

Lo script verifica:
- Presenza di config.php
- Esclusione da Git
- Validità della configurazione PHP
- Assenza di chiavi hardcoded in config.js
- Utilizzo corretto del proxy nei file HTML

### Migrazione da Configurazione Precedente

Se stai aggiornando da una versione precedente con chiavi hardcoded:

1. ✅ Le chiavi hardcoded sono state rimosse da config.js
2. ✅ Tutti i file HTML sono stati aggiornati per usare il proxy
3. ✅ È stato creato config.php con la chiave API
4. ✅ config.php è stato aggiunto a .gitignore

Non sono necessarie azioni manuali - il sistema è già configurato in modo sicuro!

## Testing

Il sistema è stato testato con:
- ✅ Piani di allenamento in formato testo
- ✅ Piani dieta in formato CSV
- ✅ Fallback su parser manuale
- ✅ Integrazione in index.html (utenti)
- ✅ Integrazione in pro.html (professionisti)

## Supporto e Troubleshooting

### L'importazione non funziona
1. Verificare che la chiave API sia valida
2. Controllare la console browser per errori
3. Il sistema userà automaticamente il fallback manuale

### I dati non sono nel formato corretto
1. Gemini dovrebbe gestire la maggior parte dei formati
2. Se persiste, il parser manuale proverà a gestirlo
3. Verificare che il formato di input contenga le informazioni necessarie

### Errori di rete
- Il meccanismo di fallback gestisce automaticamente errori di rete
- I dati vengono processati localmente come fallback
