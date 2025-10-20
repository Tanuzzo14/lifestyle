# Lifestyle Designer - Sistema di Gestione Dati

## Modifiche Implementate

Questo progetto è stato modificato per salvare tutti i dati in un file `data.json` locale invece di utilizzare Firebase.

### File Creati

1. **api.php** - API REST per gestire la lettura e scrittura del file `data.json`
   - Supporta metodi GET, POST, PUT, DELETE
   - Gestisce CORS per chiamate cross-origin
   - Struttura dati JSON organizzata per userId

### File Modificati

1. **index.html** - Applicazione principale utente
   - Rimosso Firebase SDK
   - Implementato sistema di autenticazione basato su localStorage
   - Tutte le chiamate API ora utilizzano `api.php`
   - Hash password con funzione simpleHash per sicurezza base

2. **pro.html** - Dashboard professionista
   - Rimosso Firebase SDK
   - Implementato sistema di gestione clienti tramite API locale
   - Tutte le operazioni CRUD ora utilizzano `api.php`

## Come Funziona

### Autenticazione

Il sistema utilizza un approccio semplificato:
- Username viene convertito in un ID univoco tramite hash
- Password viene hashata e salvata in `data.json`
- Sessione utente salvata in localStorage del browser

### Struttura dati.json

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
    }
  },
  "userId2": { ... }
}
```

### API Endpoints

**GET** - Lettura dati
- `api.php?userId=xxx` - Ottiene dati di un utente specifico
- `api.php` - Ottiene tutti i dati (admin)

**POST/PUT** - Salvataggio dati
```json
{
  "userId": "xxx",
  "data": { ... }
}
```

**DELETE** - Eliminazione utente
```json
{
  "userId": "xxx"
}
```

## Requisiti

- Server web con supporto PHP (Apache, Nginx, ecc.)
- PHP 7.0 o superiore
- Permessi di scrittura nella directory per creare/modificare `data.json`

## Installazione

1. Caricare tutti i file su un server web con PHP
2. Assicurarsi che la directory abbia permessi di scrittura:
   ```bash
   chmod 755 /percorso/della/directory
   ```
3. Il file `data.json` verrà creato automaticamente al primo utilizzo

## Sicurezza

**NOTA IMPORTANTE**: Questo sistema è progettato per scopi dimostrativi/educativi. Per un ambiente di produzione, considerare:
- Implementare un sistema di hash password più robusto (bcrypt, Argon2)
- Utilizzare HTTPS per tutte le comunicazioni
- Implementare rate limiting sull'API
- Aggiungere validazione input lato server
- Implementare sistema di sessioni PHP più sicuro
- Backup automatici di data.json
- Controllo accessi più granulare

## Testing

Per testare l'implementazione:
1. Aprire `index.html` in un browser
2. Registrare un nuovo utente
3. Verificare che i dati vengano salvati in `data.json`
4. Effettuare logout e login per verificare la persistenza

## Troubleshooting

### data.json non viene creato
- Verificare i permessi della directory
- Controllare i log del server PHP
- Verificare che `allow_url_fopen` sia abilitato in php.ini

### Errori CORS
- Verificare che gli header CORS siano correttamente impostati in api.php
- Se necessario, modificare `Access-Control-Allow-Origin` con il dominio specifico

### Dati non persistenti
- Controllare che il browser non stia bloccando localStorage
- Verificare la console del browser per errori JavaScript
- Controllare che api.php stia effettivamente salvando i dati
