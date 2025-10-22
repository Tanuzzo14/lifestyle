# Lifestyle Designer - Sistema di Gestione Dati

## Sistema di Persistenza Dati

Questo progetto utilizza **data.json** (tramite api.php) per salvare tutti i dati dell'applicazione su server, permettendo l'accesso multi-dispositivo. I dati vengono memorizzati nel file data.json sul server e sincronizzati tra diversi dispositivi.

## Configurazione

### Setup Chiavi API

Il progetto utilizza chiavi API (es. Gemini API) che sono centralizzate in un file di configurazione separato per motivi di sicurezza.

**Prima di utilizzare l'applicazione**:

1. Copia il file template di configurazione:
   ```bash
   cp config.example.js config.js
   ```

2. Modifica `config.js` inserendo le tue chiavi API:
   ```javascript
   export const CONFIG = {
     GEMINI_API_KEY: 'LA_TUA_CHIAVE_API_QUI',
     GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
   };
   ```

3. **Importante**: Il file `config.js` è escluso dal controllo di versione (`.gitignore`) per proteggere le chiavi sensibili.

## Deployment

### Hosting con PHP
L'applicazione richiede un server PHP per la persistenza dei dati:
1. Caricare tutti i file su un server con supporto PHP
2. Creare il file `config.js` con le proprie chiavi API (vedi sezione Configurazione)
3. Assicurarsi che il file data.json sia scrivibile dal server (permessi 666 o 777)
4. L'applicazione sarà accessibile all'URL del server

### Hosting Locale (per test)
Per testare in locale con PHP:
```bash
# Usando PHP built-in server
php -S localhost:8000

# L'applicazione sarà disponibile su http://localhost:8000
```

**Nota**: data.json viene creato automaticamente alla prima registrazione utente.

## Come Funziona

### Autenticazione

Il sistema utilizza api.php e data.json per l'autenticazione:
- Username viene convertito in un ID univoco tramite hash
- Password viene hashata e salvata in data.json sul server
- Sessione utente salvata in localStorage del browser per accesso rapido
- Tutti i dati utente persistono in data.json sul server
- **Accesso multi-dispositivo**: i dati sono accessibili da qualsiasi dispositivo connesso al server
- **BASE_USER automatico**: Gli utenti che si registrano autonomamente (non creati da un professionista) vengono automaticamente assegnati a un allenatore speciale chiamato BASE_USER per tracciamento centralizzato

### Modulo di Autenticazione (auth.js)

La logica di autenticazione è stata separata in un modulo dedicato (`auth.js`) che può essere riutilizzato:

```javascript
// Importa il modulo di autenticazione
import { Auth } from './auth.js';

// Login
const user = await Auth.login(username, password, displayErrorCallback);

// Registrazione
const newUser = await Auth.register(username, password, userType, displayErrorCallback);

// Verifica autenticazione
const currentUser = await Auth.checkAuth();

// Logout
Auth.logout();
```

Questo approccio modulare:
- ✅ Separa la logica di autenticazione dalla dashboard
- ✅ Rende il codice più mantenibile
- ✅ Permette di riutilizzare l'autenticazione in altre pagine
- ✅ Facilita i test unitari

### Struttura Dati in data.json

I dati vengono salvati nel file `data.json` sul server tramite api.php:

```json
{
  "userId1": {
    "userType": "user" | "pro",
    "displayUsername": "USERNAME",
    "passwordHash": "hash_della_password",
    "data": {
      "habits": [],
      "workout": [],
      "diet": [],
      "dietPlan": {},
      "measurementsLog": [],
      "dailyCompliance": {}
    },
    "clients": []
  },
  "userId2": { ... }
}
```

### API PHP

L'applicazione include `api.php` che gestisce tutte le operazioni CRUD con data.json:
- **GET** - Lettura dati utente da data.json
- **POST/PUT** - Salvataggio dati utente in data.json (include passwordHash)
- **DELETE** - Eliminazione dati utente da data.json

Il file data.json viene creato automaticamente al primo utilizzo.

## Caratteristiche

