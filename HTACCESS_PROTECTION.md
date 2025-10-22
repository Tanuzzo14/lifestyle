# Protezione .htaccess per File Sensibili

## Panoramica

È stato aggiunto un file `.htaccess` alla root del progetto per proteggere i file sensibili dall'accesso diretto tramite browser. Questo è un componente di sicurezza essenziale per proteggere le chiavi API, i dati degli utenti e altri file di configurazione.

## File Protetti

### File Completamente Bloccati

I seguenti file sono completamente inaccessibili tramite richieste HTTP dirette:

1. **config.js** - Contiene le chiavi API e altre configurazioni sensibili
2. **data.json** - Contiene tutti i dati degli utenti
3. **File di backup** (*.backup, *.bak, *.tmp, *.swp) - File temporanei e di backup
4. **File nascosti** (.git*, .env, ecc.) - File di sistema e configurazione

### File Accessibili

I seguenti file rimangono accessibili per il corretto funzionamento dell'applicazione:

1. **api.php** - Endpoint API per operazioni CRUD sui dati utente
2. **auth.js** - Modulo di autenticazione caricato dalle pagine HTML
3. **index.html** e altre pagine HTML - Interfaccia utente
4. **config.example.js** - Template di configurazione (non contiene chiavi reali)

## Funzionalità di Sicurezza

Il file `.htaccess` implementa le seguenti misure di sicurezza:

### 1. Protezione File
- Blocca l'accesso diretto a file di configurazione e dati
- Impedisce il download di file di backup
- Protegge i file nascosti (.git, .env, ecc.)

### 2. Prevenzione Directory Listing
- Disabilita la visualizzazione del contenuto delle directory

### 3. Protezione da Injection
- Filtra query string malevole
- Blocca tentativi di injection comuni

### 4. Header di Sicurezza HTTP
- **X-Frame-Options**: Previene attacchi clickjacking
- **X-Content-Type-Options**: Previene MIME sniffing
- **X-XSS-Protection**: Abilita protezione XSS nel browser

### 5. Configurazione PHP
- Disabilita la visualizzazione degli errori in produzione
- Abilita il logging degli errori
- Nasconde la versione di PHP

## Test della Protezione

### Test Manuale

Dopo aver deployato l'applicazione su un server con Apache:

1. Prova ad accedere direttamente a `https://tuo-dominio.com/config.js`
   - **Risultato atteso**: Errore 403 Forbidden

2. Prova ad accedere direttamente a `https://tuo-dominio.com/data.json`
   - **Risultato atteso**: Errore 403 Forbidden

3. Verifica che l'applicazione funzioni normalmente
   - **Risultato atteso**: Login, registrazione e tutte le funzionalità funzionano

### Test Automatizzato

È disponibile una pagina di test: `test_htaccess.html`

1. Carica l'applicazione su un server Apache
2. Apri `https://tuo-dominio.com/test_htaccess.html`
3. Clicca su "Esegui Test"
4. Verifica che tutti i test passino:
   - ✓ config.js protetto
   - ✓ data.json protetto
   - ✓ api.php accessibile
   - ✓ auth.js accessibile
   - ✓ index.html accessibile

## Requisiti

### Server Requirements

- **Apache 2.x** con mod_rewrite abilitato
- **PHP 7.x o superiore**
- File `.htaccess` abilitato nella configurazione Apache

### Verifica Configurazione Apache

Assicurati che nel file di configurazione Apache (es. `/etc/apache2/apache2.conf` o nel Virtual Host) sia presente:

```apache
<Directory /percorso/alla/tua/applicazione>
    AllowOverride All
</Directory>
```

E che i seguenti moduli siano abilitati:

```bash
# Abilita moduli necessari
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

## HTTPS (Opzionale ma Raccomandato)

Il file .htaccess include una regola commentata per forzare HTTPS. Per abilitarla:

1. Ottieni un certificato SSL (es. con Let's Encrypt)
2. Decommentare le righe nel file .htaccess:

```apache
# Forza HTTPS
<IfModule mod_rewrite.c>
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

## Troubleshooting

### Errore 500 Internal Server Error

Se ottieni un errore 500 dopo aver aggiunto .htaccess:

1. Verifica che `AllowOverride All` sia configurato in Apache
2. Controlla i log di Apache: `sudo tail -f /var/log/apache2/error.log`
3. Verifica che mod_rewrite sia abilitato: `apache2ctl -M | grep rewrite`

### L'applicazione non funziona

Se l'applicazione non carica correttamente:

1. Verifica che api.php sia accessibile
2. Controlla la console del browser per errori JavaScript
3. Verifica che auth.js sia caricabile
4. Controlla che il CORS sia configurato correttamente in api.php

### PHP Built-in Server

**Nota importante**: Il server PHP built-in (`php -S`) **NON** supporta file .htaccess. Per testare la protezione, devi usare Apache.

## Note di Sicurezza

1. **config.js non deve mai essere committato**: Il file è già in `.gitignore`
2. **Permessi file**: Assicurati che data.json abbia i permessi corretti (660 o 664)
3. **Backup regolari**: Fai backup regolari di data.json
4. **HTTPS in produzione**: Usa sempre HTTPS in produzione
5. **Aggiorna regolarmente**: Mantieni Apache e PHP aggiornati

## Struttura File

```
lifestyle/
├── .htaccess              # ← Nuovo file di protezione
├── .gitignore             # Esclude config.js e data.json
├── api.php                # API endpoint (accessibile)
├── auth.js                # Modulo autenticazione (accessibile)
├── config.js              # File con chiavi API (protetto, non committato)
├── config.example.js      # Template configurazione (accessibile)
├── data.json              # Dati utenti (protetto, non committato)
├── index.html             # Pagina principale (accessibile)
├── test_htaccess.html     # ← Nuovo file per test protezione
└── ...
```

## Contatti

Per problemi o domande sulla sicurezza, aprire una issue nel repository GitHub.
