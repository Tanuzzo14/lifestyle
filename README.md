# Lifestyle Designer - Sistema di Gestione Dati

## Sistema di Persistenza Dati

Questo progetto utilizza **localStorage** del browser per salvare tutti i dati dell'applicazione, rendendola compatibile con GitHub Pages e qualsiasi hosting di file statici.

## Deployment

### GitHub Pages (Consigliato)
L'applicazione è progettata per funzionare perfettamente su GitHub Pages senza bisogno di backend:
1. Fare push del codice su GitHub
2. Abilitare GitHub Pages nelle impostazioni del repository
3. L'applicazione sarà accessibile su `https://username.github.io/repository-name/`

### Hosting Locale
Per testare in locale:
```bash
# Usando Python
python3 -m http.server 8000

# Usando Node.js
npx http-server -p 8000

# Usando PHP (opzionale, api.php non necessario)
php -S localhost:8000
```

## Come Funziona

### Autenticazione

Il sistema utilizza un approccio semplificato basato su localStorage:
- Username viene convertito in un ID univoco tramite hash
- Password viene hashata e salvata nel localStorage
- Sessione utente salvata in localStorage del browser
- Tutti i dati persistono nel browser dell'utente

### Struttura Dati in localStorage

I dati vengono salvati nella chiave `lifestyle_data` del localStorage:

```json
{
  "userId1": {
    "userType": "user" | "pro",
    "displayUsername": "USERNAME",
    "passwordHash": "hash",
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

### API Simulata

L'applicazione include una funzione `apiCall()` che simula chiamate API ma opera interamente con localStorage:
- **GET** - Lettura dati da localStorage
- **POST/PUT** - Salvataggio dati in localStorage
- **DELETE** - Eliminazione dati da localStorage

## Caratteristiche

### Per Utenti Normali
- ✅ Registrazione e login
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

## Sicurezza

**NOTA IMPORTANTE**: Questo sistema è progettato per scopi dimostrativi/educativi. Per un ambiente di produzione, considerare:
- ⚠️ I dati sono salvati in chiaro nel localStorage (accessibili via DevTools)
- ⚠️ L'hash delle password usa una funzione semplice (non bcrypt/Argon2)
- ⚠️ Non c'è sincronizzazione cloud - i dati sono solo locali al browser
- ⚠️ Cancellando la cache/localStorage si perdono tutti i dati
- ✅ Per produzione: implementare backend con database, autenticazione JWT, HTTPS

## Testing

Per testare l'implementazione:
1. Aprire `index.html` in un browser
2. Registrare un nuovo utente (tipo "Utente" o "Professionista della salute")
3. I dati vengono salvati automaticamente in localStorage
4. Effettuare logout e login per verificare la persistenza
5. Controllare DevTools > Application > Local Storage per vedere i dati

## Troubleshooting

### Dati non persistono
- Verificare che il browser non stia in modalità incognito/privata
- Controllare che il browser non stia bloccando localStorage
- Verificare la console del browser per errori JavaScript
- Controllare DevTools > Application > Local Storage per vedere se i dati sono presenti

### Errori 405 o problemi con api.php
- ✅ **RISOLTO**: L'applicazione ora non usa più api.php
- Se vedete ancora errori 405, svuotate la cache del browser
- L'applicazione funziona completamente con localStorage

### Perdita dati
- I dati sono salvati solo localmente nel browser
- Cancellare cookie/cache cancella anche i dati
- Per backup: esportare i dati dal localStorage manualmente

## File del Progetto

- **index.html** - Applicazione principale utente
- **pro.html** - Dashboard professionista
- **api.php** - File legacy (non più utilizzato su GitHub Pages)
- **test_api.html** - Test API legacy (non più utilizzato)

## Requisiti

- Browser moderno con supporto per:
  - localStorage API
  - ES6+ JavaScript
  - CSS Grid/Flexbox
- Nessun server o backend richiesto!