### Per Utenti Normali
- ✅ Registrazione e login con password salvata su server
- ✅ Accesso multi-dispositivo tramite data.json
- ✅ Assegnazione automatica a BASE_USER per tracciamento centralizzato
- ✅ Monitoraggio abitudini giornaliere
- ✅ Gestione piano di allenamento
- ✅ Gestione piano dieta
- ✅ Tracciamento misure corporee
- ✅ Compliance giornaliera e mensile
- ✅ Timer sonno con ipnogramma

### Per Professionisti della Salute
- ✅ Dashboard professionale
- ✅ Gestione multipli clienti
- ✅ Creazione account utenti
- ✅ Modifica piani allenamento/dieta
- ✅ Visualizzazione progressi clienti
- ✅ Accesso multi-dispositivo ai dati clienti

## Sicurezza

**NOTA IMPORTANTE**: Questo sistema salva i dati su server tramite data.json. Considerazioni di sicurezza:
- ✅ I dati sono salvati sul server in data.json (non solo nel browser)
- ✅ Le password sono hashate prima di essere salvate in data.json
- ✅ Accesso multi-dispositivo abilitato tramite server
- ⚠️ L'hash delle password usa una funzione semplice (non bcrypt/Argon2)
- ⚠️ data.json è un file JSON in chiaro sul server
- ⚠️ Non c'è crittografia dei dati sensibili
- ⚠️ Assicurarsi che data.json non sia accessibile pubblicamente via web
- ✅ Per produzione: implementare HTTPS, hash bcrypt, crittografia database

## Testing

Per testare l'implementazione:
1. Creare il file `config.js` con le proprie chiavi API (vedere sezione Configurazione)
2. Avviare un server PHP locale: `php -S localhost:8000`
3. Aprire `http://localhost:8000/index.html` in un browser
4. Registrare un nuovo utente (tipo "Utente" o "Professionista della salute")
5. I dati vengono salvati automaticamente in data.json sul server
6. Effettuare logout e login per verificare la persistenza
7. Aprire l'applicazione in un altro browser/tab e login con lo stesso utente
8. Verificare che i dati siano sincronizzati tra i dispositivi
9. Controllare il file data.json per vedere i dati salvati (include passwordHash)

## Troubleshooting

### Dati non persistono
- Verificare che il server PHP sia in esecuzione
- Controllare che data.json esista e sia scrivibile (permessi)
- Verificare la console del browser per errori API
- Controllare che api.php sia accessibile

### Errori di connessione all'API
- ✅ **RISOLTO**: L'applicazione ora usa api.php per data.json
- Verificare che il server PHP sia avviato
- Controllare che api.php sia nella stessa directory di index.html
- Verificare i permessi del file data.json

### Perdita dati
- I dati sono salvati in data.json sul server
- Fare backup regolari del file data.json
- Non cancellare data.json senza prima fare un backup
- Considerare l'uso di un database per ambienti di produzione

## File del Progetto

- **index.html** - Applicazione principale utente (usa api.php per data.json)
- **auth.js** - Modulo di autenticazione separato (login, registrazione, logout, BASE_USER)
- **pro.html** - Dashboard professionista (usa api.php per data.json)
- **api.php** - API PHP per gestione data.json (lettura/scrittura/eliminazione)
- **config.js** - File di configurazione con chiavi API (NON incluso nel repository, creare da config.example.js)
- **config.example.js** - Template per il file di configurazione
- **data.json** - File di storage dati sul server (creato automaticamente)
- **test_api.html** - Test API (per verificare funzionamento api.php)
- **test_auth.html** - Test modulo autenticazione (per verificare auth.js)
- **test_auth_module.js** - Script Node.js per test automatici del modulo auth
- **test_base_user.html** - Test interattivi per feature BASE_USER
- **test_base_user_creation.js** - Test automatici per creazione BASE_USER
- **test_gemini_api.html** - Test integrazione Gemini API
- **BASE_USER_FEATURE.md** - Documentazione completa feature BASE_USER

## Requisiti

- Server web con supporto PHP (PHP 7.0 o superiore)
- Permessi di scrittura per data.json
- Browser moderno con supporto per:
  - localStorage API (per sessione utente)
  - Fetch API (per chiamate a api.php)
  - ES6+ JavaScript
  - CSS Grid/Flexbox
