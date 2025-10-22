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

Le chiavi API Gemini sono ora centralizzate in `config.js`:

```javascript
// Import configuration
import { CONFIG } from './config.js';

const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
const GEMINI_API_URL = CONFIG.GEMINI_API_URL;
```

**Nota importante**: Il file `config.js` non è incluso nel controllo di versione per motivi di sicurezza. Usa `config.example.js` come template per creare il tuo file `config.js` con le tue chiavi API.

### Modello Utilizzato
- **Modello**: `gemini-2.0-flash`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
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

⚠️ **IMPORTANTE**: La chiave API è attualmente hardcoded nel codice client-side. Per un ambiente di produzione:

1. **Spostare la chiave lato server**: Creare un endpoint PHP che faccia da proxy per le chiamate OpenAI
2. **Usare variabili d'ambiente**: Non committare mai chiavi API nel repository
3. **Implementare rate limiting**: Prevenire abusi dell'API
4. **Aggiungere autenticazione**: Assicurarsi che solo utenti autenticati possano usare la funzionalità

### Esempio di Implementazione Sicura (Raccomandato)

Creare un file `gemini_proxy.php`:

```php
<?php
header('Content-Type: application/json');

// Verifica autenticazione utente
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(['error' => 'Non autenticato']));
}

$apiKey = getenv('GEMINI_API_KEY'); // Da variabile d'ambiente
$input = json_decode(file_get_contents('php://input'), true);

// Forward request to Gemini
// ... implementazione proxy ...
```

Quindi modificare le chiamate client per usare il proxy locale invece di chiamare direttamente Gemini.

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
